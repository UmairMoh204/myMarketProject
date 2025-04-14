from rest_framework import serializers
from .models import Listing
from django.contrib.auth.models import User
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'date_of_birth', 'location', 'bio',
            'phone_number', 'profile_image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ListingSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    seller_name = serializers.SerializerMethodField()
    seller_email = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'price', 'created_at', 'updated_at', 
            'owner', 'is_active', 'category', 'condition', 'location', 'image_url',
            'seller_name', 'seller_email'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_seller_name(self, obj):
        if obj.owner:
            return obj.owner.username
        return None
    
    def get_seller_email(self, obj):
        if obj.owner:
            return obj.owner.email
        return None
