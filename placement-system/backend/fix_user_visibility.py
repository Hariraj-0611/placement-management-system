"""
Fix users not showing in Manage Users page
This ensures users are active and not marked as deleted
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

print("\n" + "="*60)
print("FIX USER VISIBILITY")
print("="*60 + "\n")

# Target emails
emails = ['raja@gmail.com', 'rani@gmail.com']

fixed_count = 0

for email in emails:
    try:
        user = User.objects.get(email=email)
        print(f"Found: {user.username} ({email})")
        
        changes = []
        
        # Check and fix is_active
        if not user.is_active:
            user.is_active = True
            changes.append("activated")
        
        # Check and fix is_deleted
        if user.is_deleted:
            user.is_deleted = False
            changes.append("unmarked as deleted")
        
        if changes:
            user.save()
            print(f"  ✓ Fixed: {', '.join(changes)}")
            fixed_count += 1
        else:
            print(f"  ✓ Already visible (no changes needed)")
        
        # Show current status
        print(f"  Status: is_active={user.is_active}, is_deleted={user.is_deleted}")
        print()
        
    except User.DoesNotExist:
        print(f"❌ Not found: {email}")
        print(f"   User was not created. Run bulk upload again.\n")

print("="*60)
if fixed_count > 0:
    print(f"✓ Fixed {fixed_count} user(s)")
    print("\nNOW REFRESH YOUR BROWSER:")
    print("  Windows/Linux: Ctrl + Shift + R")
    print("  Mac: Cmd + Shift + R")
else:
    print("✓ All users are already visible")
    print("\nIf users still don't show:")
    print("  1. Hard refresh browser (Ctrl + Shift + R)")
    print("  2. Clear all filters on Manage Users page")
    print("  3. Check browser console for errors (F12)")
print("="*60 + "\n")
