import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, StudentProfile

# Check all users
users = User.objects.all()
print("=== All Users ===")
for user in users:
    print(f"Username: {user.username}, Role: {user.role}, Active: {user.is_active}")
    if user.role == 'STUDENT':
        try:
            profile = StudentProfile.objects.get(user=user)
            print(f"  ✓ Has StudentProfile - CGPA: {profile.cgpa}, Skills: {profile.skills}")
        except StudentProfile.DoesNotExist:
            print(f"  ✗ No StudentProfile found!")
    print()
