from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
import os
import json
import secrets
from datetime import timedelta
from django.utils import timezone

def profile_photo_path(instance, filename):
    return f'profile_photos/user_{instance.id}/{filename}'

def resume_path(instance, filename):
    return f'resumes/user_{instance.user.id}/{filename}'

class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('STAFF', 'Staff'),
        ('PLACEMENT', 'Placement Officer'),
    )
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )
    
    # Basic Info
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    email = models.EmailField(unique=True)  # Make email unique and required
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Department (common for all roles)
    department = models.CharField(max_length=100, blank=True, null=True)
    
    # Profile
    profile_photo = models.ImageField(
        upload_to=profile_photo_path,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
        blank=True, null=True
    )
    
    # Status
    is_deleted = models.BooleanField(default=False, help_text="Soft delete flag")
    is_first_login = models.BooleanField(default=True, help_text="True if user needs to change password on first login")
    
    # Override username to make it optional (we'll use email)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)  # Make email unique and required
    
    USERNAME_FIELD = 'username'  # Keep username as primary (for Django compatibility)
    REQUIRED_FIELDS = ['email']  # Email required for createsuperuser
    
    def save(self, *args, **kwargs):
        # Auto-generate username from email if not provided
        if not self.username and self.email:
            base_username = self.email.split('@')[0]
            self.username = base_username
            
            # Ensure uniqueness
            counter = 1
            while User.objects.filter(username=self.username).exclude(pk=self.pk).exists():
                self.username = f"{base_username}{counter}"
                counter += 1
        
        # Automatically assign PLACEMENT role to superusers
        if self.is_superuser and not self.role:
            self.role = 'PLACEMENT'
        elif self.is_superuser and self.role != 'PLACEMENT':
            self.role = 'PLACEMENT'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.email} - {self.role}"
    
    @property
    def is_student(self):
        return self.role == 'STUDENT'
    
    @property
    def is_staff_member(self):
        return self.role == 'STAFF'
    
    @property
    def is_placement_officer(self):
        return self.role == 'PLACEMENT'

class StudentProfile(models.Model):
    YEAR_CHOICES = (
        (1, 'First Year'),
        (2, 'Second Year'),
        (3, 'Third Year'),
        (4, 'Fourth Year'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    
    # Academic Info
    register_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    year_of_study = models.IntegerField(choices=YEAR_CHOICES, blank=True, null=True)
    cgpa = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        null=True, blank=True
    )
    backlog_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    skills = models.JSONField(default=list)
    
    # Documents
    profile_photo = models.ImageField(
        upload_to=profile_photo_path,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
        blank=True, null=True
    )
    resume = models.FileField(
        upload_to=resume_path,
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx'])],
        blank=True, null=True
    )
    
    # Eligibility and Approval fields
    is_eligible = models.BooleanField(default=False, help_text="Marked as eligible by placement officer")
    profile_approved = models.BooleanField(default=False, help_text="Profile approved by placement officer")
    eligibility_remarks = models.TextField(blank=True, null=True, help_text="Remarks about eligibility")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_students')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Profile"

    @property
    def resume_filename(self):
        if self.resume:
            return os.path.basename(self.resume.name)
        return None


class StaffProfile(models.Model):
    """Profile for Staff members"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    
    # Professional Info
    staff_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    experience_years = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - Staff Profile"


class PlacementProfile(models.Model):
    """Profile for Placement Officers"""
    ACCESS_LEVEL_CHOICES = (
        ('FULL', 'Full Access'),
        ('LIMITED', 'Limited Access'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='placement_profile')
    
    # Professional Info
    employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    office_contact = models.CharField(max_length=15, blank=True, null=True)
    access_level = models.CharField(max_length=20, choices=ACCESS_LEVEL_CHOICES, default='FULL')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - Placement Profile"


class CompanyDrive(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('completed', 'Completed'),
    )
    
    company_name = models.CharField(max_length=200)
    job_role = models.CharField(max_length=200)
    package = models.DecimalField(max_digits=10, decimal_places=2, help_text="Package in LPA", default=0.0)
    description = models.TextField()
    eligibility_criteria = models.TextField()
    minimum_cgpa = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
    required_skills = models.JSONField(default=list)
    drive_date = models.DateTimeField(null=True, blank=True)
    deadline = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'PLACEMENT'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.company_name} - {self.job_role}"

class Application(models.Model):
    STATUS_CHOICES = (
        ('Applied', 'Applied'),
        ('Shortlisted', 'Shortlisted'),
        ('Rejected', 'Rejected'),
        ('Selected', 'Selected'),
    )
    
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='applications')
    drive = models.ForeignKey(CompanyDrive, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    remarks = models.TextField(blank=True, null=True, default='')
    
    class Meta:
        unique_together = ('student', 'drive')
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"{self.student.user.username} - {self.drive.company_name}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Reset token for {self.user.username}"
    
    @staticmethod
    def create_token(user):
        # Generate a secure random token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)
        
        reset_token = PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        return reset_token
    
    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at