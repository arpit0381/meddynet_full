from app.database import Base

# Import all models to ensure they are registered with Base.metadata before Alembic uses it
from .user import User
from .lab import Lab, LabTest
from .technician import Technician
from .booking import Booking, BookingTest
from .payment import Payment, LabWallet, Ledger
from .report import Report
from .review import Review
from .health_record import HealthRecord
from .support import SupportTicket
