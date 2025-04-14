
- Python 3.8 or higher
- Node.js 14.0 or higher
- npm (Node Package Manager)
- Git

## Project Structure

```
myMarketProject/
frontend           # React frontend application
marketplace        # Django backend application
venv               # Python virtual environment
```

## Backend Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
.\venv\Scripts\activate

python3 -m venv venv
source venv/bin/activate
```

2. Install required Python packages:
```bash
pip install -r requirements.txt
```

Required Python packages:
- Django==5.2
- djangorestframework==3.14.0
- django-cors-headers==4.3.1
- Pillow==10.2.0
- python-dotenv==1.0.1

3. Navigate to the Django project directory:
```bash
cd marketplace
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Start the Django development server:
```bash
python manage.py runserver
```

Host Server: `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install required npm packages:
```bash
npm install
```

Required npm packages:
- @emotion/react: ^11.11.3
- @emotion/styled: ^11.11.0
- @mui/icons-material: ^5.15.10
- @mui/material: ^5.15.10
- axios: ^1.6.7
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.22.1
- react-scripts: 5.0.1

3. Start the server:
```bash
npm start
```

Host Server: `http://localhost:3000`




