DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
INSTALLED_APPS = [
    'rest_framework',
    'listings',
]

ALLOWED_HOSTS = ['your-backend-name.onrender.com']

import dj_database_url

import os

DATABASES = {
    'default': dj_database_url.config(default='sqlite:///db.sqlite3')
}

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    ...
]

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

