"""
Fix student department to match staff department
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

# Get the staff and student
staff = User.objects.get(username='Placement_Staff')
student = User.objects.get(email='placementstudent@gmail.com')

print(f"\nBEFORE:")
print(f"Staff: {staff.username} - Department: {staff.department}")
print(f"Student: {student.username} - Department: {student.department}")

# Update student department to match staff
student.department = staff.department
student.save()

print(f"\nAFTER:")
print(f"Staff: {staff.username} - Department: {staff.department}")
print(f"Student: {student.username} - Department: {student.department}")

print(f"\n✅ Student department updated to '{staff.department}'")
print(f"Now refresh the Staff Students page - the student should appear!")
