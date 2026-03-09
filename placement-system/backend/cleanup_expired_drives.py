#!/usr/bin/env python
"""
Cleanup script for expired company drives
Run this script daily via cron job or task scheduler
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.utils import timezone
from api.models import CompanyDrive

def cleanup_expired_drives():
    """Delete company drives where drive_date has passed"""
    today = timezone.now().date()
    
    # Find expired drives
    expired_drives = CompanyDrive.objects.filter(drive_date__lt=today)
    count = expired_drives.count()
    
    if count == 0:
        print(f"[{timezone.now()}] No expired drives found.")
        return
    
    # Log expired drives
    print(f"[{timezone.now()}] Found {count} expired drive(s):")
    for drive in expired_drives:
        print(f"  - {drive.company_name} ({drive.job_role}) - Drive Date: {drive.drive_date}")
    
    # Delete expired drives
    deleted_count, _ = expired_drives.delete()
    print(f"[{timezone.now()}] ✓ Successfully deleted {deleted_count} expired drive(s)")

if __name__ == '__main__':
    cleanup_expired_drives()
