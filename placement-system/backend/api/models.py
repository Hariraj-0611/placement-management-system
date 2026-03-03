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
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    department = models.CharField(max_length=100, blank=True, null=True)
    profile_photo = models.ImageField(
        upload_to=profile_photo_path,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
        blank=True, null=True
    )
    is_deleted = models.BooleanField(default=False, help_text="Soft delete flag")
    
    def save(self, *args, **kwargs):
        # Automatically assign PLACEMENT role to superusers
        if self.is_superuser and not self.role:
            self.role = 'PLACEMENT'
        elif self.is_superuser and self.role != 'PLACEMENT':
            self.role = 'PLACEMENT'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.username} - {self.role}"
    
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
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
    cgpa = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        null=True, blank=True
    )
    skills = models.JSONField(default=list)
    
    # Eligibility and Approval fields
    is_eligible = models.BooleanField(default=False, help_text="Marked as eligible by placement officer")
    profile_approved = models.BooleanField(default=False, help_text="Profile approved by placement officer")
    eligibility_remarks = models.TextField(blank=True, null=True, help_text="Remarks about eligibility")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_students')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def resume_filename(self):
        if self.resume:
            return os.path.basename(self.resume.name)
        return None

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