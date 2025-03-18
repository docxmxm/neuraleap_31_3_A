#!/usr/bin/env python
"""
Test script for the DirectSupabaseClient class.
"""
import os
import sys
from core.direct_supabase import supabase

def main():
    """Test the DirectSupabaseClient implementation"""
    print("Testing DirectSupabaseClient...")
    
    try:
        # Test table access - get courses
        print("\nTesting table access (courses)...")
        courses = supabase.select('courses', limit=5)
        print(f"Retrieved {len(courses) if courses else 0} courses")
        
        # Test table access - get profiles
        print("\nTesting table access (profiles)...")
        profiles = supabase.select('profiles', limit=5)
        print(f"Retrieved {len(profiles) if profiles else 0} profiles")
        
        # Try to list all available tables by querying information_schema
        print("\nTrying to list available tables...")
        try:
            tables = supabase.select('information_schema.tables', 
                                   columns='table_name', 
                                   filters={'table_schema': 'public'})
            if tables:
                table_names = [t.get('table_name') for t in tables]
                print(f"Available tables: {table_names}")
            else:
                print("No tables found or insufficient permissions")
        except Exception as e:
            print(f"Could not list tables: {str(e)}")
            print("This is expected if the user lacks permissions.")
        
        print("\n✅ DirectSupabaseClient test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ DirectSupabaseClient test failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    main() 