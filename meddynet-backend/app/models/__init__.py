# Import all models to ensure they are registered with Base.metadata before Alembic uses it
from .booking import Booking
from .health_record import HealthRecord
from .lab import Lab
from .payment import Payment
from .report import Report
from .review import Review
from .support import SupportTicket
from .technician import Technician
from .user import User

__all__ = [
    "Booking",
    "HealthRecord",
    "Lab",
    "Payment",
    "Report",
    "Review",
    "SupportTicket",
    "Technician",
    "User",
]
