"""
Direct Supabase API client.
Bypasses the Supabase Python SDK to communicate directly with the Supabase REST API.
"""
import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DirectSupabaseClient:
    """
    A client for interacting with Supabase directly through REST API calls.
    This bypasses the Python SDK entirely, which may have compatibility issues.
    """
    
    def __init__(self):
        """Initialize the client with credentials from environment variables."""
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.anon_key = os.getenv("SUPABASE_KEY")
        self.service_key = os.getenv("SUPABASE_SERVICE_KEY", "")
        
        if not self.supabase_url or not self.anon_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    
    def _api_request(self, endpoint, method="GET", data=None, params=None, use_service_key=False):
        """
        Make a REST API request to Supabase.
        
        Args:
            endpoint: The API endpoint to call, without the base URL
            method: HTTP method (GET, POST, PUT, PATCH, DELETE)
            data: Request body data for POST/PUT/PATCH requests
            params: URL query parameters
            use_service_key: Whether to use the service role key instead of anon key
            
        Returns:
            The JSON response from the API
        """
        # Determine the correct base URL depending on the endpoint type
        if endpoint.startswith("auth/"):
            base_url = f"{self.supabase_url}/auth/v1"
            endpoint = endpoint.replace("auth/", "")
        else:
            base_url = f"{self.supabase_url}/rest/v1"
        
        url = f"{base_url}/{endpoint}"
        
        # Prepare headers
        api_key = self.service_key if use_service_key and self.service_key else self.anon_key
        headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # Make the request
        try:
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
            
            # Check for errors
            response.raise_for_status()
            
            # Return JSON response
            if response.content:
                return response.json()
            return None
            
        except requests.RequestException as e:
            print(f"API request error: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text}")
            raise
    
    # Table operations
    def select(self, table, columns="*", filters=None, limit=None, order=None):
        """
        Select data from a table.
        
        Args:
            table: The table name
            columns: Columns to select (default "*")
            filters: Dictionary of column/value pairs to filter by
            limit: Maximum number of records to return
            order: Order by clause
            
        Returns:
            List of records
        """
        params = {}
        
        # Add filters
        if filters:
            for column, value in filters.items():
                params[column] = f"eq.{value}"
        
        # Add pagination
        if limit:
            params["limit"] = limit
        
        # Add ordering
        if order:
            params["order"] = order
        
        # Add column selection
        if columns and columns != "*":
            params["select"] = columns
        
        return self._api_request(table, params=params)
    
    def insert(self, table, data):
        """
        Insert data into a table.
        
        Args:
            table: The table name
            data: Record or records to insert
            
        Returns:
            Inserted record(s)
        """
        return self._api_request(table, method="POST", data=data)
    
    def update(self, table, data, column, value):
        """
        Update records in a table.
        
        Args:
            table: The table name
            data: Data to update
            column: Column to filter by
            value: Value to filter by
            
        Returns:
            Updated record(s)
        """
        params = {column: f"eq.{value}"}
        return self._api_request(table, method="PATCH", data=data, params=params)
    
    def delete(self, table, column, value):
        """
        Delete records from a table.
        
        Args:
            table: The table name
            column: Column to filter by
            value: Value to filter by
            
        Returns:
            Deleted record(s)
        """
        params = {column: f"eq.{value}"}
        return self._api_request(table, method="DELETE", params=params)
    
    # Auth operations
    def sign_up(self, email, password, metadata=None):
        """
        Sign up a new user.
        
        Args:
            email: User's email
            password: User's password
            metadata: Optional user metadata
            
        Returns:
            User data
        """
        data = {
            "email": email,
            "password": password,
            "data": metadata or {}
        }
        return self._api_request("auth/signup", method="POST", data=data)
    
    def sign_in(self, email, password):
        """
        Sign in a user.
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            Session data including access token
        """
        data = {
            "email": email,
            "password": password
        }
        return self._api_request("auth/token?grant_type=password", method="POST", data=data)
    
    def get_user(self, jwt):
        """
        Get user data using a JWT.
        
        Args:
            jwt: JWT token
            
        Returns:
            User data
        """
        headers = {
            "apikey": self.anon_key,
            "Authorization": f"Bearer {jwt}"
        }
        url = f"{self.supabase_url}/auth/v1/user"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()

# Create a singleton instance
supabase = DirectSupabaseClient() 