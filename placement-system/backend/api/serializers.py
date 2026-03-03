from rest_framework import serializers
from .models import User, StudentProfile, CompanyDrive, Application

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'department', 'profile_photo', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for Student Profile
    """
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'username', 'email', 'profile_photo', 
            'resume', 'resume_filename', 'cgpa', 'skills',
            'is_eligible', 'profile_approved', 'eligibility_remarks',
            'approved_by', 'approved_by_name', 'approved_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'resume_filename', 'approved_by', 'approved_at']


class CompanyDriveSerializer(serializers.ModelSerializer):
    """
    Serializer for Company Drive
    """
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyDrive
        fields = [
            'id', 'company_name', 'job_role', 'package', 'description',
            'eligibility_criteria', 'minimum_cgpa', 'required_skills',
            'drive_date', 'deadline', 'status', 'created_by', 
            'created_by_name', 'created_by_email', 'applications_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_applications_count(self, obj):
        return obj.applications.count()


class ApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for Application
    """
    student_name = serializers.CharField(source='student.user.username', read_only=True)
    student_email = serializers.CharField(source='student.user.email', read_only=True)
    student_cgpa = serializers.FloatField(source='student.cgpa', read_only=True)
    student_department = serializers.CharField(source='student.user.department', read_only=True)
    
    drive_company = serializers.CharField(source='drive.company_name', read_only=True)
    drive_role = serializers.CharField(source='drive.job_role', read_only=True)
    drive_package = serializers.DecimalField(source='drive.package', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'student', 'student_name', 'student_email', 
            'student_cgpa', 'student_department', 'drive', 
            'drive_company', 'drive_role', 'drive_package',
            'status', 'remarks', 'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'applied_at', 'updated_at']


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Application with full nested data
    """
    student = StudentProfileSerializer(read_only=True)
    drive = CompanyDriveSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['id', 'applied_at', 'updated_at']
