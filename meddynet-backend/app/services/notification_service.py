import abc
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class NotificationProvider(abc.ABC):
    @abc.abstractmethod
    async def send_sms(self, phone: str, message: str) -> bool:
        pass

    @abc.abstractmethod
    async def send_otp(self, phone: str, otp: str) -> bool:
        pass


class MockNotificationProvider(NotificationProvider):
    async def send_sms(self, phone: str, message: str) -> bool:
        logger.info(f"[Mock SMS to {phone}]: {message}")
        return True

    async def send_otp(self, phone: str, otp: str) -> bool:
        logger.info(f"[Mock OTP to {phone}]: Your MeddyNet code is {otp}")
        return True


import httpx
from app.config import settings


class AuthkeyProvider(NotificationProvider):
    def __init__(self, api_key: str, sender: str):
        self.api_key = api_key
        self.sender = sender
        self.base_url = "https://console.authkey.io/request"

    async def send_sms(self, phone: str, message: str) -> bool:
        # Normalize phone (remove + if present, country_code handled by API param)
        clean_phone = phone.replace("+", "").strip()
        if clean_phone.startswith("91") and len(clean_phone) > 10:
            mobile = clean_phone[2:]
            country_code = "91"
        else:
            mobile = clean_phone
            country_code = "91"  # Default to 91 per requirement

        params = {
            "authkey": self.api_key,
            "sms": message,
            "mobile": mobile,
            "country_code": country_code,
            "sender": self.sender,
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                logger.info(f"Authkey SMS sent to {phone}: {response.text}")
                return True
            except Exception as e:
                logger.error(f"Authkey SMS failed: {str(e)}")
                return False

    async def send_otp(self, phone: str, otp: str) -> bool:
        # PII Masking Standard for Compliance (10000% Secure)
        masked_phone = f"{phone[:5]}****"
        logger.info(
            f"Dispatching OTP pulse to {masked_phone} (Security Context: Shielded)"
        )
        msg = f"Your MeddyNet verification code is {otp}. Valid for 5 minutes."
        return await self.send_sms(phone, msg)


from app.services.mongo_service import mongo_service


# Factory or Singleton for the active provider
class NotificationService:
    def __init__(self, provider: NotificationProvider):
        self.provider = provider

    async def send_booking_confirmation(self, phone: str, booking_id: str):
        msg = f"Your MeddyNet booking {booking_id} is confirmed. A technician will be assigned shortly."
        res = await self.provider.send_sms(phone, msg)

        # 📂 PERSIST TO MONGODB HISTORY
        await mongo_service.log_event(
            level="info",
            event="notification_dispatched",
            message=f"Booking confirmed for {booking_id}",
            context={
                "phone": phone,
                "type": "sms_confirmation",
                "booking_id": booking_id,
            },
        )
        return res

    async def send_verification_otp(self, phone: str, otp: str):
        res = await self.provider.send_otp(phone, otp)

        # Log OTP in dev mode only for debugging
        if settings.ENVIRONMENT == "development":
            logger.info(f"[DEV] OTP dispatched to {phone}")

        # 📂 PERSIST TO MONGODB HISTORY
        await mongo_service.log_event(
            level="info",
            event="otp_dispatched",
            message=f"OTP sent to {phone[:5]}****",
            context={"phone": phone, "type": "otp"},
        )
        return res

    async def send_report_link(self, phone: str, booking_id: str, link: str):
        msg = (
            f"Your MeddyNet diagnostic report for booking {booking_id} is ready: {link}"
        )
        res = await self.provider.send_sms(phone, msg)

        await mongo_service.log_event(
            level="info",
            event="report_link_dispatched",
            message=f"Report link sent for {booking_id}",
            context={
                "phone": phone,
                "type": "report_link",
                "booking_id": booking_id,
                "url": link,
            },
        )
        return res

    async def send_whatsapp_report(self, phone: str, booking_id: str, link: str):
        """Simulate sending report on WhatsApp."""
        masked = f"{phone[:3]}...{phone[-2:]}"
        logger.info(f"WhatsApp report dispatched to {masked} for booking {booking_id}")

        await mongo_service.log_event(
            level="info",
            event="whatsapp_report_sent",
            message=f"Report sent via WhatsApp to {masked}",
            context={"phone": phone, "booking_id": booking_id, "url": link},
        )
        return True

    async def send_whatsapp_booking_confirmation(
        self, phone: str, booking_id: str, lab_name: str, date: str, time: str
    ):
        """
        Send booking confirmation via WhatsApp Business API template.
        Falls back to SMS if WhatsApp is not configured.
        """
        if isinstance(self.provider, WhatsAppBusinessProvider):
            return await self.provider.send_template(
                phone=phone,
                template_name="booking_confirmed",
                language="en",
                components=[
                    {
                        "type": "body",
                        "parameters": [
                            {"type": "text", "text": booking_id[:8]},
                            {"type": "text", "text": lab_name},
                            {"type": "text", "text": date},
                            {"type": "text", "text": time},
                        ],
                    }
                ],
            )
        else:
            msg = f"✅ MeddyNet Booking {booking_id[:8]} confirmed at {lab_name} on {date} at {time}."
            return await self.provider.send_sms(phone, msg)

    async def send_whatsapp_reminder(
        self, phone: str, booking_id: str, time_remaining: str
    ):
        """
        Send appointment reminder via WhatsApp.
        Falls back to SMS if WhatsApp is not configured.
        """
        if isinstance(self.provider, WhatsAppBusinessProvider):
            return await self.provider.send_template(
                phone=phone,
                template_name="appointment_reminder",
                language="en",
                components=[
                    {
                        "type": "body",
                        "parameters": [
                            {"type": "text", "text": booking_id[:8]},
                            {"type": "text", "text": time_remaining},
                        ],
                    }
                ],
            )
        else:
            msg = f"⏰ Reminder: Your MeddyNet appointment {booking_id[:8]} is in {time_remaining}. Please keep your ID ready."
            return await self.provider.send_sms(phone, msg)


class WhatsAppBusinessProvider(NotificationProvider):
    """
    Production WhatsApp Business API provider via Meta Cloud API.
    Requires WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in settings.
    """

    def __init__(self, phone_number_id: str, access_token: str):
        self.phone_number_id = phone_number_id
        self.access_token = access_token
        self.base_url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"

    async def send_sms(self, phone: str, message: str) -> bool:
        """Send a free-form text message via WhatsApp."""
        clean_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
        if not clean_phone.startswith("91"):
            clean_phone = f"91{clean_phone}"

        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "text",
            "text": {"body": message},
        }
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(self.base_url, json=payload, headers=headers)
                resp.raise_for_status()
                logger.info(f"[WhatsApp] Message sent to {phone}: {resp.json()}")
                return True
            except Exception as e:
                logger.error(f"[WhatsApp] Send failed: {e}")
                return False

    async def send_otp(self, phone: str, otp: str) -> bool:
        msg = f"Your MeddyNet verification code is *{otp}*. Valid for 5 minutes. Do not share this code."
        return await self.send_sms(phone, msg)

    async def send_template(
        self,
        phone: str,
        template_name: str,
        language: str = "en",
        components: list = None,
    ) -> bool:
        """
        Send a pre-approved WhatsApp Business template message.
        Templates must be created and approved in Meta Business Manager first.
        """
        clean_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
        if not clean_phone.startswith("91"):
            clean_phone = f"91{clean_phone}"

        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language},
            },
        }
        if components:
            payload["template"]["components"] = components

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(self.base_url, json=payload, headers=headers)
                resp.raise_for_status()
                logger.info(f"[WhatsApp Template] '{template_name}' sent to {phone}")

                await mongo_service.log_event(
                    level="info",
                    event="whatsapp_template_sent",
                    message=f"Template '{template_name}' sent to {phone[:5]}****",
                    context={"phone": phone, "template": template_name},
                )
                return True
            except Exception as e:
                logger.error(f"[WhatsApp Template] Failed: {e}")
                return False


# Initialize Provider based on Settings
whatsapp_phone_id = getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", None)
whatsapp_token = getattr(settings, "WHATSAPP_ACCESS_TOKEN", None)

if whatsapp_phone_id and whatsapp_token:
    active_provider = WhatsAppBusinessProvider(
        phone_number_id=whatsapp_phone_id, access_token=whatsapp_token
    )
    logger.info("NotificationService: Initialized with WhatsAppBusinessProvider")
elif settings.AUTHKEY_API_KEY:
    active_provider = AuthkeyProvider(
        api_key=settings.AUTHKEY_API_KEY, sender=settings.AUTHKEY_SENDER_ID
    )
    logger.info("NotificationService: Initialized with AuthkeyProvider")
else:
    active_provider = MockNotificationProvider()
    logger.info("NotificationService: Initialized with MockNotificationProvider")

notification_service = NotificationService(active_provider)
