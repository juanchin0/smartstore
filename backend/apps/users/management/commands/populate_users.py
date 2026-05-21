from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate default users'

    def handle(self, *args, **options):
        users_data = [
            {'email': 'user1@test.com', 'username': 'juan_gomez', 'password': 'Test123!', 'first_name': 'Juan', 'last_name': 'Gomez'},
            {'email': 'user2@test.com', 'username': 'guillermo_gomez', 'password': 'Test123!', 'first_name': 'Guillermo', 'last_name': 'Gomez'},
            {'email': 'user3@test.com', 'username': 'test_user', 'password': 'Test123!', 'first_name': 'Test', 'last_name': 'User'},
        ]

        for user_data in users_data:
            if not User.objects.filter(email=user_data['email']).exists():
                User.objects.create_user(**user_data)
                self.stdout.write(self.style.SUCCESS(f"OK Usuario {user_data['email']} creado"))
            else:
                self.stdout.write(self.style.WARNING(f"SKIP Usuario {user_data['email']} ya existe"))
