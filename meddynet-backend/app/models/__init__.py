# Import all models to ensure they are registered with Base.metadata before Alembic uses it
from .booking import Booking
from .city import City
from .coupon import Coupon
from .health_record import HealthRecord
from .lab import Lab
from .payment import Payment
from .report import Report
from .review import Review
from .subscription import SubscriptionPlan
from .support import SupportTicket
from .technician import Technician
from .user import User

__all__ = [
    "Booking",
    "City",
    "Coupon",
    "HealthRecord",
    "Lab",
    "Payment",
    "Report",
    "Review",
    "SubscriptionPlan",
    "SupportTicket",
    "Technician",
    "User",
]
