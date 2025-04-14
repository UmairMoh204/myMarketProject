# Generated by Django 5.2 on 2025-04-14 01:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0002_alter_listing_owner'),
    ]

    operations = [
        migrations.AddField(
            model_name='listing',
            name='category',
            field=models.CharField(choices=[('electronics', 'Electronics'), ('clothing', 'Clothing'), ('home', 'Home & Garden'), ('sports', 'Sports & Outdoors'), ('books', 'Books & Media'), ('toys', 'Toys & Games'), ('other', 'Other')], default='other', max_length=50),
        ),
        migrations.AddField(
            model_name='listing',
            name='condition',
            field=models.CharField(choices=[('new', 'New'), ('like_new', 'Like New'), ('good', 'Good'), ('fair', 'Fair'), ('poor', 'Poor')], default='good', max_length=20),
        ),
        migrations.AddField(
            model_name='listing',
            name='image_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='listing',
            name='location',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
