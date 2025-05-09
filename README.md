# Marketplace Backend

A full-featured marketplace application backend built with Django and Django REST Framework, featuring user authentication, product listings, shopping cart functionality, and Stripe payment integration.

## Features

- User authentication with JWT tokens
- Product listings management
- Shopping cart functionality
- User profiles
- Messaging system between buyers and sellers
- Stripe payment integration
- Email verification
- Password reset functionality
- Admin dashboard

## Tech Stack

- Django
- Django REST Framework
- SQLlite
- JWT Authentication
- Stripe API
- CORS support
- Swagger/OpenAPI documentation

## Prerequisites

- Python 3.8+
- Node.js and npm (for frontend)
- Virtual environment tool
- Git

## Local Development

### Quick Start

# Backend
cd marketplace
python manage.py runserver

# Frontend (in a new terminal)
cd frontend
npm start

(You must have both Frontend and Backend running simultaneously. 

- Backend server: http://127.0.0.1:8000/
- Admin interface: http://127.0.0.1:8000/admin
- Frontend server: http://localhost:3000

### Detailed Setup

1. **Create and activate virtual environment**

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


2. **Install dependencies**

 pip install -r requirements.txt


3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

 DEBUG=True
 DJANGO_SECRET_KEY=your_secret_key_here
 ALLOWED_HOSTS=localhost,127.0.0.1

 # CORS settings
 CORS_ALLOWED_ORIGINS=http://localhost:3000

 # Database settings
 DATABASE_URL=sqlite:///db.sqlite3

 # Static and media files
 STATIC_ROOT=staticfiles
 MEDIA_ROOT=media

 # Email settings (optional)
 EMAIL_HOST_USER=your_email@example.com
 EMAIL_HOST_PASSWORD=your_email_password
 DEFAULT_FROM_EMAIL=your_email@example.com

 # Stripe settings (optional)
 STRIPE_PUBLIC_KEY=your_stripe_public_key
 STRIPE_SECRET_KEY=your_stripe_secret_key
 STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

5. **Database Setup**

 python manage.py migrate


6. **Create Superuser**

 python manage.py createsuperuser

 Default admin credentials:
 - Username: admin
 - Password: adminadmin123

7. **Frontend Setup**

 cd frontend
 npm install
 npm start


## API Documentation

## Available Endpoints

### Authentication
- `/api/register/` - User registration
- `/api/token/` - JWT token authentication
- `/api/token/refresh/` - JWT token refresh
- `/api/verify-email/<uidb64>/<token>/` - Email verification
- `/api/request-password-reset/` - Request password reset
- `/api/reset-password/<uidb64>/<token>/` - Reset password

### Listings
- `/api/listings/` - Listings CRUD operations
- `/api/listings/<id>/contact/` - Contact listing owner
- `/api/listings/my-listings/` - User's listings
- `/api/listings/popular/` - Popular listings
- `/api/listings/recent/` - Recent listings
- `/api/listings/active/` - Active listings

### User Management
- `/api/user/profile/` - User profile management
- `/api/profiles/` - User profiles

### Shopping
- `/api/carts/` - Cart management
- `/api/carts/<id>/add_item/` - Add item to cart
- `/api/carts/<id>/remove_item/` - Remove item from cart
- `/api/carts/<id>/update_quantity/` - Update cart item quantity
- `/api/carts/<id>/clear/` - Clear cart
- `/api/orders/` - Order management

### Payments
- `/api/create-checkout-session/` - Create Stripe checkout session
- `/api/webhook/stripe/` - Stripe webhook endpoint

### Backend

- [Django](https://www.djangoproject.com/) 
- [Django REST Framework](https://www.django-rest-framework.org/) 
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers) 
- [django-filter](https://django-filter.readthedocs.io/) 
- [drf-yasg](https://drf-yasg.readthedocs.io/) 
- [Pillow](https://python-pillow.org/) 
- [Stripe](https://stripe.com/) 

### Frontend

- [React](https://reactjs.org/) 
- [Material-UI](https://mui.com/)
- [Axios](https://axios-http.com/) 

## Resources

### Icons & Images

- [Material Icons](https://fonts.google.com/icons) 

### Documentation

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Stripe Documentation](https://stripe.com/docs)



