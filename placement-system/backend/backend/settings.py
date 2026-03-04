# """
# Django settings for backend project.
# """

# import os
# from pathlib import Path
# from datetime import timedelta

# # Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR = Path(__file__).resolve().parent.parent

# # SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = 'django-insecure-your-secret-key-here-change-this'

# # SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = False

# ALLOWED_HOSTS = ['*']

# # Application definition
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'rest_framework',
#     'rest_framework_simplejwt',
#     'rest_framework_simplejwt.token_blacklist',  # Enable token blacklist
#     'corsheaders',
#     'api',
# ]

# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
#     ####################################################
#     'whitenoise.middleware.WhiteNoiseMiddleware'
#     ####################################################
# ]

# ROOT_URLCONF = 'backend.urls'

# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# WSGI_APPLICATION = 'backend.wsgi.application'

# # Database - MySQL (Local)
# # DATABASES = {
# #     'default': {
# #         'ENGINE': 'django.db.backends.mysql',
# #         'NAME': 'placement',
# #         'USER': 'root',
# #         'PASSWORD': 'root',  # Your local MySQL password
# #         'HOST': 'localhost',
# #         'PORT': '3306',
# #         'OPTIONS': {
# #             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
# #             'charset': 'utf8mb4',
# #         }
# #     }
# # }
# DATABASES = {
#     'default': dj_database_url.config(
#         default=os.environ.get("mysql://root:ulhcxNGGYxYGtdBxHrZhOUFjQiiHvIcu@nozomi.proxy.rlwy.net:55355/railway"),
#         conn_max_age=600,
#     )
# }

# import os

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': os.environ.get('placement'),
#         'USER': os.environ.get('root'),
#         'PASSWORD': os.environ.get('root'),
#         'HOST': os.environ.get('localhost'),
#         'PORT': os.environ.get('3306'),
#     }
# }

# # Password validation
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]

# # Internationalization
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC'
# USE_I18N = True
# USE_TZ = True

# # Static files (CSS, JavaScript, Images)
# STATIC_URL = 'static/'
# STATIC_ROOT = os.path.join(BASE_DIR, 'static')


# ##########################################################
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# ############################################################

# # Media files
# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# # Default primary key field type
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # Custom User Model
# AUTH_USER_MODEL = 'api.User'

# # CORS settings (Local Development)
# CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins in development

# CORS_ALLOW_CREDENTIALS = True

# CORS_ALLOW_HEADERS = [
#     'accept',
#     'accept-encoding',
#     'authorization',
#     'content-type',
#     'dnt',
#     'origin',
#     'user-agent',
#     'x-csrftoken',
#     'x-requested-with',
# ]

# CORS_ALLOW_METHODS = [
#     'DELETE',
#     'GET',
#     'OPTIONS',
#     'PATCH',
#     'POST',
#     'PUT',
# ]

# # CSRF Trusted Origins
# CSRF_TRUSTED_ORIGINS = [
#     'http://localhost:5173',
#     'http://localhost:3000',
#     'http://127.0.0.1:5173',
#     'http://127.0.0.1:3000',
# ]

# # REST Framework settings
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ),
#     'DEFAULT_PERMISSION_CLASSES': (
#         'rest_framework.permissions.AllowAny',
#     ),
#     'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
#     'PAGE_SIZE': 10
# }

# # JWT Settings
# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
#     'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
#     'ROTATE_REFRESH_TOKENS': False,
#     'BLACKLIST_AFTER_ROTATION': True,
#     'ALGORITHM': 'HS256',
#     'SIGNING_KEY': SECRET_KEY,
#     'VERIFYING_KEY': None,
#     'AUTH_HEADER_TYPES': ('Bearer',),
#     'USER_ID_FIELD': 'id',
#     'USER_ID_CLAIM': 'user_id',
#     'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
#     'TOKEN_TYPE_CLAIM': 'token_type',
# }

# # Email Configuration
# # Option 1: Console Backend (Development only - prints emails to console)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# # Option 2: SMTP Backend (Gmail - actual email sending)
# # EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# # EMAIL_HOST = 'smtp.gmail.com'
# # EMAIL_PORT = 587
# # EMAIL_USE_TLS = True
# # EMAIL_HOST_USER = 'your-email@gmail.com'  # Replace with your Gmail address
# # EMAIL_HOST_PASSWORD = 'your-app-password'  # Replace with your Gmail app password
# DEFAULT_FROM_EMAIL = 'noreply@placementsystem.com'

# ####################################################

# ALLOWED_HOSTS = ['.onrender.com']
# ####################################################





"""
Django settings for backend project.
Production-ready for Render/Railway deployment.
"""

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url  # Make sure to install: pip install dj-database-url

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-secret-key')  # Use env var
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')  # e.g., 'myapp.onrender.com'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Local apps
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serve static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # Add templates folder if needed
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ---------------------------
# Database (MySQL using dj-database-url)
# ---------------------------
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('mysql://root:AUSEbfKwknXYAqtDXzyEbRPwOEYREMgt@ballast.proxy.rlwy.net:26164/railway'),
        conn_max_age=600,
    )
}

# ---------------------------
# Password validation
# ---------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------
# Internationalization
# ---------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------------------------
# Static & Media files
# ---------------------------
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # WhiteNoise serves this

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Enable Gzip and caching for WhiteNoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ---------------------------
# Default primary key field type
# ---------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------
# Custom User Model
# ---------------------------
AUTH_USER_MODEL = 'api.User'

# ---------------------------
# CORS / CSRF
# ---------------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')  # e.g., 'https://frontend.onrender.com'
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']

CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',')  # e.g., 'https://frontend.onrender.com'

# ---------------------------
# REST Framework
# ---------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',  # Change in production
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}

# ---------------------------
# JWT Settings
# ---------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# ---------------------------
# Email Configuration
# ---------------------------
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Development
DEFAULT_FROM_EMAIL = 'noreply@placementsystem.com'

# Uncomment for Gmail SMTP
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
# EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')