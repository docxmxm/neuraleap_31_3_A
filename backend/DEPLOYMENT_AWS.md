# Deploying NeuralLeap on AWS

This document provides step-by-step instructions for deploying the NeuralLeap Django application on AWS.

## Option 1: AWS Elastic Beanstalk Deployment

AWS Elastic Beanstalk provides an easier way to deploy, manage, and scale web applications.

### Prerequisites

1. Install the AWS CLI and EB CLI:
   ```bash
   pip install awscli awsebcli
   ```

2. Configure AWS credentials:
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, region, and output format
   ```

### Preparing the Application for Deployment

1. Install required packages for deployment:
   ```bash
   pip install django-storages boto3
   ```

2. Update your `requirements.txt`:
   ```bash
   pip freeze > requirements.txt
   ```

3. Configure Django for production by updating `settings.py`:

   ```python
   # Production settings
   DEBUG = False
   ALLOWED_HOSTS = ['your-eb-environment.elasticbeanstalk.com', '.yourdomain.com']
   
   # Configure static files for S3
   INSTALLED_APPS += ['storages']
   
   # S3 configuration
   AWS_ACCESS_KEY_ID = 'your-access-key'  # Use environment variables
   AWS_SECRET_ACCESS_KEY = 'your-secret-key'  # Use environment variables
   AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'
   AWS_S3_REGION_NAME = 'your-region'
   AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
   AWS_DEFAULT_ACL = 'public-read'
   AWS_S3_OBJECT_PARAMETERS = {
       'CacheControl': 'max-age=86400',
   }
   
   # Static and media files
   AWS_LOCATION = 'static'
   STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
   STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_LOCATION}/'
   
   # Media files
   DEFAULT_FILE_STORAGE = 'myproject.storage_backends.MediaStorage'
   MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
   
   # Database configuration (RDS PostgreSQL)
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'your_db_name',
           'USER': 'your_db_user',
           'PASSWORD': 'your_db_password',
           'HOST': 'your-rds-endpoint.rds.amazonaws.com',
           'PORT': '5432',
       }
   }
   
   # Use environment variables for sensitive information
   import os
   SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
   STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
   STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
   STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')
   
   # HTTPS settings
   SECURE_SSL_REDIRECT = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   SECURE_HSTS_SECONDS = 31536000  # 1 year
   SECURE_HSTS_INCLUDE_SUBDOMAINS = True
   SECURE_HSTS_PRELOAD = True
   ```

4. Create a storage backend file `myproject/storage_backends.py`:
   ```python
   from storages.backends.s3boto3 import S3Boto3Storage
   
   class MediaStorage(S3Boto3Storage):
       location = 'media'
       file_overwrite = False
   ```

5. Create `.ebignore` file to exclude unnecessary files from deployment:
   ```
   .venv/
   .git/
   __pycache__/
   *.pyc
   *.pyo
   .DS_Store
   logs/
   ```

6. Create an `Procfile` in your project root:
   ```
   web: gunicorn myproject.wsgi --workers=3 --threads=3 --timeout=60 --log-file=-
   ```

7. Create `.ebextensions/01_django.config`:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:python:
       WSGIPath: myproject.wsgi:application
     aws:elasticbeanstalk:environment:proxy:staticfiles:
       /static: static
     aws:elasticbeanstalk:application:environment:
       DJANGO_SETTINGS_MODULE: myproject.settings
       SENDGRID_API_KEY: your-sendgrid-api-key
       STRIPE_SECRET_KEY: your-stripe-secret-key
       STRIPE_PUBLISHABLE_KEY: your-stripe-publishable-key
       STRIPE_WEBHOOK_SECRET: your-stripe-webhook-secret
       PYTHONPATH: "/var/app/current:$PYTHONPATH"
   
   container_commands:
     01_makemigrations:
       command: "source /var/app/venv/*/bin/activate && python manage.py makemigrations --noinput"
       leader_only: true
     02_migrate:
       command: "source /var/app/venv/*/bin/activate && python manage.py migrate --noinput"
       leader_only: true
     03_collectstatic:
       command: "source /var/app/venv/*/bin/activate && python manage.py collectstatic --noinput"
       leader_only: true
     04_createadmin:
       command: "source /var/app/venv/*/bin/activate && python manage.py createadmin"
       leader_only: true
   ```

8. Create a custom management command to create an admin user at `core/management/commands/createadmin.py`:
   ```python
   from django.core.management.base import BaseCommand
   from django.contrib.auth.models import User
   import os
   
   class Command(BaseCommand):
       help = 'Creates an admin user if none exists'
   
       def handle(self, *args, **options):
           if not User.objects.filter(is_superuser=True).exists():
               admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
               admin_email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
               
               User.objects.create_superuser(
                   username='admin',
                   email=admin_email,
                   password=admin_password
               )
               self.stdout.write(self.style.SUCCESS('Admin user created!'))
           else:
               self.stdout.write(self.style.SUCCESS('Admin user already exists.'))
   ```

### Deploying with Elastic Beanstalk

1. Initialize Elastic Beanstalk in your project:
   ```bash
   cd /path/to/NerualLeap-Website-master/backend
   eb init -p python-3.9 neuralleap
   # Follow the prompts to set up your EB application
   ```

2. Create an environment:
   ```bash
   eb create neuralleap-prod
   ```

3. Deploy your application:
   ```bash
   eb deploy
   ```

4. Open your application:
   ```bash
   eb open
   ```

## Option 2: Manual EC2 Deployment

If you need more control over the deployment, follow these steps to deploy on an EC2 instance.

### Step 1: Launch an EC2 Instance

1. Log in to the AWS Management Console
2. Navigate to EC2 and click "Launch Instance"
3. Select Amazon Linux 2 AMI
4. Choose an instance type (t2.micro for small sites, t2.medium for medium traffic)
5. Configure instance details (use default settings for basic setup)
6. Add storage (10GB should be sufficient for a start)
7. Add tags (optional)
8. Configure security group to allow:
   - SSH (port 22)
   - HTTP (port 80)
   - HTTPS (port 443)
9. Launch the instance and select or create a key pair

### Step 2: Connect to the EC2 Instance

```bash
ssh -i /path/to/your-key.pem ec2-user@your-instance-public-dns
```

### Step 3: Install Dependencies

```bash
# Update the system
sudo yum update -y

# Install Python 3.9 and development tools
sudo amazon-linux-extras install python3.9
sudo yum install python39-devel gcc git nginx -y

# Create a virtual environment
cd /home/ec2-user
python3.9 -m venv venv
source venv/bin/activate

# Install necessary Python packages
pip install gunicorn psycopg2-binary
```

### Step 4: Set Up PostgreSQL (RDS)

1. Create an RDS PostgreSQL instance in the AWS Console
2. Configure security group to allow traffic from your EC2 instance
3. Note the endpoint, username, password, database name

### Step 5: Clone Your Repository

```bash
git clone https://github.com/yourusername/NerualLeap-Website.git
cd NerualLeap-Website/backend
pip install -r requirements.txt
```

### Step 6: Configure Django for Production

Create a `.env` file with sensitive information:

```bash
cat > .env << EOL
DEBUG=False
SECRET_KEY=$(openssl rand -hex 32)
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-instance-ip
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
SENDGRID_API_KEY=your-sendgrid-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
EOL
```

Update `settings.py` to use environment variables:

```python
import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = os.environ.get('DEBUG', 'False') == 'True'
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
    }
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# API keys
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')
```

### Step 7: Set Up Gunicorn

Create a systemd service file:

```bash
sudo tee /etc/systemd/system/gunicorn.service << EOL
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/NerualLeap-Website/backend
ExecStart=/home/ec2-user/venv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          myproject.wsgi:application

[Install]
WantedBy=multi-user.target
EOL

sudo tee /etc/systemd/system/gunicorn.socket << EOL
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
EOL
```

Start and enable the Gunicorn socket:

```bash
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
```

### Step 8: Configure Nginx

```bash
sudo tee /etc/nginx/conf.d/neuralleap.conf << EOL
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_session_cache shared:SSL:10m;
    
    # Static files
    location /static/ {
        alias /home/ec2-user/NerualLeap-Website/backend/staticfiles/;
    }
    
    # Media files
    location /media/ {
        alias /home/ec2-user/NerualLeap-Website/backend/media/;
    }
    
    # Django application
    location / {
        proxy_pass http://unix:/run/gunicorn.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL
```

### Step 9: Set Up SSL Certificate with Let's Encrypt

```bash
sudo amazon-linux-extras install epel -y
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Step 10: Final Steps and Testing

```bash
# Collect static files
cd /home/ec2-user/NerualLeap-Website/backend
source /home/ec2-user/venv/bin/activate
python manage.py collectstatic --noinput

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create logs directory
mkdir -p logs

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Setting Up Database Backups

### RDS Automated Backups

1. In the AWS Console, navigate to RDS
2. Select your database instance
3. Click "Modify"
4. Under "Backup", set:
   - Backup retention period: 7-35 days
   - Backup window: Select a convenient time
   - Enable automatic backups
5. Save changes

### Manual Backup Script

Create a script for manual backups:

```bash
sudo tee /home/ec2-user/scripts/backup.sh << 'EOL'
#!/bin/bash

# Configuration
DB_NAME="your_db_name"
S3_BUCKET="your-backup-bucket"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="${DB_NAME}_${TIMESTAMP}.sql.gz"

# Ensure AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found, installing..."
    pip install awscli
fi

# Create backup directory if it doesn't exist
mkdir -p /home/ec2-user/backups

# Backup database
echo "Backing up database ${DB_NAME}..."
export PGPASSWORD=$(grep DB_PASSWORD /home/ec2-user/NerualLeap-Website/backend/.env | cut -d= -f2)
pg_dump -h $(grep DB_HOST /home/ec2-user/NerualLeap-Website/backend/.env | cut -d= -f2) \
        -U $(grep DB_USER /home/ec2-user/NerualLeap-Website/backend/.env | cut -d= -f2) \
        -d ${DB_NAME} | gzip > /home/ec2-user/backups/${BACKUP_FILE}

# Upload to S3
echo "Uploading backup to S3..."
aws s3 cp /home/ec2-user/backups/${BACKUP_FILE} s3://${S3_BUCKET}/database/${BACKUP_FILE}

# Clean up old backups (keep last 30 days)
find /home/ec2-user/backups -type f -name "${DB_NAME}_*.sql.gz" -mtime +30 -delete

echo "Backup completed successfully!"
EOL

# Make the script executable
sudo chmod +x /home/ec2-user/scripts/backup.sh

# Add to crontab to run daily
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/scripts/backup.sh") | crontab -
```

## Monitoring System Performance

### CloudWatch Monitoring

1. In the AWS Console, navigate to CloudWatch
2. Create alarms for:
   - EC2 instance CPU utilization (>70%)
   - EC2 instance memory usage (>80%)
   - RDS database connections (>80% of max)
   - RDS database storage space (<20% free)

### Setting Up Prometheus and Grafana

```bash
# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Create docker-compose.yml for monitoring stack
cat > docker-compose.yml << EOL
version: '3'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus:/etc/prometheus
    ports:
      - "9090:9090"
    restart: always

  grafana:
    image: grafana/grafana
    volumes:
      - ./grafana:/var/lib/grafana
    ports:
      - "3000:3000"
    restart: always
EOL

# Create prometheus configuration
mkdir -p prometheus
cat > prometheus/prometheus.yml << EOL
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOL

# Start monitoring stack
docker-compose up -d
```

## Security Best Practices

1. **Keep systems updated**:
   ```bash
   sudo yum update -y
   ```

2. **Use AWS Secrets Manager** for sensitive information:
   - Store API keys and database credentials
   - Retrieve them at runtime

3. **Enable AWS WAF** to protect against common web exploits

4. **Configure Security Groups** to only allow necessary traffic

5. **Set up AWS CloudTrail** for auditing API calls

6. **Implement AWS GuardDuty** for threat detection

## Conclusion

Your NeuralLeap website should now be successfully deployed on AWS using either Elastic Beanstalk or a manual EC2 setup. The configuration includes:

- Database setup on AWS RDS (PostgreSQL)
- Web server configuration with Nginx and Gunicorn
- SSL/TLS encryption for secure connections
- Automated backups
- Performance monitoring

Remember to keep your system updated regularly and monitor security advisories for all used components. 