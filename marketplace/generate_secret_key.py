from django.core.management.utils import get_random_secret_key

if __name__ == '__main__':
    print('Generated Django Secret Key:')
    print(get_random_secret_key())
    print('\nCopy this key and update it in your .env file for the DJANGO_SECRET_KEY variable.') 