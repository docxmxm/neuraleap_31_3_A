"""
Supabase integration utilities for Django.
This module provides helper functions for interacting with Supabase.
"""
import os
import json
import requests
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

class SupabaseClient:
    """Singleton class to manage Supabase connection"""
    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseClient, cls).__new__(cls)
            # Initialize the Supabase client
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            service_key = os.getenv("SUPABASE_SERVICE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
            
            # Create the client with the anon key (for regular operations)
            cls._client = create_client(supabase_url, supabase_key)
            
            # Store credentials for direct API access if needed
            cls._supabase_url = supabase_url
            cls._supabase_key = supabase_key
            cls._service_key = service_key
        return cls._instance

    @property
    def client(self):
        """Get the Supabase client instance"""
        return self._client
    
    def get_admin_client(self):
        """Get a Supabase client with service role permissions for admin operations"""
        if not self._service_key:
            raise ValueError("SUPABASE_SERVICE_KEY is not set in environment variables")
        return create_client(self._supabase_url, self._service_key)

    # Direct API methods (fallback if client has issues)
    def _direct_api_call(self, endpoint, method="GET", data=None, params=None, use_service_key=False):
        """Make a direct API call to Supabase REST API"""
        headers = {
            "apikey": self._service_key if use_service_key else self._supabase_key,
            "Authorization": f"Bearer {self._service_key if use_service_key else self._supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        url = f"{self._supabase_url}/rest/v1/{endpoint}"
        
        if method == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, params=params)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data, params=params)
        elif method == "PATCH":
            response = requests.patch(url, headers=headers, json=data, params=params)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, params=params)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        # Handle errors
        response.raise_for_status()
        
        # Return JSON response
        return response.json()

    # User management methods
    def get_user(self, user_id):
        """Get user data from Supabase"""
        try:
            # Try using the client
            return self.client.auth.admin.get_user_by_id(user_id)
        except Exception:
            # Fallback to direct API call
            return self._direct_api_call(f"auth/users/{user_id}", use_service_key=True)
    
    def create_user(self, email, password, user_data=None):
        """Create a new user in Supabase Auth"""
        try:
            # Try using the client
            admin_client = self.get_admin_client()
            return admin_client.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": user_data or {}
            })
        except Exception:
            # Fallback to direct API call
            data = {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": user_data or {}
            }
            return self._direct_api_call("auth/users", method="POST", data=data, use_service_key=True)
    
    # Database operations with fallbacks
    def get_table_data(self, table_name, query=None):
        """Get data from a Supabase table with optional query parameters"""
        try:
            # Try using the client
            request = self.client.table(table_name).select("*")
            if query:
                # Apply filters, ordering, etc. from the query dictionary
                if "filter" in query:
                    for column, value in query["filter"].items():
                        request = request.eq(column, value)
                if "order" in query:
                    request = request.order(query["order"])
                if "limit" in query:
                    request = request.limit(query["limit"])
            
            return request.execute()
        except Exception as e:
            # Fallback to direct API call
            params = {}
            if query:
                if "filter" in query:
                    for column, value in query["filter"].items():
                        params[column] = f"eq.{value}"
                if "order" in query:
                    params["order"] = query["order"]
                if "limit" in query:
                    params["limit"] = query["limit"]
            
            data = self._direct_api_call(table_name, params=params)
            
            # Format similar to postgrest response
            return type('obj', (object,), {
                "data": data,
                "count": len(data)
            })
    
    def insert_data(self, table_name, data):
        """Insert data into a Supabase table"""
        try:
            # Try using the client
            return self.client.table(table_name).insert(data).execute()
        except Exception:
            # Fallback to direct API call
            return self._direct_api_call(table_name, method="POST", data=data)
    
    def update_data(self, table_name, data, match_column, match_value):
        """Update data in a Supabase table"""
        try:
            # Try using the client
            return self.client.table(table_name).update(data).eq(match_column, match_value).execute()
        except Exception:
            # Fallback to direct API call
            params = {match_column: f"eq.{match_value}"}
            return self._direct_api_call(table_name, method="PATCH", data=data, params=params)
    
    def delete_data(self, table_name, match_column, match_value):
        """Delete data from a Supabase table"""
        try:
            # Try using the client
            return self.client.table(table_name).delete().eq(match_column, match_value).execute()
        except Exception:
            # Fallback to direct API call
            params = {match_column: f"eq.{match_value}"}
            return self._direct_api_call(table_name, method="DELETE", params=params)

# Create a singleton instance for easy import
supabase = SupabaseClient() 