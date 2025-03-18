"""
Supabase JWT authentication for Django REST Framework.
"""
import jwt
import requests
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

User = get_user_model()

class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Authenticate using Supabase JWT token.
    
    This authentication class verifies Supabase JWT tokens passed in the
    Authorization header and authenticates the corresponding user.
    """
    
    def authenticate(self, request):
        """
        Authenticate the request and return a two-tuple of (user, token).
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        if not token:
            return None
        
        # Supabase URL from environment variables
        supabase_url = os.getenv("SUPABASE_URL")
        
        try:
            # Fetch Supabase JWT verification key (JWKS)
            jwks_url = f"{supabase_url}/auth/v1/jwks"
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
                raise AuthenticationFailed('Invalid token: No matching key found')
            
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
                raise AuthenticationFailed('Invalid token: No user ID in payload')
            
            # Get user email from payload
            user_email = payload.get('email', f"{user_id}@example.com")
            
            # Get or create user in Django
            try:
                user = User.objects.get(username=user_id)
                
                # Update email if it has changed
                if user.email != user_email and user_email != f"{user_id}@example.com":
                    user.email = user_email
                    user.save()
                    
            except User.DoesNotExist:
                # Create a new user
                user = User.objects.create_user(
                    username=user_id,
                    email=user_email,
                    password=None  # No password for Supabase users
                )
                
                # You might want to fetch additional user data from Supabase here
                # and set user.first_name, user.last_name, etc.
                
                user.save()
            
            return (user, payload)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Expired token')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except requests.RequestException as e:
            raise AuthenticationFailed(f'Error verifying token: {str(e)}')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication error: {str(e)}')
    
    def authenticate_header(self, request):
        """
        Return the authentication header format.
        """
        return 'Bearer' 