# Expired Drives Cleanup System

## Overview
Automatic system to handle expired company drives based on drive date. Expired drives are automatically hidden from all views and can be permanently deleted.

## Implementation

### 1. Automatic Filtering (Real-time)
**Location**: `api/views.py` - `CompanyDriveViewSet.get_queryset()`

**Behavior**:
- All drive queries automatically filter out expired drives
- Expired drives are hidden from:
  - Student available drives list
  - Staff drives view
  - Placement officer drives list
  - Drive detail views

**Logic**:
```python
today = timezone.now().date()
queryset = CompanyDrive.objects.filter(
    drive_date__gte=today  # Only future or today's drives
)
```

**Result**:
- Students cannot see or apply to expired drives
- Staff cannot view expired drives
- Placement officers cannot see expired drives in list
- Expired drives are effectively "soft hidden"

### 2. Manual Deletion (Management Command)
**Location**: `api/management/commands/delete_expired_drives.py`

**Usage**:
```bash
cd placement-system/backend
python manage.py delete_expired_drives
```

**Output Example**:
```
Found 3 expired drive(s):
  - Google (Software Engineer) - Drive Date: 2026-02-15
  - Microsoft (Data Analyst) - Drive Date: 2026-03-01
  - Amazon (Cloud Engineer) - Drive Date: 2026-03-05

✓ Successfully deleted 3 expired drive(s)
```

**What Gets Deleted**:
- Company drive records
- Associated applications (CASCADE delete)
- All related data

### 3. Automated Cleanup Script
**Location**: `cleanup_expired_drives.py`

**Usage**:
```bash
cd placement-system/backend
python cleanup_expired_drives.py
```

**Features**:
- Standalone script (doesn't require Django management command)
- Can be run via cron job or task scheduler
- Logs all deletions with timestamps
- Safe to run multiple times (idempotent)

## Scheduling Options

### Option 1: Linux/Mac Cron Job
**Setup**:
```bash
# Edit crontab
crontab -e

# Add this line to run daily at 2 AM
0 2 * * * cd /path/to/placement-system/backend && /path/to/.venv/bin/python cleanup_expired_drives.py >> /var/log/placement_cleanup.log 2>&1
```

**Explanation**:
- `0 2 * * *` - Run at 2:00 AM every day
- Logs output to `/var/log/placement_cleanup.log`
- Uses virtual environment Python

### Option 2: Windows Task Scheduler
**Setup**:
1. Open Task Scheduler
2. Create Basic Task
3. Name: "Cleanup Expired Drives"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `C:\path\to\.venv\Scripts\python.exe`
   - Arguments: `cleanup_expired_drives.py`
   - Start in: `C:\path\to\placement-system\backend`

### Option 3: Django-Cron (Recommended for Production)
**Installation**:
```bash
pip install django-cron
```

**Configuration** (`settings.py`):
```python
INSTALLED_APPS = [
    ...
    'django_cron',
]

CRON_CLASSES = [
    'api.cron.CleanupExpiredDrivesCronJob',
]
```

**Create Cron Job** (`api/cron.py`):
```python
from django_cron import CronJobBase, Schedule
from django.utils import timezone
from .models import CompanyDrive

class CleanupExpiredDrivesCronJob(CronJobBase):
    RUN_EVERY_MINS = 1440  # Run once per day (24 hours)
    
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'api.cleanup_expired_drives'
    
    def do(self):
        today = timezone.now().date()
        expired_drives = CompanyDrive.objects.filter(drive_date__lt=today)
        count = expired_drives.count()
        
        if count > 0:
            expired_drives.delete()
            print(f"Deleted {count} expired drives")
```

**Run**:
```bash
python manage.py runcrons
```

### Option 4: Celery (For Large Scale)
**Installation**:
```bash
pip install celery redis
```

**Configuration** (`celery.py`):
```python
from celery import Celery
from celery.schedules import crontab

app = Celery('placement_system')

app.conf.beat_schedule = {
    'cleanup-expired-drives': {
        'task': 'api.tasks.cleanup_expired_drives',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },
}
```

**Task** (`api/tasks.py`):
```python
from celery import shared_task
from django.utils import timezone
from .models import CompanyDrive

@shared_task
def cleanup_expired_drives():
    today = timezone.now().date()
    expired_drives = CompanyDrive.objects.filter(drive_date__lt=today)
    count = expired_drives.delete()[0]
    return f"Deleted {count} expired drives"
```

## Testing

### Test Expired Drive Filtering
```python
# Create a drive with past date
from api.models import CompanyDrive
from datetime import date, timedelta

past_drive = CompanyDrive.objects.create(
    company_name="Test Company",
    job_role="Test Role",
    drive_date=date.today() - timedelta(days=1),  # Yesterday
    application_deadline=date.today() - timedelta(days=2),
    package=10.0,
    status='active'
)

# Try to fetch drives
from api.views import CompanyDriveViewSet
# This drive should NOT appear in queryset
```

### Test Manual Deletion
```bash
# Create test expired drive
python manage.py shell
>>> from api.models import CompanyDrive
>>> from datetime import date, timedelta
>>> CompanyDrive.objects.create(
...     company_name="Expired Test",
...     job_role="Test",
...     drive_date=date.today() - timedelta(days=5),
...     application_deadline=date.today() - timedelta(days=10),
...     package=5.0
... )

# Run cleanup
python manage.py delete_expired_drives

# Verify deletion
>>> CompanyDrive.objects.filter(company_name="Expired Test").exists()
False
```

## Impact Analysis

### What Happens When Drive is Deleted?

**1. Company Drive Record**:
- ✅ Deleted permanently

**2. Applications**:
- ✅ Deleted (CASCADE relationship)
- All student applications for that drive are removed

**3. Student Profiles**:
- ✅ Preserved (no impact)
- Students can still apply to other drives

**4. Statistics**:
- ⚠️ Historical data lost
- Consider archiving before deletion if statistics needed

## Best Practices

### 1. Archive Before Delete (Optional)
If you need historical data:
```python
# Create archive table
class ArchivedCompanyDrive(models.Model):
    # Same fields as CompanyDrive
    archived_at = models.DateTimeField(auto_now_add=True)
    
# Before deletion, archive
for drive in expired_drives:
    ArchivedCompanyDrive.objects.create(
        company_name=drive.company_name,
        # ... copy all fields
    )
```

### 2. Grace Period
Add a grace period before deletion:
```python
# Delete drives 30 days after expiry
grace_period = today - timedelta(days=30)
expired_drives = CompanyDrive.objects.filter(drive_date__lt=grace_period)
```

### 3. Notification Before Deletion
Send email to placement officers:
```python
from django.core.mail import send_mail

if expired_drives.exists():
    send_mail(
        'Expired Drives Cleanup',
        f'{expired_drives.count()} drives will be deleted',
        'system@placement.com',
        ['placement@college.edu'],
    )
```

### 4. Soft Delete Instead
Mark as deleted instead of removing:
```python
# Add field to model
is_deleted = models.BooleanField(default=False)

# Instead of delete()
expired_drives.update(is_deleted=True)

# Filter in queries
queryset = queryset.filter(is_deleted=False)
```

## Monitoring

### Log File Analysis
```bash
# View cleanup logs
tail -f /var/log/placement_cleanup.log

# Count deletions in last 30 days
grep "Successfully deleted" /var/log/placement_cleanup.log | wc -l
```

### Database Query
```sql
-- Check for drives expiring soon
SELECT company_name, job_role, drive_date 
FROM api_companydrive 
WHERE drive_date < CURDATE() + INTERVAL 7 DAY
ORDER BY drive_date;
```

### Django Admin
Add filter in admin panel:
```python
# admin.py
class CompanyDriveAdmin(admin.ModelAdmin):
    list_filter = ['drive_date', 'status']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Show all drives including expired in admin
        return qs
```

## Troubleshooting

### Issue: Drives Not Being Deleted
**Check**:
1. Cron job is running: `crontab -l`
2. Script has execute permissions: `chmod +x cleanup_expired_drives.py`
3. Python path is correct in cron
4. Check logs for errors

### Issue: Drives Still Visible
**Solution**:
- Clear browser cache
- Check API response directly
- Verify date comparison logic
- Check timezone settings

### Issue: Applications Lost
**Prevention**:
- Implement archiving before deletion
- Use soft delete approach
- Export data regularly

## Configuration

### Environment Variables
```env
# .env
CLEANUP_GRACE_PERIOD_DAYS=30
CLEANUP_ENABLED=True
CLEANUP_ARCHIVE_BEFORE_DELETE=True
```

### Settings
```python
# settings.py
DRIVE_CLEANUP_GRACE_PERIOD = int(os.getenv('CLEANUP_GRACE_PERIOD_DAYS', 0))
DRIVE_CLEANUP_ENABLED = os.getenv('CLEANUP_ENABLED', 'True') == 'True'
```

## Summary

✅ **Automatic Filtering**: Expired drives hidden from all views  
✅ **Manual Cleanup**: `python manage.py delete_expired_drives`  
✅ **Automated Cleanup**: Cron job or task scheduler  
✅ **Safe Deletion**: Cascade deletes applications  
✅ **Logging**: All deletions logged with timestamps  
✅ **Flexible**: Multiple scheduling options available  

---

**Last Updated**: March 9, 2026  
**Status**: Production Ready
