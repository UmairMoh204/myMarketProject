from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing, Cart, CartItem, UserProfile, Conversation, Message, Order, OrderItem
from .serializers import (
    ListingSerializer, UserSerializer, CartSerializer, CartItemSerializer,
    UserProfileSerializer, ConversationSerializer, MessageSerializer, OrderSerializer
)
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from rest_framework.exceptions import ValidationError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.shortcuts import redirect
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    if not request.data:
        return Response({'error': 'No data provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    password = request.data.get('password', '')
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=request.data.get('username')).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=request.data.get('email')).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data.get('email', ''),
                password=request.data.get('password', ''),
                is_active=False  # User is active immediately
            )
            
            # Create user profile
            UserProfile.objects.create(user=user)
            
            send_verification_email(user, request)
            
            return Response({
                'message': 'Registration successful. You can now log in.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        print(f"List cart request from user: {request.user.id}")
        cart = self.get_or_create_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        print(f"Create cart request from user: {request.user.id}")
        cart = self.get_or_create_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        try:
            print(f"Add item request from user: {request.user.id}")
            print(f"Request data: {request.data}")
            
            cart = self.get_object()
            listing_id = request.data.get('listing_id')
            quantity = request.data.get('quantity', 1)
            
            if not listing_id:
                print("No listing_id provided")
                return Response({'error': 'Listing ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                listing = Listing.objects.get(id=listing_id, is_active=True)
                print(f"Found listing: {listing.id} - {listing.title}")
            except Listing.DoesNotExist:
                print(f"Listing not found or not active: {listing_id}")
                return Response({'error': 'Listing not found or not active'}, status=status.HTTP_404_NOT_FOUND)
            
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                listing=listing,
                defaults={'quantity': quantity}
            )
            
            if not created:
                print(f"Updating existing cart item quantity: {cart_item.quantity} -> {cart_item.quantity + quantity}")
                cart_item.quantity += quantity
                cart_item.save()
            else:
                print(f"Created new cart item with quantity: {quantity}")
            
            cart.refresh_from_db()
            serializer = self.get_serializer(cart)
            print(f"Cart after update: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in add_item: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
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


# ----------------------------------------------------------------------------------------------------------------------------------------

def send_verification_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_url = request.build_absolute_uri(
        reverse('verify-email', kwargs={'uidb64': uid, 'token': token})
    )
    subject = 'Verify your email address'
    message = f'Hi {user.username},\n\nPlease verify your email by clicking the link below:\n{verify_url}\n\nThank you!'
    send_mail(subject, message, 'noreply@yourdomain.com', [user.email])

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return render(request, 'email_verification_success.html', {'user': user})
    else:
        return render(request, 'email_verification_failed.html')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    try:
        print("Creating checkout session...")
        print("Request data:", request.data)
        print("User:", request.user)
        
        cart_id = request.data.get('cart_id')
        if not cart_id:
            print("No cart_id provided in request")
            return Response({'error': 'Cart ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        print(f"Getting cart with ID: {cart_id}")
        try:
            cart = Cart.objects.get(id=cart_id, user=request.user)
            print(f"Found cart: {cart.id} with {cart.items.count()} items")
        except Cart.DoesNotExist:
            print(f"Cart not found with ID: {cart_id} for user: {request.user.id}")
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not cart.items.exists():
            print("Cart is empty")
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        line_items = []
        for item in cart.items.all():
            print(f"Processing item: {item.listing.title}")
            image_url = None
            if item.listing.image:
                try:
                    image_url = request.build_absolute_uri(item.listing.image.url)
                    print(f"Image URL: {image_url}")
                except Exception as e:
                    print(f"Error getting image URL: {str(e)}")
                    pass

            price = int(float(item.listing.price) * 100)  
            print(f"Item price in cents: {price}")
            
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': item.listing.title,
                        'images': [image_url] if image_url else [],
                    },
                    'unit_amount': price,
                },
                'quantity': item.quantity,
            })

        print("Creating Stripe checkout session with line items:", line_items)
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url='http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url='http://localhost:3000/cart',
                customer_email=request.user.email,
                metadata={
                    'cart_id': cart.id  
                }
            )
            print(f"Session created successfully with ID: {session.id}")
            return Response({'sessionId': session.id})
        except stripe.error.StripeError as e:
            print(f"Stripe error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        cart_id = session.get('metadata', {}).get('cart_id')
        
        if cart_id:
            try:
                cart = Cart.objects.get(id=cart_id)
                
                order = Order.objects.create(
                    user=cart.user,
                    total_price=cart.total_price,
                    stripe_session_id=session.id,
                    status='pending'
                )
                
                for item in cart.items.all():
                    OrderItem.objects.create(
                        order=order,
                        listing=item.listing,
                        quantity=item.quantity,
                        price=item.listing.price
                    )
                    
                    item.listing.is_active = False
                    item.listing.save()
                
                cart.items.clear()
                
            except Cart.DoesNotExist:
                pass

    return HttpResponse(status=200)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        buyer_orders = Order.objects.filter(user=self.request.user)
        
        seller_orders = Order.objects.filter(
            items__listing__owner=self.request.user
        ).distinct()
        
        # Combine both querysets
        return (buyer_orders | seller_orders).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

router = DefaultRouter()
router.register(r'listings', ListingViewSet, basename='listing')
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'orders', OrderViewSet, basename='order')
