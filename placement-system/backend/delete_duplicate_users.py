"""
Script to delete users with duplicate emails from your Excel file
Run this before uploading your Excel file
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, StudentProfile

def delete_duplicate_users():
    """Delete users that are causing duplicate email errors"""
    
    # Emails from your Excel file
    emails_to_delete = [
        'raja@gmail.com',
        'rani@gmail.com',
    ]
    
    print("\n" + "="*60)
    print("Deleting Duplicate Users")
    print("="*60 + "\n")
    
    deleted_count = 0
    
    for email in emails_to_delete:
        try:
            user = User.objects.get(email=email)
            username = user.username
            role = user.role
            
            # Delete the user (this will cascade delete StudentProfile too)
            user.delete()
            
            print(f"✓ Deleted: {username} ({email})")
            print(f"  Role: {role}")
            deleted_count += 1
            
        except User.DoesNotExist:
            print(f"⚠ Not found: {email} (already deleted or doesn't exist)")
        except Exception as e:
            print(f"❌ Error deleting {email}: {str(e)}")
    
    print("\n" + "="*60)
    print(f"Deleted {deleted_count} user(s)")
    print("="*60)
    
    if deleted_count > 0:
        print("\n✓ You can now upload your Excel file again!")
        print("  The users will be created successfully.\n")
    else:
        print("\n⚠ No users were deleted.")
        print("  The emails might not exist in the database.\n")

if __name__ == "__main__":
    # Ask for confirmation
    print("\n" + "="*60)
    print("This will DELETE the following users:")
    print("="*60)
    print("  - raja@gmail.com")
    print("  - rani@gmail.com")
    print("="*60)
    
    response = input("\nAre you sure you want to continue? (yes/no): ").strip().lower()
    
    if response == 'yes':
        delete_duplicate_users()
    else:
        print("\n❌ Operation cancelled. No users were deleted.\n")
