"""
S3 storage backends for Django.
"""
from storages.backends.s3boto3 import S3Boto3Storage

class StaticStorage(S3Boto3Storage):
    """Storage for static files."""
    location = 'static'
    default_acl = 'public-read'

class MediaStorage(S3Boto3Storage):
    """Storage for media files."""
    location = 'media'
    default_acl = 'public-read'
    file_overwrite = False 