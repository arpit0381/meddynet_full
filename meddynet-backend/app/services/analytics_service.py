from app.services.mongo_service import mongo_service
from typing import Dict, Any, Optional


class AnalyticsService:
    async def log_conversion(
        self, booking_id: str, user_id: str, amount: int, lab_id: str
    ):
        """Logs a successful booking conversion."""
        await mongo_service.track_activity(
            user_id=user_id,
            action="booking_conversion",
            resource="booking",
            resource_id=booking_id,
            metadata={"amount": amount, "lab_id": lab_id},
        )
        await mongo_service.track_metric(
            name="total_booking_revenue", value=amount, tags={"lab_id": lab_id}
        )

    async def log_payout_success(self, lab_id: str, amount: int, payout_id: str):
        """Logs a successful payout to a Lab."""
        await mongo_service.track_activity(
            user_id=lab_id,
            action="payout_success",
            resource="lab_wallet",
            resource_id=payout_id,
            metadata={"amount": amount},
        )
        await mongo_service.track_metric(
            name="total_payout_volume", value=amount, tags={"lab_id": lab_id}
        )

    async def log_job_dispatch(self, booking_id: str, technician_id: str, lab_id: str):
        """Logs when a job is assigned to a technician."""
        await mongo_service.log_event(
            level="info",
            event="job_dispatched",
            message=f"Job {booking_id} assigned to technician {technician_id}",
            context={
                "technician_id": technician_id,
                "lab_id": lab_id,
                "booking_id": booking_id,
            },
        )

    async def log_report_generation(
        self, booking_id: str, lab_id: str, report_url: str
    ):
        """Logs generation and upload of a PDF report."""
        await mongo_service.log_event(
            level="info",
            event="report_generated",
            message=f"Report generated for {booking_id}",
            context={"lab_id": lab_id, "booking_id": booking_id, "url": report_url},
        )


analytics_service = AnalyticsService()
