FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (Chrome + ChromeDriver)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc wget gnupg2 unzip curl \
    chromium chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome environment variables
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy scraper code and backend models
COPY scraper/ .
COPY backend/app /app/backend/app

# Default command: run the scheduler
CMD ["python", "scheduler.py"]
