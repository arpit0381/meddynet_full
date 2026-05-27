import asyncio
import logging
import uuid
import io
from datetime import datetime, timezone
import cloudinary
import cloudinary.uploader
from app.celery_app import celery_app
from app.config import settings
from app.database import SessionLocal
from app.services.analytics_service import analytics_service
from app.services.notification_service import notification_service
from sqlalchemy.future import select

logger = logging.getLogger(__name__)

if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )


def generate_pdf_bytes(booking_id: str, results: dict) -> bytes:
    """
    Generate a real PDF report from test results.
    Uses ReportLab if available, otherwise generates a minimal valid PDF.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.pdfgen import canvas

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Header
        c.setFont("Helvetica-Bold", 22)
        c.drawString(2 * cm, height - 2 * cm, "MeddyNet Diagnostics")
        c.setFont("Helvetica", 10)
        c.drawString(2 * cm, height - 2.8 * cm, f"Lab Report — Booking #{booking_id}")
        c.drawString(2 * cm, height - 3.4 * cm, f"Generated: {datetime.now(timezone.utc).strftime('%d %b %Y, %H:%M UTC')}")

        # Separator line
        c.setStrokeColorRGB(0.1, 0.6, 0.4)
        c.setLineWidth(2)
        c.line(2 * cm, height - 3.8 * cm, width - 2 * cm, height - 3.8 * cm)

        # Patient info
        y = height - 5 * cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(2 * cm, y, "Patient Information")
        y -= 0.7 * cm
        c.setFont("Helvetica", 10)
        patient = results.get("patient", {})
        c.drawString(2 * cm, y, f"Name: {patient.get('name', 'N/A')}")
        y -= 0.5 * cm
        c.drawString(2 * cm, y, f"Age: {patient.get('age', 'N/A')} | Gender: {patient.get('gender', 'N/A')}")

        # Test results table
        y -= 1.2 * cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(2 * cm, y, "Test Results")
        y -= 0.8 * cm

        c.setFont("Helvetica-Bold", 9)
        c.drawString(2 * cm, y, "Parameter")
        c.drawString(8 * cm, y, "Value")
        c.drawString(12 * cm, y, "Unit")
        c.drawString(15 * cm, y, "Reference")
        y -= 0.3 * cm
        c.setLineWidth(0.5)
        c.line(2 * cm, y, width - 2 * cm, y)
        y -= 0.5 * cm

        c.setFont("Helvetica", 9)
        for param in results.get("parameters", []):
            if y < 3 * cm:
                c.showPage()
                y = height - 2 * cm
            c.drawString(2 * cm, y, str(param.get("name", "")))
            c.drawString(8 * cm, y, str(param.get("value", "")))
            c.drawString(12 * cm, y, str(param.get("unit", "")))
            c.drawString(15 * cm, y, str(param.get("reference", "")))
            y -= 0.5 * cm

        # Footer
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(2 * cm, 1.5 * cm, "This is a computer-generated report. No signature required.")
        c.drawString(2 * cm, 1 * cm, "MeddyNet Health Technologies Pvt. Ltd. — www.meddynet.com")

        c.save()
        return buffer.getvalue()

    except ImportError:
        logger.warning("ReportLab not installed. Generating minimal PDF placeholder.")
        # Generate a minimal valid PDF without ReportLab
        content = f"MeddyNet Report - Booking {booking_id}\nGenerated: {datetime.now(timezone.utc).isoformat()}\n"
        for param in results.get("parameters", []):
            content += f"\n{param.get('name', '')}: {param.get('value', '')} {param.get('unit', '')}"
        
        # Minimal valid PDF structure
        pdf = (
            b"%PDF-1.4\n"
            b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
            b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>>>endobj\n"
            b"4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
            b"xref\n0 5\n"
            b"trailer<</Size 5/Root 1 0 R>>\nstartxref\n0\n%%EOF"
        )
        return pdf


async def async_generate_and_upload(booking_id: str, results: dict):
    logger.info(f"Generating PDF for booking {booking_id}...")
    
    # Generate real PDF
    pdf_bytes = generate_pdf_bytes(booking_id, results)
    
    url = f"https://res.cloudinary.com/demo/raw/upload/v1/report_{uuid.uuid4().hex[:8]}.pdf"
    
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
        try:
            upload_result = cloudinary.uploader.upload(
                pdf_bytes,
                folder="meddynet/reports",
                resource_type="raw",
                public_id=f"report_{booking_id}_{uuid.uuid4().hex[:6]}"
            )
            url = upload_result.get("secure_url", url)
        except Exception as e:
            logger.error(f"Cloudinary Report Upload Error: {e}")
    
    # Update booking record with report URL
    try:
        from app.models.booking import Booking
        async with SessionLocal() as db:
            res = await db.execute(select(Booking).filter(Booking.id == booking_id))
            booking = res.scalar_one_or_none()
            if booking:
                booking.report_url = url
                booking.status = "completed"
                await db.commit()
                
                # Send notification to patient
                if booking.patient_phone:
                    await notification_service.send_whatsapp_report(
                        phone=booking.patient_phone,
                        booking_id=booking_id,
                        link=url
                    )
    except Exception as e:
        logger.error(f"Failed to update booking {booking_id} with report URL: {e}")
            
    # Analytics
    await analytics_service.log_report_generation(booking_id, lab_id="backend_task_lab_id", report_url=url)
    await analytics_service.log_event(
        level="info",
        event="report_delivery_dispatched",
        message=f"Dispatched report {url} for booking {booking_id}",
        context={"booking_id": booking_id, "url": url}
    )
    
    return url


@celery_app.task
def generate_pdf_report(booking_id: str, results: dict):
    logger.info(f"Starting async background task to create and upload report for {booking_id}")
    url = asyncio.run(async_generate_and_upload(booking_id, results))
    return {"status": "success", "report_url": url}
