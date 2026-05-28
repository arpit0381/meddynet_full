import csv
import io
import logging
from datetime import datetime

from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.models.booking import Booking
from app.models.user import User
from app.models.lab import Lab
from sqlalchemy.future import select

logger = logging.getLogger(__name__)

# Mock storage service - in reality this would be S3/GCS
async def upload_to_storage(filename: str, content: bytes) -> str:
    # Simulating upload delay
    import asyncio
    await asyncio.sleep(2)
    # Returning a mock URL
    return f"https://storage.meddynet.com/exports/{filename}"

@celery_app.task
def export_bookings_to_csv(email_to: str):
    """
    Background task to generate a CSV report of all bookings 
    and 'email' it (or provide a download link) to the admin.
    """
    logger.info(f"Starting bookings CSV export requested by {email_to}")
    
    # Celery tasks are synchronous by default, but our DB is async.
    # We must run the async query inside an event loop.
    import asyncio
    
    async def generate_csv():
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Booking, User.name.label("user_name"), Lab.name.label("lab_name"))
                .join(User, Booking.user_id == User.id)
                .join(Lab, Booking.lab_id == Lab.id)
                .order_by(Booking.created_at.desc())
            )
            rows = result.all()
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Header
            writer.writerow([
                "Booking ID", "Date", "Status", "Total Amount (INR)", 
                "Patient Name", "Lab Name", "Type"
            ])
            
            for row in rows:
                booking = row[0]
                writer.writerow([
                    str(booking.id),
                    booking.created_at.isoformat(),
                    booking.status.value,
                    booking.total_amount_paise / 100,
                    row[1],
                    row[2],
                    booking.type.value
                ])
                
            csv_content = output.getvalue().encode('utf-8')
            filename = f"bookings_export_{datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
            
            url = await upload_to_storage(filename, csv_content)
            logger.info(f"Export complete. File available at {url}")
            
            # Here we would normally trigger an email to `email_to` with the link.
            # E.g., send_email(to=email_to, subject="Export Ready", body=f"Download: {url}")
            
            return {"status": "success", "url": url, "rows_exported": len(rows)}

    # Run the async function synchronously
    result = asyncio.run(generate_csv())
    return result
