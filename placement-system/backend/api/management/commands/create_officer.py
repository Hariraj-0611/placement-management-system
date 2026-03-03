from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'Create a placement officer user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)
        parser.add_argument('email', type=str)
        parser.add_argument('password', type=str)

    def handle(self, *args, **options):
        user = User.objects.create_user(
            username=options['username'],
            email=options['email'],
            password=options['password'],
            role='officer',
            is_staff=True
        )
        self.stdout.write(self.style.SUCCESS(f'Officer created successfully: {user.username}'))