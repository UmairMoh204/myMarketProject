import os
import django
import sys

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'marketplace.settings')
django.setup()

from listings.models import Listing

listings = Listing.objects.all()
print(f"Number of listings: {listings.count()}")

for listing in listings:
    print(f"ID: {listing.id}")
    print(f"Title: {listing.title}")
    print(f"Price: {listing.price}")
    print(f"Category: {listing.category}")
    print(f"Condition: {listing.condition}")
    print(f"Owner: {listing.owner.username}")
    print(f"Image: {listing.image}")
    print("-" * 50) 