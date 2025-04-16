from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import user_profile

router = DefaultRouter()
router.register(r'listings', views.ListingViewSet, basename='listing')
router.register(r'carts', views.CartViewSet, basename='cart')
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'conversations', views.ConversationViewSet, basename='conversation')
router.register(r'messages', views.MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('api-root/', views.api_root, name='api-root'),
    path('register/', views.register_user, name='register'),
    path('user-profile/', views.user_profile, name='user-profile'),
] 