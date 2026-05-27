import redis.asyncio as redis
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Redis client connection with Error Handling
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.warning(
        f"Redis not available ({e}). Using in-process memory for OTP/Caching."
    )

    class MockRedis:
        def __init__(self):
            self.data = {}

        async def setex(self, name, time, value):
            self.data[name] = str(value)

        async def get(self, name):
            return self.data.get(name)

        async def delete(self, name):
            self.data.pop(name, None)

        async def exists(self, name):
            return 1 if name in self.data else 0

    redis_client = MockRedis()

# Initialize SlowAPI rate limiter
limiter = Limiter(key_func=get_remote_address)
