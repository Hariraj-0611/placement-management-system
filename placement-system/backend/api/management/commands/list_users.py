from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'List all users with their departments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--role',
            type=str,
            help='Filter by role (STUDENT, STAFF, PLACEMENT)',
            default=None
        )

    def handle(self, *args, **options):
        role = options['role']
        
        # Build query
        if role:
            users = User.objects.filter(role=role).order_by('role', 'email')
        else:
            users = User.objects.all().order_by('role', 'email')
        
        if users.count() == 0:
            self.stdout.write(self.style.WARNING('No users found'))
            return
        
        # Display header
        self.stdout.write(self.style.SUCCESS('\n' + '='*100))
        self.stdout.write(self.style.SUCCESS(f'{"ID":<5} {"Email":<30} {"Role":<12} {"Department":<25} {"Active":<8}'))
        self.stdout.write(self.style.SUCCESS('='*100))
        
        # Display users
        for user in users:
            dept = user.department if user.department else '(Not Set)'
            active = 'Yes' if user.is_active else 'No'
            
            self.stdout.write(
                f'{user.id:<5} {user.email:<30} {user.role:<12} {dept:<25} {active:<8}'
            )
        
        # Summary
        self.stdout.write(self.style.SUCCESS('='*100))
        self.stdout.write(f'\nTotal users: {users.count()}')
        
        # Count by role
        self.stdout.write('\nUsers by role:')
        for user_role in ['STUDENT', 'STAFF', 'PLACEMENT']:
            count = User.objects.filter(role=user_role).count()
            self.stdout.write(f'  {user_role}: {count}')
        
        # Count without department
        no_dept = User.objects.filter(department__isnull=True).count() + User.objects.filter(department='').count()
        if no_dept > 0:
            self.stdout.write(self.style.WARNING(f'\nUsers without department: {no_dept}'))
