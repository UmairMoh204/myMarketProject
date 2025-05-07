from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import user_profile
from listings.views import user_profile  # Corrected import path


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
    path('verify-email/<str:uidb64>/<str:token>/', views.verify_email, name='verify-email'),
    path('request-password-reset/', views.request_password_reset, name='request-password-reset'),
    path('reset-password/<str:uidb64>/<str:token>/', views.reset_password, name='reset-password'),
    path('user-profile/', views.user_profile, name='user-profile'),
    path('create-checkout-session/', views.create_checkout_session, name='create-checkout-session'),
    path('webhook/stripe/', views.stripe_webhook, name='stripe-webhook'),
]