#!/usr/bin/env python
"""
Quick script to update user departments
Run this from the backend directory: python update_user_departments.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

def main():
    print("\n" + "="*80)
    print("USER DEPARTMENT UPDATE UTILITY")
    print("="*80)
    
    # Show current state
    print("\nCurrent Users:")
    print("-"*80)
    print(f"{'ID':<5} {'Email':<30} {'Role':<12} {'Department':<25}")
    print("-"*80)
    
    users = User.objects.all().order_by('role', 'email')
    for user in users:
        dept = user.department if user.department else '(Not Set)'
        print(f"{user.id:<5} {user.email:<30} {user.role:<12} {dept:<25}")
    
    print("-"*80)
    print(f"Total users: {users.count()}")
    
    # Count users without department
    no_dept_count = User.objects.filter(department__isnull=True).count() + \
                    User.objects.filter(department='').count()
    
    if no_dept_count == 0:
        print("\n✓ All users have departments assigned!")
        return
    
    print(f"\n⚠ Users without department: {no_dept_count}")
    
    # Ask if user wants to update
    print("\nOptions:")
    print("1. Set department for all users without department")
    print("2. Set department for all STUDENTS")
    print("3. Set department for all STAFF")
    print("4. Set department for specific user by email")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == '5':
        print("Exiting...")
        return
    
    department = input("Enter department name (e.g., Computer Science, Mechanical Engineering): ").strip()
    
    if not department:
        print("Department name cannot be empty!")
        return
    
    if choice == '1':
        # Update all users without department
        users_to_update = User.objects.filter(department__isnull=True) | User.objects.filter(department='')
        count = users_to_update.update(department=department)
        print(f"\n✓ Updated {count} users with department: {department}")
    
    elif choice == '2':
        # Update all students
        count = User.objects.filter(role='STUDENT').update(department=department)
        print(f"\n✓ Updated {count} students with department: {department}")
    
    elif choice == '3':
        # Update all staff
        count = User.objects.filter(role='STAFF').update(department=department)
        print(f"\n✓ Updated {count} staff members with department: {department}")
    
    elif choice == '4':
        # Update specific user
        email = input("Enter user email: ").strip()
        try:
            user = User.objects.get(email=email)
            user.department = department
            user.save()
            print(f"\n✓ Updated {user.email} ({user.role}) with department: {department}")
        except User.DoesNotExist:
            print(f"\n✗ User with email {email} not found!")
    
    else:
        print("Invalid choice!")
    
    print("\n" + "="*80)

if __name__ == '__main__':
    main()
