#!/usr/bin/env python
"""
Test script for the SupabaseClient class.
"""
import os
import sys
from dotenv import load_dotenv
from core.supabase_utils import SupabaseClient

def main():
    """Test the SupabaseClient implementation"""
    print("Testing SupabaseClient class...")
    
    try:
        # Create a client instance
        client = SupabaseClient()
        
        # Test table access
        print("\nTesting table access...")
        response = client.get_table_data('profiles', {'limit': 5})
        print(f"Retrieved {response.count if hasattr(response, 'count') else len(response.data) if hasattr(response, 'data') else 'unknown'} records")
        
        # Test if we can access the raw client
        print("\nTesting raw client access...")
        raw_client = client.client
        print(f"Raw client type: {type(raw_client)}")
        
        # Try to list all available tables (this might fail if permissions are restricted)
        print("\nTrying to list available tables...")
        try:
            # First try direct API method
            tables = client._direct_api_call("pg_catalog._tables?select=name", use_service_key=True)
            print(f"Available tables: {[t.get('name') for t in tables]}")
        except Exception as e:
            print(f"Could not list tables: {str(e)}")
            print("This is expected if the service role key is not set or lacks permissions.")
        
        print("\n✅ SupabaseClient test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ SupabaseClient test failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    main() 