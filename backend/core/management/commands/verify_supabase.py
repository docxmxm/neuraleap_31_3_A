"""
Management command to verify the Supabase connection.
"""
import os
import sys
from django.core.management.base import BaseCommand
from django.conf import settings
from core.supabase_utils import SupabaseClient

class Command(BaseCommand):
    help = 'Verify the connection to Supabase and test basic functionality'
    
    def handle(self, *args, **options):
        """
        Handle the command execution.
        """
        self.stdout.write(self.style.SUCCESS('Testing Supabase connection...'))
        
        # Check environment variables
        supabase_url = settings.SUPABASE_URL
        supabase_key = settings.SUPABASE_KEY
        
        if not supabase_url or not supabase_key:
            self.stdout.write(self.style.ERROR('❌ Missing Supabase credentials in environment variables'))
            self.stdout.write(self.style.WARNING('SUPABASE_URL and SUPABASE_KEY must be set in .env file'))
            sys.exit(1)
        
        # Test Supabase connection
        try:
            # Get the Supabase client
            client = SupabaseClient()
            supabase = client.client
            
            # Test a simple query
            response = supabase.table('_test_connection').select('*').limit(1).execute()
            
            # The query might fail if the table doesn't exist, but the connection should work
            self.stdout.write(self.style.SUCCESS('✅ Successfully connected to Supabase!'))
            self.stdout.write(f'Supabase URL: {supabase_url}')
            
            # Test database connection
            try:
                from django.db import connections
                cursor = connections['default'].cursor()
                cursor.execute('SELECT current_database()')
                db_name = cursor.fetchone()[0]
                cursor.close()
                
                self.stdout.write(self.style.SUCCESS(f'✅ Successfully connected to PostgreSQL database: {db_name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Database connection error: {str(e)}'))
                self.stdout.write(self.style.WARNING('Check your database credentials in .env file'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Supabase connection error: {str(e)}'))
            self.stdout.write(self.style.WARNING('Check your Supabase credentials in .env file'))
            sys.exit(1)
        
        self.stdout.write(self.style.SUCCESS('Supabase connection verification completed!')) 