"""
Management command to create admin user.
"""
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