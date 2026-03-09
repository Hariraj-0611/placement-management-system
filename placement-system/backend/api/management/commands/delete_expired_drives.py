from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import CompanyDrive
from datetime import datetime

class Command(BaseCommand):
    help = 'Delete expired company drives based on drive date'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        
        # Find all expired drives (drive_date < today)
        expired_drives = CompanyDrive.objects.filter(drive_date__lt=today)
        
        count = expired_drives.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No expired drives found.'))
            return
        
        # Display expired drives before deletion
        self.stdout.write(self.style.WARNING(f'\nFound {count} expired drive(s):'))
        for drive in expired_drives:
            self.stdout.write(f'  - {drive.company_name} ({drive.job_role}) - Drive Date: {drive.drive_date}')
        
        # Delete expired drives
        deleted_count, _ = expired_drives.delete()
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully deleted {deleted_count} expired drive(s)'))
