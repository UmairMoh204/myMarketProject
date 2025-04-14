from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import user_profile

router = DefaultRouter()
router.register(r'listings', views.ListingViewSet, basename='listing')

urlpatterns = [
    path('', views.api_root),
    path('', include(router.urls)),
    path('register/', views.register, name='register'),
    path('user-by-email/<str:email>/', views.get_user_by_email, name='user-by-email'),
    path('user/profile/', user_profile, name='user-profile'),
] 