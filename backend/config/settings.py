"""
Django settings for the Workout Tracker project.

This configuration reads all sensitive/environment-specific values from
environment variables (loaded via python-dotenv in development). Nothing
sensitive is hardcoded here.
"""

from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from a .env file in the backend/ directory
# (BASE_DIR here is the backend/ folder, since config/ is one level below it).
load_dotenv(BASE_DIR / ".env")


def get_env_bool(name, default=False):
    """Parse a boolean-like environment variable (e.g. 'True'/'False')."""
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


def get_env_list(name, default=None, separator=","):
    """Parse a comma-separated environment variable into a list of strings."""
    value = os.getenv(name)
    if not value:
        return default or []
    return [item.strip() for item in value.split(separator) if item.strip()]


# ------------------------------------------------------------------------
# Core / Security
# ------------------------------------------------------------------------

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = get_env_bool("DEBUG", default=False)

ALLOWED_HOSTS = get_env_list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])


# ------------------------------------------------------------------------
# Application definition
# ------------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    # Local apps
    "apps.accounts",
    "apps.exercises",
    "apps.workouts",
    "apps.reports",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


# ------------------------------------------------------------------------
# Database (MySQL)
# ------------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
        },
    }
}


# ------------------------------------------------------------------------
# Authentication
# ------------------------------------------------------------------------

AUTH_USER_MODEL = "accounts.User"


# ------------------------------------------------------------------------
# Password validation
# ------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# ------------------------------------------------------------------------
# Internationalization
# ------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("TIME_ZONE", "UTC")
USE_I18N = True
USE_TZ = True


# ------------------------------------------------------------------------
# Static files (CSS, JavaScript, Images)
# ------------------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ------------------------------------------------------------------------
# Django REST Framework
# ------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}


# ------------------------------------------------------------------------
# Simple JWT
# ------------------------------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}


# ------------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = get_env_list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = True


# ------------------------------------------------------------------------
# drf-spectacular (OpenAPI schema)
# ------------------------------------------------------------------------

SPECTACULAR_SETTINGS = {
    "TITLE": "Workout Tracker API",
    "DESCRIPTION": "API documentation for the Workout Tracker application.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/",
}
