#!/usr/bin/env python
"""
Standalone script to verify Supabase connection.

Usage:
    python verify_supabase_connection.py

This script verifies that we can connect to Supabase using the credentials
in the .env file.
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables from .env file
load_dotenv()

def main():
    """Main function to verify Supabase connection."""
    print("Verifying Supabase connection...")
    
    # Get Supabase credentials from environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    # Check if credentials are set
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials!")
        print("Make sure SUPABASE_URL and SUPABASE_KEY are set in the .env file.")
        sys.exit(1)
    
    # Print masked credentials for verification
    print(f"URL: {supabase_url}")
    masked_key = supabase_key[:5] + "..." + supabase_key[-5:] if len(supabase_key) > 10 else "***"
    print(f"Key: {masked_key}")
    
    # Try to connect to Supabase
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        
        # Test connection with a simple query
        print("Attempting to query data...")
        response = supabase.table('profiles').select('*').limit(1).execute()
        
        # If we get here without an exception, the connection works
        print("✅ Successfully connected to Supabase!")
        print(f"Response: {response}")
        
        print("\nConnection verified successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        
        # Provide troubleshooting advice
        print("\nPossible issues:")
        print("1. Incorrect Supabase URL or API key")
        print("2. Network connectivity problems")
        print("3. Supabase service might be down")
        print("4. The table 'profiles' might not exist (try another table name)")
        
        # Check if it's an authentication error
        if "apikey" in str(e).lower() or "key" in str(e).lower() or "auth" in str(e).lower():
            print("\nThis looks like an authentication issue. Double-check your SUPABASE_KEY.")
        
        # Check if it's a URL format issue
        if "url" in str(e).lower() or "http" in str(e).lower():
            print("\nThis might be a URL format issue. Make sure SUPABASE_URL includes 'https://'.")
        
        return False

if __name__ == "__main__":
    main() 