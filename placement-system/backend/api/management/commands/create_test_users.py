from django.core.management.base import BaseCommand
from api.models import User, StudentProfile

class Command(BaseCommand):
    help = 'Create test users for all roles (STUDENT, STAFF, PLACEMENT)'

    def handle(self, *args, **kwargs):
        # Create STUDENT user
        if not User.objects.filter(username='student1').exists():
            student_user = User.objects.create_user(
                username='student1',
                email='student1@example.com',
                password='student123',
                role='STUDENT',
                first_name='John',
                last_name='Doe',
                department='Computer Science'
            )
            StudentProfile.objects.create(
                user=student_user,
                cgpa=8.5,
                skills=['Python', 'Django', 'React']
            )
            self.stdout.write(self.style.SUCCESS('✓ Created STUDENT user: student1 / student123'))
        else:
            self.stdout.write(self.style.WARNING('✗ STUDENT user already exists'))

        # Create STAFF user
        if not User.objects.filter(username='staff1').exists():
            User.objects.create_user(
                username='staff1',
                email='staff1@example.com',
                password='staff123',
                role='STAFF',
                first_name='Jane',
                last_name='Smith',
                department='Administration'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created STAFF user: staff1 / staff123'))
        else:
            self.stdout.write(self.style.WARNING('✗ STAFF user already exists'))

        # Create PLACEMENT user
        if not User.objects.filter(username='placement1').exists():
            User.objects.create_user(
                username='placement1',
                email='placement1@example.com',
                password='placement123',
                role='PLACEMENT',
                first_name='Robert',
                last_name='Johnson',
                department='Placement Cell'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created PLACEMENT user: placement1 / placement123'))
        else:
            self.stdout.write(self.style.WARNING('✗ PLACEMENT user already exists'))

        self.stdout.write(self.style.SUCCESS('\n=== Test Users Created Successfully ==='))
        self.stdout.write('STUDENT: student1 / student123')
        self.stdout.write('STAFF: staff1 / staff123')
        self.stdout.write('PLACEMENT: placement1 / placement123')
