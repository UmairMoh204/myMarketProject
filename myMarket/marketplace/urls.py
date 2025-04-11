from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ListingViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'listings', ListingViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
