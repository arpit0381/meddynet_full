from app.database import Base

from .booking import Booking, BookingTest
from .health_record import HealthRecord
from .lab import Lab, LabTest
from .payment import LabWallet, Ledger, Payment
from .report import Report
from .review import Review
from .support import SupportTicket
from .technician import Technician

# Import all models to ensure they are registered with Base.metadata before Alembic uses it
from .user import User
