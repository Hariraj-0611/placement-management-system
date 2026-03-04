"""
Test script to verify hard delete functionality
Run this after deleting a user to confirm they're permanently removed from database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, StudentProfile, Application

def test_hard_delete():
    print("=== Testing Hard Delete Functionality ===\n")
    
    # Get all users (including deleted ones if soft delete was used)
    all_users = User.objects.all()
    print(f"Total users in database: {all_users.count()}")
    
    # Check for soft-deleted users (should be 0 after hard delete implementation)
    soft_deleted = User.objects.filter(is_deleted=True)
    print(f"Soft-deleted users (is_deleted=True): {soft_deleted.count()}")
    
    if soft_deleted.exists():
        print("\nSoft-deleted users found:")
        for user in soft_deleted:
            print(f"  - {user.email} (ID: {user.id}, Role: {user.role})")
    
    # Show active users
    active_users = User.objects.filter(is_deleted=False)
    print(f"\nActive users: {active_users.count()}")
    for user in active_users:
        print(f"  - {user.email} (ID: {user.id}, Role: {user.role})")
    
    # Check student profiles
    student_profiles = StudentProfile.objects.all()
    print(f"\nTotal student profiles: {student_profiles.count()}")
    
    # Check applications
    applications = Application.objects.all()
    print(f"Total applications: {applications.count()}")
    
    print("\n=== Test Complete ===")
    print("Note: After hard delete, users should be completely removed from database")
    print("If you see soft-deleted users, the hard delete may not have been applied yet")

if __name__ == '__main__':
    test_hard_delete()
