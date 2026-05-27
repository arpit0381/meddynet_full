from contextvars import ContextVar
from typing import Optional

# Global context for storing the authenticated user ID for the current request
# This is used by the database session to set Row Level Security (RLS) variables.
_user_id_ctx: ContextVar[Optional[str]] = ContextVar("user_id", default=None)


def set_current_user_id(user_id: str):
    """
    Sets the user_id in the current context.
    """
    _user_id_ctx.set(user_id)


def get_current_user_id() -> Optional[str]:
    """
    Retrieves the user_id from the current context.
    """
    return _user_id_ctx.get()
