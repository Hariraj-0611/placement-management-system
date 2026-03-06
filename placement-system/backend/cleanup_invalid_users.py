#!/usr/bin/env python
"""
Clean up invalid users (users with nan, empty, or invalid data)
Run: python cleanup_invalid_users.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

def main():
    print("\n" + "="*80)
    print("CLEANUP INVALID USERS")
    print("="*80)
    
    # Find users with invalid data
    invalid_users = []
    
    # Check for users with 'nan' values
    nan_users = User.objects.filter(email='nan') | User.objects.filter(username='nan') | User.objects.filter(department='nan')
    invalid_users.extend(nan_users)
    
    # Check for users with empty email
    empty_email = User.objects.filter(email='') | User.objects.filter(email__isnull=True)
    invalid_users.extend(empty_email)
    
    # Remove duplicates
    invalid_users = list(set(invalid_users))
    
    if not invalid_users:
        print("\n✓ No invalid users found!")
        return
    
    print(f"\nFound {len(invalid_users)} invalid user(s):")
    print("-"*80)
    
    for user in invalid_users:
        print(f"ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Username: {user.username}")
        print(f"  Department: {user.department}")
        print(f"  Role: {user.role}")
        print(f"  Is Active: {user.is_active}")
        print(f"  Is Deleted: {user.is_deleted}")
        print("-"*80)
    
    print("\nOptions:")
    print("1. Mark all as deleted (soft delete)")
    print("2. Permanently delete all")
    print("3. Exit without changes")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        # Soft delete
        for user in invalid_users:
            user.is_deleted = True
            user.is_active = False
            user.save()
        print(f"\n✓ Marked {len(invalid_users)} user(s) as deleted")
    
    elif choice == '2':
        # Permanent delete
        confirm = input("Are you sure? This cannot be undone! (yes/no): ").strip().lower()
        if confirm == 'yes':
            count = len(invalid_users)
            for user in invalid_users:
                user.delete()
            print(f"\n✓ Permanently deleted {count} user(s)")
        else:
            print("Cancelled.")
    
    elif choice == '3':
        print("Exiting without changes.")
    
    else:
        print("Invalid choice!")
    
    print("\n" + "="*80 + "\n")

if __name__ == '__main__':
    main()
