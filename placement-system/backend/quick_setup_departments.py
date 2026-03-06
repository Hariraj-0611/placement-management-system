#!/usr/bin/env python
"""
Quick setup: Set all users to Computer Science department
Run: python quick_setup_departments.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

def main():
    department = "Computer Science"
    
    print("\n" + "="*80)
    print("QUICK DEPARTMENT SETUP")
    print("="*80)
    print(f"\nThis will set ALL users to department: {department}")
    
    # Count users
    total_users = User.objects.count()
    students = User.objects.filter(role='STUDENT').count()
    staff = User.objects.filter(role='STAFF').count()
    placement = User.objects.filter(role='PLACEMENT').count()
    
    print(f"\nUsers to update:")
    print(f"  Students: {students}")
    print(f"  Staff: {staff}")
    print(f"  Placement Officers: {placement}")
    print(f"  Total: {total_users}")
    
    confirm = input(f"\nProceed? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("Cancelled.")
        return
    
    # Update all users
    updated = User.objects.all().update(department=department)
    
    print(f"\n✓ Successfully updated {updated} users!")
    print(f"  All users now have department: {department}")
    
    print("\n" + "="*80)
    print("DONE! Staff members can now see students from their department.")
    print("="*80 + "\n")

if __name__ == '__main__':
    main()
