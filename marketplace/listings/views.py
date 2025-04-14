from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .models import Listing
from .serializers import ListingSerializer
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

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
        
        if filter_by == 'popular':
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
        serializer.save()

