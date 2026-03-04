"""
QUICK FIX: Delete raja@gmail.com and rani@gmail.com
Run this to fix your bulk upload issue immediately
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

print("\n" + "="*60)
print("QUICK FIX - Deleting Duplicate Users")
print("="*60 + "\n")

emails = ['raja@gmail.com', 'rani@gmail.com']
deleted = 0

for email in emails:
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        print(f"Deleting: {user.username} ({email}) - {user.role}")
        user.delete()
        deleted += 1
    else:
        print(f"Not found: {email}")

print(f"\n✓ Deleted {deleted} user(s)")
print("\n" + "="*60)
print("NOW TRY UPLOADING YOUR EXCEL FILE AGAIN!")
print("="*60 + "\n")
