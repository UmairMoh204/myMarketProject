from rest_framework import serializers
from .models import Listing, Cart, CartItem, UserProfile, Conversation, Message
from django.contrib.auth.models import User

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
    listing_id = serializers.IntegerField(write_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'listing', 'listing_id', 'quantity', 'added_at', 'total_price']
        read_only_fields = ['added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at', 'updated_at', 'total_price']
        read_only_fields = ['user', 'created_at', 'updated_at']

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
        fields = ['id', 'participants', 'listing', 'created_at', 'updated_at', 'last_message', 'unread_count']
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