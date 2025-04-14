from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'listings', views.ListingViewSet, basename='listing')

urlpatterns = [
    path('', views.api_root),
    path('', include(router.urls)),
] 