from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.views.generic import RedirectView
from listings.views import user_profile, register_user, verify_email, request_password_reset, reset_password  # Using the original listings app

schema_view = get_schema_view(
    openapi.Info(
        title="Marketplace API",
        default_version='v1',
        description="API for the Marketplace application",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@marketplace.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    
    path('admin/', admin.site.urls),
    path('api/', include('listings.urls')),  # Using the original listings app
    path('api/user/profile/', user_profile, name='user-profile'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', register_user, name='register'),
    path('api/verify-email/<str:uidb64>/<str:token>/', verify_email, name='verify-email'),
    path('api/request-password-reset/', request_password_reset, name='request-password-reset'),
    path('api/reset-password/<str:uidb64>/<str:token>/', reset_password, name='reset-password'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
