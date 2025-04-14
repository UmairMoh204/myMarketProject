from django.contrib import admin
from django.urls import re_path, path, include
from marketplace import views as marketplace_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('marketplace/', marketplace_views.index, name='marketplace-index'),  
    path('detail/<int:post_id>/', marketplace_views.detail, name='post-detail'),  
    path('', marketplace_views.index, name='home'),  
]
