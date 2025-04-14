# MyMarket Project

A full-stack marketplace application built with Django REST Framework and React.

## Features

- User authentication with JWT tokens
- User profile management with image upload
- Product listing creation and management
- Shopping cart functionality
- Search and filter capabilities
- Responsive design with Material-UI

## Tech Stack

### Backend
- Django 5.0.3
- Django REST Framework 3.14.0
- PostgreSQL
- JWT Authentication
- Pillow for image processing
- Whitenoise for static files
- Gunicorn for production server

### Frontend
- React 18
- Material-UI 5
- Axios for API calls
- React Router for navigation
- Context API for state management

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/myMarketProject.git
cd myMarketProject
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
cd marketplace
python manage.py migrate

# Start the development server
python manage.py runserver
```

3. Set up the frontend:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```



