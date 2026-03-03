from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'Create a placement officer user'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='placement_admin', help='Username for placement officer')
        parser.add_argument('--password', type=str, default='placement123', help='Password for placement officer')
        parser.add_argument('--email', type=str, default='placement@example.com', help='Email for placement officer')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        email = options['email']

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists!'))
            return

        # Create placement officer
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='PLACEMENT',
            first_name='Placement',
            last_name='Officer',
            department='Placement Cell'
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Placement officer created successfully!'))
        self.stdout.write(self.style.SUCCESS(f'  Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'  Password: {password}'))
        self.stdout.write(self.style.SUCCESS(f'  Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'  Role: PLACEMENT'))
