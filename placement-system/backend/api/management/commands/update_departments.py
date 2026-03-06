from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'Update department for existing users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--department',
            type=str,
            help='Department name to assign to users without department',
            default='Computer Science'
        )
        parser.add_argument(
            '--role',
            type=str,
            help='Filter by role (STUDENT, STAFF, PLACEMENT)',
            default=None
        )

    def handle(self, *args, **options):
        department = options['department']
        role = options['role']
        
        # Build query
        query = User.objects.filter(department__isnull=True) | User.objects.filter(department='')
        
        if role:
            query = query.filter(role=role)
        
        users = query.all()
        count = users.count()
        
        if count == 0:
            self.stdout.write(self.style.WARNING('No users found without department'))
            return
        
        # Update users
        updated = users.update(department=department)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated} users with department: {department}'
            )
        )
        
        # Show summary
        self.stdout.write('\nSummary by role:')
        for user_role in ['STUDENT', 'STAFF', 'PLACEMENT']:
            role_count = User.objects.filter(role=user_role, department=department).count()
            self.stdout.write(f'  {user_role}: {role_count} users')
