"""
Django settings for PratyaBites backend.

Generated using Django 6.1.
"""

from pathlib import Path


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# SECURITY
# ============================================================

# Development only.
# Before AWS deployment, move this to an environment variable.
SECRET_KEY = 'django-insecure-qcvoj318wt(fxpw7cwq11-pz^i0*4u980_4-6=$#v*v-_xdn^l'

# Development only.
DEBUG = True

ALLOWED_HOSTS = []


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [

    # Django default apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'corsheaders',

    # PratyaBites apps
    'accounts',
    'products',
    'cart',
    'orders',
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [

    'django.middleware.security.SecurityMiddleware',

    # Allows Next.js frontend to communicate with Django
    'corsheaders.middleware.CorsMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',

    'django.middleware.common.CommonMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ============================================================
# URL CONFIGURATION
# ============================================================

ROOT_URLCONF = 'config.urls'


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',

        'DIRS': [],

        'APP_DIRS': True,

        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',

                'django.contrib.auth.context_processors.auth',

                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ============================================================
# WSGI
# ============================================================

WSGI_APPLICATION = 'config.wsgi.application'


# ============================================================
# DATABASE
# ============================================================

# SQLite for development.
# Later we can migrate to PostgreSQL for production.

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# ============================================================
# CUSTOM USER MODEL
# ============================================================

AUTH_USER_MODEL = 'accounts.User'


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME':
        'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },

    {
        'NAME':
        'django.contrib.auth.password_validation.MinimumLengthValidator',
    },

    {
        'NAME':
        'django.contrib.auth.password_validation.CommonPasswordValidator',
    },

    {
        'NAME':
        'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = 'en-us'

# PratyaBites operates in India
TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = 'static/'


# ============================================================
# MEDIA FILES
# ============================================================

# Product images uploaded through Django Admin
MEDIA_URL = '/media/'

MEDIA_ROOT = BASE_DIR / 'media'


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {

    # JWT authentication for logged-in customers
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],

    # APIs are public by default.
    # We will protect cart/order APIs where required.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}


# ============================================================
# CORS
# ============================================================

# Next.js development server
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]


# ============================================================
# EMAIL
# ============================================================

# During development, emails appear in the terminal.
# Later we can configure Gmail/SendGrid/AWS SES/etc.

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


# ============================================================
# JWT CONFIGURATION
# ============================================================

from datetime import timedelta

SIMPLE_JWT = {

    # Access token lifetime
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),

    # Refresh token lifetime
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # Allow refresh token rotation later if needed
    'ROTATE_REFRESH_TOKENS': False,

    'BLACKLIST_AFTER_ROTATION': False,
}