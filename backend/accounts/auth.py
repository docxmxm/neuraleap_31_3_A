"""
Custom authentication backend for Supabase JWT tokens.
This module provides authentication classes for verifying Supabase JWT tokens.
"""
import os
import jwt
import requests
from django.contrib.auth.models import User
from django.contrib.auth.backends import BaseBackend
from django.conf import settings

class SupabaseAuthBackend(BaseBackend):
    """
    Django authentication backend that validates Supabase JWT tokens.
    """
    
    def authenticate(self, request, token=None):
        """
        Authenticate a user based on a Supabase JWT token.
        
        Args:
            request: The HTTP request object.
            token: The Supabase JWT token to validate.
            
        Returns:
            A User instance if authentication succeeds, None otherwise.
        """
        if token is None:
            return None
        
        try:
            # Fetch Supabase JWT verification key (JWKS) if not cached
            jwks_url = f"{settings.SUPABASE_URL}/auth/v1/jwks"
            jwks_response = requests.get(jwks_url)
            jwks = jwks_response.json()
            
            # Get the JWT header
            header = jwt.get_unverified_header(token)
            
            # Find the key that matches the kid in the header
            key = None
            for jwk in jwks['keys']:
                if jwk['kid'] == header['kid']:
                    key = jwk
                    break
            
            if key is None:
                return None
            
            # Convert the JWK to a public key
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
            
            # Verify and decode the token
            payload = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience='authenticated',
                options={'verify_exp': True}
            )
            
            # Get the user ID from the payload
            user_id = payload.get('sub')
            
            if not user_id:
                return None
            
            # Get or create a Django user based on the Supabase user
            user_email = payload.get('email', f"{user_id}@example.com")
            
            try:
                user = User.objects.get(username=user_id)
            except User.DoesNotExist:
                # Create a new user
                user = User.objects.create_user(
                    username=user_id,
                    email=user_email,
                    password=None  # No password for Supabase users
                )
                user.save()
            
            return user
            
        except (jwt.PyJWTError, requests.RequestException) as e:
            print(f"Authentication error: {str(e)}")
            return None
    
    def get_user(self, user_id):
        """
        Get a user by ID.
        
        Args:
            user_id: The user ID.
            
        Returns:
            A User instance if the user exists, None otherwise.
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 