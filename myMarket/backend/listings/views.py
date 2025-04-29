from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing, Cart, CartItem, UserProfile, Conversation, Message
from .serializers import (
    ListingSerializer, UserSerializer, CartSerializer, CartItemSerializer,
    UserProfileSerializer, ConversationSerializer, MessageSerializer
)
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from rest_framework.exceptions import ValidationError

# Create your views here.

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    if not request.data:
        return Response({'error': 'No data provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password strength
    password = request.data.get('password', '')
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if username already exists
    if User.objects.filter(username=request.data.get('username')).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already exists
    if User.objects.filter(email=request.data.get('email')).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Create user with is_active=True immediately (no email verification needed)
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data.get('email', ''),
                password=request.data.get('password', ''),
                is_active=True  # User is active immediately
            )
            
            # Create user profile
            UserProfile.objects.create(user=user)
            
            return Response({
                'message': 'Registration successful. You can now log in.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_email(request, uidb64, token):
    try:
        from django.utils.http import urlsafe_base64_decode
        from django.contrib.auth.tokens import default_token_generator
        
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
        
        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid verification link'}, status=status.HTTP_400_BAD_REQUEST)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid verification link'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.core.mail import send_mail
        from django.conf import settings
        
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        send_mail(
            'Password Reset',
            f'Please click the following link to reset your password: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        # Don't reveal that the email doesn't exist
        return Response({'message': 'If an account exists with this email, a password reset link has been sent'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request, uidb64, token):
    try:
        from django.utils.http import urlsafe_base64_decode
        from django.contrib.auth.tokens import default_token_generator
        
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
        
        if default_token_generator.check_token(user, token):
            new_password = request.data.get('new_password')
            if not new_password or len(new_password) < 8:
                return Response({'error': 'Password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            if hasattr(self, 'get_or_create_object'):
                return self.get_or_create_object()
            return super().get_object()
        except Exception as e:
            raise ValidationError(detail=str(e))

class UserProfileViewSet(BaseModelViewSet):
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_or_create_object(self):
        try:
            return UserProfile.objects.get_or_create(user=self.request.user)[0]
        except Exception as e:
            raise ValidationError(detail=str(e))

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'condition', 'is_active', 'owner']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at', 'view_count']

    def get_queryset(self):
        try:
            filter_by = self.request.query_params.get('filter', None)
            queryset = Listing.objects.all()

            if filter_by == 'my_listings' and self.request.user.is_authenticated:
                queryset = queryset.filter(owner=self.request.user)
            else:
                queryset = queryset.filter(is_active=True)

            ordering = {
                'popular': '-view_count',
                'recent': '-created_at',
                'price_low': 'price',
                'price_high': '-price'
            }.get(filter_by, '-created_at')

            return queryset.order_by(ordering)
        except Exception as e:
            raise ValidationError(detail=str(e))

    def perform_create(self, serializer):
        try:
            serializer.save(owner=self.request.user, is_active=True)
        except Exception as e:
            raise ValidationError(detail=str(e))

    @action(detail=True, methods=['post'])
    def contact(self, request, pk=None):
        try:
            listing = self.get_object()
            content = request.data.get('message')
            
            if not content:
                return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            conversation = Conversation.objects.filter(
                listing=listing,
                participants=request.user
            ).first() or Conversation.objects.create(listing=listing)
            
            if not conversation.participants.filter(id=request.user.id).exists():
                conversation.participants.add(request.user, listing.owner)
                
            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content
            )
            
            return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CartViewSet(BaseModelViewSet):
    serializer_class = CartSerializer
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def get_or_create_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    def list(self, request, *args, **kwargs):
        cart = self.get_or_create_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        cart = self.get_or_create_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        listing_id = request.data.get('listing_id')
        quantity = request.data.get('quantity', 1)
        
        if not listing_id:
            return Response({'error': 'Listing ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        listing = get_object_or_404(Listing, id=listing_id)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            listing=listing,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        # Refresh the cart to get updated items
        cart.refresh_from_db()
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        cart = self.get_object()
        listing_id = request.data.get('listing_id')
        
        if not listing_id:
            return Response({'error': 'Listing ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        CartItem.objects.filter(cart=cart, listing_id=listing_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def update_quantity(self, request, pk=None):
        cart = self.get_object()
        listing_id = request.data.get('listing_id')
        quantity = request.data.get('quantity')
        
        if not listing_id or quantity is None:
            return Response({'error': 'Listing ID and quantity are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item = get_object_or_404(CartItem, cart=cart, listing_id=listing_id)
        cart_item.quantity = quantity
        cart_item.save()
        return Response(CartItemSerializer(cart_item).data)
    
    @action(detail=True, methods=['post'])
    def clear(self, request, pk=None):
        self.get_object().items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    profile = UserProfile.objects.get_or_create(user=request.user)[0]
    
    if request.method == 'GET':
        return Response(UserProfileSerializer(profile).data)
    
    serializer = UserProfileSerializer(profile, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ConversationViewSet(BaseModelViewSet):
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

    def perform_create(self, serializer):
        conversation = serializer.save()
        conversation.participants.add(self.request.user)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        content = request.data.get('message')
        
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        if request.user not in conversation.participants.all():
            return Response({'error': 'You are not a participant in this conversation'}, 
                          status=status.HTTP_403_FORBIDDEN)
            
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        conversation = self.get_object()
        
        if request.user not in conversation.participants.all():
            return Response({'error': 'You are not a participant in this conversation'}, 
                          status=status.HTTP_403_FORBIDDEN)
            
        Message.objects.filter(
            conversation=conversation,
            sender__in=conversation.participants.exclude(id=request.user.id)
        ).update(is_read=True)
        
        return Response(status=status.HTTP_200_OK)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(conversation__participants=self.request.user)

    def perform_create(self, serializer):
        conversation = get_object_or_404(Conversation, id=self.request.data.get('conversation'))
        if self.request.user not in conversation.participants.all():
            raise permissions.PermissionDenied("You are not a participant in this conversation")
        serializer.save(sender=self.request.user)

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'listings': reverse('listing-list', request=request, format=format),
        'profiles': reverse('profile-list', request=request, format=format),
        'conversations': reverse('conversation-list', request=request, format=format),
        'messages': reverse('message-list', request=request, format=format),
        'carts': reverse('cart-list', request=request, format=format),
    })
