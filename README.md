
# Marketplace Backend

This is the backend for the Marketplace application, built with Django and Django REST Framework.

## Local Development

EASY:
cd marketplace; python manage.py runserver
cd frontend; npm start

Backend server at http://127.0.0.1:8000/
or /admin at end
Frontend server at http://localhost:3000

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```env
DEBUG=True
DJANGO_SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=sqlite:///db.sqlite3
STATIC_ROOT=staticfiles
MEDIA_ROOT=media
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

FOR FRONT END
npm install
npm start


## API Documentation

The API documentation is available at `/api/docs/` when running the server.

## Account Username and Password

Username: admin
Password: adminadmin123

## Available Endpoints

- `/api/auth/register/` - User registration
- `/api/auth/token/` - JWT token authentication
- `/api/listings/` - Listings CRUD operations
- `/api/user/profile/` - User profile management
- `/api/listings/my-listings/` - User's listings
- `/api/listings/popular/` - Popular listings
- `/api/listings/recent/` - Recent listings
- `/api/listings/active/` - Active listings
- `/api/listings/price-range/` - Listings by price range 
