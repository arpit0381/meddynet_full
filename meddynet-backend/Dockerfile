FROM python:3.12-slim

WORKDIR /app

# Only install runtime dependencies to speed up build
# libpq5 is needed for postgres connectivity at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Standard pip install using binary wheels where available
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
