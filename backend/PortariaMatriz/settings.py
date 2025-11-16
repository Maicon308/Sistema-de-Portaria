# Django settings for PortariaMatriz project.

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
SECRET_KEY = 'django-insecure-%5-z57*%il0s27i_j$15p$hk^n^85oysei41bw3tay80p=*=@3'
DEBUG = True

# ⭐ PERMITE ACESSO DE QUALQUER DISPOSITIVO NA REDE
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '192.168.0.105', '*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # CORS headers
    'corsheaders',
    
    # Apps do Projeto
    'rest_framework',
    'rest_framework.authtoken', 
    'portaria.apps.PortariaConfig'
]

MIDDLEWARE = [
    # Middleware CORS (DEVE ser o primeiro ou perto do topo)
    'corsheaders.middleware.CorsMiddleware',
    
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'PortariaMatriz.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'PortariaMatriz.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_restinga', 
        'USER': 'root', 
        'PASSWORD': '16122012', 
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo' 
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# -------------------------------------------------------------------
# 🌟 CONFIGURAÇÕES ESSENCIAIS PARA DRF E CORS 🌟
# -------------------------------------------------------------------

## 1. Configuração do Django REST Framework (DRF)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

## 2. Configuração CORS (Cross-Origin Resource Sharing)

# ⭐ PERMITE ACESSO DE QUALQUER ORIGEM (APENAS DESENVOLVIMENTO!)
CORS_ALLOW_ALL_ORIGINS = True

# ⭐ OU use essa lista específica (comente a linha acima e descomente essas):
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "http://192.168.0.104:5173",  # Seu IP local
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]

# Permite que cookies, headers de autenticação, etc., sejam enviados
CORS_ALLOW_CREDENTIALS = True