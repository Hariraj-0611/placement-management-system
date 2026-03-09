"""
Test script for automated eligibility checking feature
Run this after creating test data to verify the feature works correctly
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, StudentProfile, CompanyDrive

def test_eligibility_checking():
    """Test the eligibility checking logic"""
    
    print("\n" + "="*60)
    print("TESTING AUTOMATED ELIGIBILITY CHECKING")
    print("="*60)
    
    # Get a test student
    try:
        student_user = User.objects.filter(role='STUDENT', is_deleted=False).first()
        if not student_user:
            print("\n❌ No student users found. Please create a student first.")
            return
        
        profile = StudentProfile.objects.get(user=student_user)
        print(f"\n✅ Testing with student: {student_user.email}")
        print(f"   CGPA: {profile.cgpa}")
        print(f"   Backlog Count: {profile.backlog_count}")
        print(f"   Skills: {profile.skills}")
        print(f"   Resume: {'✓ Uploaded' if profile.resume else '✗ Not uploaded'}")
        print(f"   Profile Approved: {'✓ Yes' if profile.profile_approved else '✗ No'}")
        
    except StudentProfile.DoesNotExist:
        print("\n❌ Student profile not found")
        return
    
    # Get a test drive
    drive = CompanyDrive.objects.filter(status='active').first()
    if not drive:
        print("\n❌ No active drives found. Please create a drive first.")
        return
    
    print(f"\n✅ Testing with drive: {drive.company_name} - {drive.job_role}")
    print(f"   Minimum CGPA: {drive.minimum_cgpa}")
    print(f"   Required Skills: {drive.required_skills}")
    
    # Test eligibility
    print("\n" + "-"*60)
    print("ELIGIBILITY CHECK RESULT:")
    print("-"*60)
    
    is_eligible, reasons = profile.check_eligibility_for_drive(drive)
    
    if is_eligible:
        print("\n✅ ELIGIBLE")
    else:
        print("\n❌ NOT ELIGIBLE")
    
    print("\nReasons:")
    for i, reason in enumerate(reasons, 1):
        print(f"  {i}. {reason}")
    
    # Test with multiple drives
    print("\n" + "="*60)
    print("TESTING WITH ALL ACTIVE DRIVES")
    print("="*60)
    
    all_drives = CompanyDrive.objects.filter(status='active')
    eligible_count = 0
    not_eligible_count = 0
    
    for drive in all_drives:
        is_eligible, reasons = profile.check_eligibility_for_drive(drive)
        status = "✅ ELIGIBLE" if is_eligible else "❌ NOT ELIGIBLE"
        print(f"\n{drive.company_name} - {drive.job_role}: {status}")
        
        if is_eligible:
            eligible_count += 1
        else:
            not_eligible_count += 1
            print(f"   Reasons: {', '.join(reasons)}")
    
    print("\n" + "="*60)
    print(f"SUMMARY: {eligible_count} eligible, {not_eligible_count} not eligible out of {all_drives.count()} drives")
    print("="*60)
    
    # Recommendations
    print("\n" + "="*60)
    print("RECOMMENDATIONS FOR STUDENT")
    print("="*60)
    
    if not profile.resume:
        print("⚠️  Upload your resume")
    
    if not profile.profile_approved:
        print("⚠️  Get your profile approved by placement officer")
    
    if profile.cgpa is None:
        print("⚠️  Update your CGPA (contact placement officer)")
    
    if profile.backlog_count > 0:
        print(f"⚠️  Clear {profile.backlog_count} backlog(s)")
    
    if not profile.skills:
        print("⚠️  Add your skills to profile")
    
    print("\n✅ Testing completed!\n")


if __name__ == '__main__':
    test_eligibility_checking()
