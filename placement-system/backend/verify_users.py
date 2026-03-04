"""
Verify that users were created successfully
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, StudentProfile

print("\n" + "="*60)
print("USER VERIFICATION")
print("="*60 + "\n")

# Check for raja and rani
emails = ['raja@gmail.com', 'rani@gmail.com']

for email in emails:
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        print(f"✓ Found: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.role}")
        print(f"  Active: {user.is_active}")
        print(f"  Deleted: {user.is_deleted}")
        print(f"  Department: {user.department}")
        
        if user.role == 'STUDENT':
            try:
                profile = StudentProfile.objects.get(user=user)
                print(f"  CGPA: {profile.cgpa}")
                print(f"  Profile exists: Yes")
            except StudentProfile.DoesNotExist:
                print(f"  Profile exists: No")
        print()
    else:
        print(f"❌ Not found: {email}\n")

# Show all users
print("="*60)
print("ALL USERS IN DATABASE")
print("="*60 + "\n")

all_users = User.objects.filter(is_deleted=False).order_by('-id')
print(f"Total active users: {all_users.count()}\n")

for user in all_users:
    status = "Active" if user.is_active else "Inactive"
    print(f"- {user.username} ({user.email}) - {user.role} - {status}")

print("\n" + "="*60)
print("STUDENTS ONLY")
print("="*60 + "\n")

students = User.objects.filter(role='STUDENT', is_deleted=False)
print(f"Total students: {students.count()}\n")

for student in students:
    print(f"- {student.username} ({student.email}) - {student.department}")

print("\n" + "="*60 + "\n")
