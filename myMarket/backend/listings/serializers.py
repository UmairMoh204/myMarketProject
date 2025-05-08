from rest_framework import serializers
from .models import Listing, Cart, CartItem, UserProfile, Conversation, Message, Order, OrderItem
from django.contrib.auth.models import User
from decimal import Decimal

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ListingSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    seller_name = serializers.SerializerMethodField()
    seller_email = serializers.SerializerMethodField()
    
    class Meta:
        model = Listing
        fields = ['id', 'title', 'description', 'price', 'category', 
                 'condition', 'image', 'owner', 'created_at', 
                 'updated_at', 'is_active', 'seller_name', 'seller_email']
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_seller_name(self, obj):
        if obj.owner:
            return obj.owner.username
        return None
    
    def get_seller_email(self, obj):
        if obj.owner:
            return obj.owner.email
        return None

class CartItemSerializer(serializers.ModelSerializer):
    listing = ListingSerializer(read_only=True)
    listing_id = serializers.IntegerField(write_only=True, required=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'listing', 'listing_id', 'quantity', 'created_at', 'total_price']
        read_only_fields = ['created_at']

    def validate_listing_id(self, value):
        try:
            listing = Listing.objects.get(id=value, is_active=True)
            return value
        except Listing.DoesNotExist:
            raise serializers.ValidationError("Listing not found or not active")

    def get_total_price(self, obj):
        if obj.listing and obj.listing.price:
            return Decimal(str(obj.quantity)) * Decimal(str(obj.listing.price))
        return Decimal('0.00')

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at', 'updated_at', 'total_price']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        total = Decimal('0.00')
        for item in obj.items.all():
            if item.listing and item.listing.price:
                total += Decimal(str(item.quantity)) * Decimal(str(item.listing.price))
        return total

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['items'] = CartItemSerializer(instance.items.all(), many=True).data
        return representation

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'bio', 'phone_number', 'profile_picture', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_id', 'content', 'created_at', 'is_read']
        read_only_fields = ['created_at']

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'listing', 'created_at', 'updated_at', 'last_message', 'unread_count', 'location']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_last_message(self, obj):
        messages = obj.messages.all()
        if messages:
            return MessageSerializer(messages.last()).data
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

class OrderItemSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_image = serializers.ImageField(source='listing.image', read_only=True)
    seller_username = serializers.CharField(source='listing.owner.username', read_only=True)
    seller_email = serializers.EmailField(source='listing.owner.email', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'listing', 'listing_title', 'listing_image', 'quantity', 'price', 'created_at', 'seller_username', 'seller_email']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'user_username', 'user_email', 'total_price', 'status', 'created_at', 'updated_at', 'items'] 