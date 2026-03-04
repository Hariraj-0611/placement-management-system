"""
Test if students can login with their credentials
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import authenticate
from api.models import User, StudentProfile

print("\n" + "="*60)
print("STUDENT LOGIN TEST")
print("="*60 + "\n")

# Test credentials
test_students = [
    {'email': 'raja@gmail.com', 'password': '06112004'},
    {'email': 'rani@gmail.com', 'password': '06112004'},
]

for student_data in test_students:
    email = student_data['email']
    password = student_data['password']
    
    print(f"Testing: {email}")
    print(f"Password: {password}")
    
    try:
        # Check if user exists
        user = User.objects.get(email=email)
        print(f"  ✓ User exists")
        print(f"    Username: {user.username}")
        print(f"    Role: {user.role}")
        print(f"    Active: {user.is_active}")
        print(f"    Deleted: {user.is_deleted}")
        
        # Check if user has student profile
        if user.role == 'STUDENT':
            try:
                profile = StudentProfile.objects.get(user=user)
                print(f"    Student Profile: ✓ Exists")
                print(f"    CGPA: {profile.cgpa}")
                print(f"    Department: {user.department}")
            except StudentProfile.DoesNotExist:
                print(f"    Student Profile: ❌ Missing")
        
        # Test authentication
        auth_user = authenticate(username=user.username, password=password)
        
        if auth_user:
            print(f"  ✓ LOGIN SUCCESSFUL")
            print(f"    Can login with: {email} / {password}")
            
            if not auth_user.is_active:
                print(f"    ⚠ Warning: User is inactive")
            
            if auth_user.is_deleted:
                print(f"    ⚠ Warning: User is marked as deleted")
        else:
            print(f"  ❌ LOGIN FAILED")
            print(f"    Password is incorrect")
            print(f"    Expected: {password}")
            print(f"    Hint: Check if password was set correctly during creation")
        
    except User.DoesNotExist:
        print(f"  ❌ User not found")
        print(f"    User with email {email} does not exist")
        print(f"    Run bulk upload to create this user")
    
    print()

print("="*60)
print("TEST COMPLETE")
print("="*60)
print("\nTo test in browser:")
print("1. Logout from placement account")
print("2. Go to login page")
print("3. Enter email and password from above")
print("4. Should redirect to Student Dashboard")
print("\n" + "="*60 + "\n")
