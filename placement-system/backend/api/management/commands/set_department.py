from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'Set department for specific user(s)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='User email',
            default=None
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='User ID',
            default=None
        )
        parser.add_argument(
            '--department',
            type=str,
            help='Department name',
            required=True
        )
        parser.add_argument(
            '--all-students',
            action='store_true',
            help='Update all students'
        )
        parser.add_argument(
            '--all-staff',
            action='store_true',
            help='Update all staff'
        )

    def handle(self, *args, **options):
        email = options['email']
        user_id = options['user_id']
        department = options['department']
        all_students = options['all_students']
        all_staff = options['all_staff']
        
        users = None
        
        # Determine which users to update
        if all_students:
            users = User.objects.filter(role='STUDENT')
            self.stdout.write(f'Updating all {users.count()} students...')
        elif all_staff:
            users = User.objects.filter(role='STAFF')
            self.stdout.write(f'Updating all {users.count()} staff members...')
        elif email:
            try:
                user = User.objects.get(email=email)
                users = [user]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with email {email} not found'))
                return
        elif user_id:
            try:
                user = User.objects.get(id=user_id)
                users = [user]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with ID {user_id} not found'))
                return
        else:
            self.stdout.write(self.style.ERROR('Please specify --email, --user-id, --all-students, or --all-staff'))
            return
        
        # Update users
        updated_count = 0
        for user in users:
            old_dept = user.department if user.department else '(Not Set)'
            user.department = department
            user.save()
            updated_count += 1
            self.stdout.write(
                f'Updated: {user.email} ({user.role}) - Department: {old_dept} → {department}'
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully updated {updated_count} user(s) with department: {department}'
            )
        )
