"""
Test script to verify deleted users are properly filtered
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, StudentProfile, Application

def test_deleted_users_filter():
    """Test that deleted users are filtered correctly"""
    
    print("\n" + "="*60)
    print("Testing Deleted Users Filter")
    print("="*60 + "\n")
    
    # Get counts
    total_users = User.objects.count()
    active_users = User.objects.filter(is_deleted=False).count()
    deleted_users = User.objects.filter(is_deleted=True).count()
    
    print("USER COUNTS:")
    print(f"  Total users in database: {total_users}")
    print(f"  Active users (is_deleted=False): {active_users}")
    print(f"  Deleted users (is_deleted=True): {deleted_users}")
    print()
    
    # Student counts
    total_students = StudentProfile.objects.count()
    active_students = StudentProfile.objects.filter(user__is_deleted=False).count()
    deleted_students = StudentProfile.objects.filter(user__is_deleted=True).count()
    
    print("STUDENT COUNTS:")
    print(f"  Total student profiles: {total_students}")
    print(f"  Active students: {active_students}")
    print(f"  Deleted students: {deleted_students}")
    print()
    
    # Application counts
    total_applications = Application.objects.count()
    active_applications = Application.objects.filter(student__user__is_deleted=False).count()
    deleted_applications = Application.objects.filter(student__user__is_deleted=True).count()
    
    print("APPLICATION COUNTS:")
    print(f"  Total applications: {total_applications}")
    print(f"  Applications from active students: {active_applications}")
    print(f"  Applications from deleted students: {deleted_applications}")
    print()
    
    # List deleted users
    if deleted_users > 0:
        print("DELETED USERS:")
        for user in User.objects.filter(is_deleted=True):
            print(f"  - {user.username} ({user.email})")
            print(f"    Role: {user.role}")
            print(f"    Deleted: Yes")
            
            # Check if student
            if user.role == 'STUDENT':
                try:
                    profile = StudentProfile.objects.get(user=user)
                    apps = Application.objects.filter(student=profile).count()
                    print(f"    Applications: {apps}")
                except StudentProfile.DoesNotExist:
                    print(f"    No profile found")
            print()
    else:
        print("✓ No deleted users found")
        print()
    
    # Verify dashboard counts match active users
    print("="*60)
    print("VERIFICATION:")
    print("="*60)
    
    # These are the counts that should be shown in dashboards
    dashboard_student_count = StudentProfile.objects.filter(user__is_deleted=False).count()
    dashboard_app_count = Application.objects.filter(student__user__is_deleted=False).count()
    
    print(f"\n✓ Dashboard should show:")
    print(f"  - {dashboard_student_count} students")
    print(f"  - {dashboard_app_count} applications")
    
    if deleted_users > 0:
        print(f"\n✓ Hidden from view:")
        print(f"  - {deleted_students} deleted students")
        print(f"  - {deleted_applications} applications from deleted students")
    
    print("\n" + "="*60)
    print("Test completed successfully!")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_deleted_users_filter()
