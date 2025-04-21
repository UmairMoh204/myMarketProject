from django.contrib import admin
from .models import Listing

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'price', 'category', 'condition', 'is_active', 'created_at')
    list_filter = ('category', 'condition', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'owner__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Only show active listings by default
        if not request.GET.get('is_active'):
            return qs.filter(is_active=True)
        return qs
