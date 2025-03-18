#!/usr/bin/env python
"""
Simple Supabase connection test.
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Test Supabase connection with minimal dependencies."""
    print("Simple Supabase Connection Test")
    
    # Get credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    print(f"URL: {supabase_url}")
    masked_key = supabase_key[:5] + "..." + supabase_key[-5:] if len(supabase_key) > 10 else "***"
    print(f"Key: {masked_key}")
    
    # Print version of supabase package
    import importlib.metadata
    try:
        print(f"Supabase package version: {importlib.metadata.version('supabase')}")
    except:
        print("Could not determine Supabase package version")
    
    # Try alternative approach using direct HTTP requests
    print("\nTrying direct API call to Supabase...")
    
    try:
        import requests
        
        # Test auth endpoint
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}"
        }
        
        response = requests.get(f"{supabase_url}/rest/v1/profiles?limit=1", headers=headers)
        
        if response.status_code == 200:
            print("✅ Successfully connected to Supabase API!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ API call failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error making direct API call: {str(e)}")

if __name__ == "__main__":
    main() 