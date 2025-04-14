# MyMarket Project

A marketplace application built with Django REST Framework and React.

## Project Structure
```
myMarketProject/
├── marketplace/     # Django backend
└── frontend/       # React frontend
```

## Development Setup

### Backend Setup

1. Create and activate a virtual environment:
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate
```

2. Install backend dependencies:
```powershell
# First, make sure you're in the project root
cd marketplace
pip install -r requirements.txt
```

3. Set up environment variables:
```powershell
# Create a .env file in the marketplace directory with:
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

4. Run database migrations:
```powershell
# Make sure you're in the marketplace directory
python manage.py migrate
```

5. Start the Django development server:
```powershell
# In PowerShell, use semicolon instead of &&
cd marketplace; $env:PYTHONPATH = "."; python manage.py runserver
```

The backend API will be available at:
- Main Application: `http://localhost:3000` (React frontend)
- API Root: `http://localhost:8000/api/`
- Admin Interface: `http://localhost:8000/admin/`
- API Documentation: `http://localhost:8000/swagger/`

### Frontend Setup

1. Open a new terminal window (keep the backend server running)

2. Navigate to the frontend directory:
```powershell
# From the project root
cd frontend
```

3. Install frontend dependencies:
```powershell
npm install
```

4. Start the React development server:
```powershell
npm start
```

The frontend will be available at `http://localhost:3000`

## Important URLs

- Main Application (Frontend): `http://localhost:3000`
  - This is where you should access the application as a user
  - The frontend will automatically communicate with the backend API

- Backend API Endpoints:
  - API Root: `http://localhost:8000/api/`
  - Admin Interface: `http://localhost:8000/admin/`
  - API Documentation: `http://localhost:8000/swagger/`
  - JWT Token: `http://localhost:8000/api/token/`

## Development Tips

- Keep both servers running in separate terminal windows:
  - Terminal 1: Django backend server (port 8000)
  - Terminal 2: React frontend server (port 3000)

- PowerShell Command Tips:
  - Use semicolon (`;`) instead of `&&` to chain commands
  - Set Python path before running Django server: `$env:PYTHONPATH = "."`
  - Always run Django commands from the `marketplace` directory
  - Always run npm commands from the `frontend` directory

- If port 3000 is already in use:
  - React will automatically prompt to use a different port
  - Type 'y' to accept the alternative port

## Troubleshooting

1. If you see "No module named 'marketplace.settings'":
   - Make sure you're in the `marketplace` directory
   - Set the Python path: `$env:PYTHONPATH = "."`

2. If you see a 404 at `http://localhost:8000`:
   - This is normal - use `http://localhost:3000` instead
   - The root URL will redirect to the API documentation
   - The main application is served by React at port 3000

3. If npm commands fail:
   - Make sure you're in the `frontend` directory
   - Check that Node.js is installed
   - Try deleting `node_modules` and running `npm install` again

## API Documentation

The API documentation is available at:
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

## Environment Variables

Create a `.env` file in the `marketplace` directory with the following variables:
```
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

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



