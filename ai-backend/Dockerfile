FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set environment variables to prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies if required by any python packages (like PyPDF2 or websockets)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 8000

# Run uvicorn server
# Cloud Run expects the container to listen on the port defined by the PORT environment variable.
# We set 8000 as default but allow it to be overridden.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
