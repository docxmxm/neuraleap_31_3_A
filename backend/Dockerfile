FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=myproject.settings
ENV ENVIRONMENT=production

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Run database migrations and collect static files
RUN python manage.py collectstatic --noinput

# Add entrypoint script
RUN echo '#!/bin/bash\n\
python manage.py migrate --noinput\n\
exec gunicorn myproject.wsgi:application --bind 0.0.0.0:8000\n\
' > /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

# Run the application
ENTRYPOINT ["/app/entrypoint.sh"] 