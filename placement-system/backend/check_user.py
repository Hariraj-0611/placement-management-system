"""
Quick script to check why a specific user is not showing up
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, StudentProfile

def check_user(email):
    print(f"\n{'='*60}")
    print(f"CHECKING USER: {email}")
    print('='*60)
    
    try:
        user = User.objects.get(email=email)
        print(f"\n✅ USER FOUND:")
        print(f"   ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   Department: {user.department or 'NOT SET ⚠️'}")
        print(f"   is_active: {user.is_active}")
        print(f"   is_deleted: {user.is_deleted}")
        print(f"   is_superuser: {user.is_superuser}")
        
        # Check if student has profile
        if user.role == 'STUDENT':
            try:
                profile = StudentProfile.objects.get(user=user)
                print(f"\n✅ STUDENT PROFILE FOUND:")
                print(f"   Profile ID: {profile.id}")
                print(f"   CGPA: {profile.cgpa}")
                print(f"   Register Number: {profile.register_number or 'Not Set'}")
                print(f"   Skills: {profile.skills}")
                print(f"   Profile Approved: {profile.profile_approved}")
                print(f"   Is Eligible: {profile.is_eligible}")
            except StudentProfile.DoesNotExist:
                print(f"\n❌ NO STUDENT PROFILE FOUND!")
                print(f"   This user has role=STUDENT but no StudentProfile record")
        
        # Check why not visible to staff
        print(f"\n{'='*60}")
        print("VISIBILITY CHECK:")
        print('='*60)
        
        if user.is_deleted:
            print("❌ User is DELETED (is_deleted=True)")
            print("   Solution: Set is_deleted=False")
        
        if not user.is_active:
            print("❌ User is INACTIVE (is_active=False)")
            print("   Solution: Set is_active=True")
        
        if not user.department:
            print("❌ User has NO DEPARTMENT assigned")
            print("   Solution: Assign a department")
        else:
            print(f"✅ User has department: {user.department}")
            
            # Check how many staff are in this department
            staff_in_dept = User.objects.filter(
                role='STAFF',
                department=user.department,
                is_active=True,
                is_deleted=False
            )
            print(f"   Staff members in '{user.department}': {staff_in_dept.count()}")
            for s in staff_in_dept:
                print(f"      - {s.username} ({s.email})")
        
        # Check all staff departments
        print(f"\n{'='*60}")
        print("ALL STAFF DEPARTMENTS:")
        print('='*60)
        all_staff = User.objects.filter(role='STAFF', is_active=True, is_deleted=False)
        for staff in all_staff:
            print(f"   {staff.username}: {staff.department or 'NO DEPARTMENT'}")
        
    except User.DoesNotExist:
        print(f"\n❌ USER NOT FOUND with email: {email}")
        print("\nSearching for similar emails...")
        similar = User.objects.filter(email__icontains=email.split('@')[0])
        if similar.exists():
            print(f"Found {similar.count()} similar users:")
            for u in similar:
                print(f"   - {u.email} (Username: {u.username}, Role: {u.role})")
        else:
            print("No similar users found")
    
    print(f"\n{'='*60}\n")


if __name__ == '__main__':
    check_user('placementstudent@gmail.com')
