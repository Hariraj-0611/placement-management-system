"""
Quick script to check if emails from your Excel file already exist in the database
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

def check_emails():
    """Check if specific emails exist"""
    emails_to_check = [
        'raja@gmail.com',
        'rani@gmail.com',
    ]
    
    print("\n" + "="*60)
    print("Checking if emails exist in database")
    print("="*60 + "\n")
    
    for email in emails_to_check:
        exists = User.objects.filter(email=email).exists()
        if exists:
            user = User.objects.get(email=email)
            print(f"❌ {email}")
            print(f"   Already exists!")
            print(f"   Username: {user.username}")
            print(f"   Role: {user.role}")
            print(f"   Created: {user.date_joined}")
            print()
        else:
            print(f"✓ {email}")
            print(f"   Available - can be created")
            print()
    
    print("="*60)
    print(f"Total users in database: {User.objects.count()}")
    print(f"Total students: {User.objects.filter(role='STUDENT').count()}")
    print("="*60 + "\n")
    
    # Ask if user wants to delete
    existing_emails = [email for email in emails_to_check if User.objects.filter(email=email).exists()]
    
    if existing_emails:
        print(f"\nFound {len(existing_emails)} existing email(s).")
        response = input("Do you want to delete these users? (yes/no): ").strip().lower()
        
        if response == 'yes':
            for email in existing_emails:
                user = User.objects.get(email=email)
                username = user.username
                user.delete()
                print(f"✓ Deleted user: {username} ({email})")
            print(f"\n✓ Successfully deleted {len(existing_emails)} user(s)")
            print("You can now try uploading your Excel file again.")
        else:
            print("\nNo users deleted.")
            print("To upload these users, you need to either:")
            print("1. Delete them manually")
            print("2. Use different email addresses")
    else:
        print("✓ All emails are available!")
        print("You can proceed with the bulk upload.")

if __name__ == "__main__":
    check_emails()
