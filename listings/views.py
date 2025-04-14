from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .models import Listing
from .serializers import ListingSerializer, UserProfileSerializer
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import UserProfile
from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'listings': reverse('listing-list', request=request, format=format),
    })

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Listing.objects.filter(is_active=True)
        
        filter_by = self.request.query_params.get('filter', None)
        
        if filter_by == 'my_listings' and self.request.user.is_authenticated:
            queryset = Listing.objects.filter(owner=self.request.user)
        elif filter_by == 'popular':
            recent_date = timezone.now() - timedelta(days=7)
            queryset = queryset.annotate(
                view_count=Count('id')
            ).order_by('-view_count', '-created_at')
        elif filter_by == 'recent':
            queryset = queryset.order_by('-created_at')
        elif filter_by == 'price_low':
            queryset = queryset.order_by('price')
        elif filter_by == 'price_high':
            queryset = queryset.order_by('-price')
        else:
            queryset = queryset.order_by('-created_at')
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not all([username, email, password]):
            return Response(
                {'error': 'Please provide username, email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if username exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if email exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        return Response({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_by_email(request, email):
    try:
        user = User.objects.get(email=email)
        return Response({
            'username': user.username,
            'email': user.email
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'No user found with this email'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)

    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

