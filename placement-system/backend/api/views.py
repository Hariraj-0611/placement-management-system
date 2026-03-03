from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q, Count
from .models import User, StudentProfile, CompanyDrive, Application, PasswordResetToken
from .serializers import *
from .permissions import (
    IsStudent, IsStaff, IsPlacementOfficer,
    IsOwnerOrPlacementOfficer, CanManageApplications,
    CanViewStudents
)

# ============================================
# AUTHENTICATION VIEWS
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    """
    Register a new student
    """
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        department = request.data.get('department', '')
        cgpa = request.data.get('cgpa')
        skills = request.data.get('skills', [])
        
        # Validation
        if not username or not email or not password:
            return Response(
                {'error': 'Username, email, and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='STUDENT',
            department=department
        )
        
        # Create student profile
        StudentProfile.objects.create(
            user=user,
            cgpa=cgpa if cgpa else None,
            skills=skills if isinstance(skills, list) else []
        )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Registration successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'department': user.department
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login for all users (STUDENT, STAFF, PLACEMENT)
    """
    username_or_email = request.data.get('username')
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response(
            {'error': 'Username/Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Try to authenticate with username first
    user = authenticate(request, username=username_or_email, password=password)
    
    # If username authentication fails, try email
    if user is None:
        try:
            user_obj = User.objects.get(email=username_or_email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

    if user is not None:
        if not user.is_active:
            return Response(
                {'error': 'User account is disabled'},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'department': user.department
            }
        }, status=status.HTTP_200_OK)

    return Response(
        {'success': False, 'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Logout user by blacklisting refresh token
    """
    try:
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
    except TokenError:
        return Response(
            {'error': 'Invalid or expired token'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user details
    """
    user = request.user
    response_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'department': user.department,
        'profile_photo': user.profile_photo.url if user.profile_photo else None
    }
    
    # Add profile data for students
    if user.role == 'STUDENT':
        try:
            profile = StudentProfile.objects.get(user=user)
            response_data.update({
                'resume': profile.resume.url if profile.resume else None,
                'resume_filename': profile.resume_filename,
                'cgpa': profile.cgpa,
                'skills': profile.skills
            })
        except StudentProfile.DoesNotExist:
            pass
    
    return Response(response_data, status=status.HTTP_200_OK)


# ============================================
# PASSWORD RESET VIEWS
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Send password reset email
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        reset_token = PasswordResetToken.create_token(user)
        
        frontend_url = 'http://localhost:5173'
        reset_url = f"{frontend_url}/reset-password?token={reset_token.token}"
        
        subject = 'Password Reset Request'
        message = f"""
Hello {user.username},

You have requested to reset your password. Click the link below:

{reset_url}

This link will expire in 24 hours.

Best regards,
Placement Management System
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response(
            {'message': 'Password reset link has been sent to your email'},
            status=status.HTTP_200_OK
        )
    
    except User.DoesNotExist:
        return Response(
            {'message': 'If this email exists, you will receive a password reset link'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to send email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password using token
    """
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not token or not new_password:
        return Response(
            {'error': 'Token and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
        
        if not reset_token.is_valid():
            return Response(
                {'error': 'Token has expired or is invalid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        reset_token.is_used = True
        reset_token.save()
        
        return Response(
            {'message': 'Password reset successful'},
            status=status.HTTP_200_OK
        )
    
    except PasswordResetToken.DoesNotExist:
        return Response(
            {'error': 'Invalid reset token'},
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================
# DASHBOARD VIEWS
# ============================================

@api_view(['GET'])
@permission_classes([IsStudent])
def student_dashboard(request):
    """
    Student dashboard with statistics
    """
    try:
        profile = StudentProfile.objects.get(user=request.user)
        applications = Application.objects.filter(student=profile)
        
        return Response({
            'total_drives_available': CompanyDrive.objects.filter(status='active').count(),
            'applied_drives_count': applications.count(),
            'shortlisted_count': applications.filter(status='Shortlisted').count(),
            'selected_count': applications.filter(status='Selected').count(),
            'rejected_count': applications.filter(status='Rejected').count(),
            'recent_applications': ApplicationSerializer(
                applications.order_by('-applied_at')[:5], 
                many=True
            ).data,
            'upcoming_drives': CompanyDriveSerializer(
                CompanyDrive.objects.filter(status='active').order_by('drive_date')[:5], 
                many=True
            ).data
        }, status=status.HTTP_200_OK)
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsStaff])
def staff_dashboard(request):
    """
    Staff dashboard - read-only view
    """
    return Response({
        'total_students': StudentProfile.objects.count(),
        'total_drives': CompanyDrive.objects.count(),
        'active_drives': CompanyDrive.objects.filter(status='active').count(),
        'total_applications': Application.objects.count(),
        'pending_applications': Application.objects.filter(status='Applied').count(),
        'shortlisted_applications': Application.objects.filter(status='Shortlisted').count(),
        'selected_applications': Application.objects.filter(status='Selected').count(),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsPlacementOfficer])
def placement_dashboard(request):
    """
    Placement officer dashboard with full statistics
    """
    return Response({
        'total_students': StudentProfile.objects.count(),
        'total_drives': CompanyDrive.objects.count(),
        'active_drives': CompanyDrive.objects.filter(status='active').count(),
        'closed_drives': CompanyDrive.objects.filter(status='closed').count(),
        'completed_drives': CompanyDrive.objects.filter(status='completed').count(),
        'total_applications': Application.objects.count(),
        'pending_applications': Application.objects.filter(status='Applied').count(),
        'shortlisted_applications': Application.objects.filter(status='Shortlisted').count(),
        'selected_applications': Application.objects.filter(status='Selected').count(),
        'rejected_applications': Application.objects.filter(status='Rejected').count(),
        'my_drives': CompanyDrive.objects.filter(created_by=request.user).count(),
    }, status=status.HTTP_200_OK)


# ============================================
# VIEWSETS WITH RBAC
# ============================================

class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Student Profiles
    - STUDENT: Can view and update own profile
    - STAFF: Can view all profiles (read-only)
    - PLACEMENT: Can view all profiles and manage them
    """
    queryset = StudentProfile.objects.all().select_related('user')
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, CanViewStudents]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'STUDENT':
            # Students can only see their own profile
            return StudentProfile.objects.filter(user=user)
        elif user.role in ['STAFF', 'PLACEMENT']:
            # Staff and Placement can see all profiles
            return StudentProfile.objects.all().select_related('user')
        
        return StudentProfile.objects.none()
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            # Only students can update their own profile, or placement officers
            return [IsAuthenticated(), IsOwnerOrPlacementOfficer()]
        return super().get_permissions()
    
    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsStudent])
    def update_profile(self, request):
        """
        Update current student's profile
        """
        try:
            profile = StudentProfile.objects.get(user=request.user)
            serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsStudent])
    def upload_photo(self, request):
        """
        Upload profile photo
        """
        try:
            profile = StudentProfile.objects.get(user=request.user)
            
            if 'profile_photo' not in request.FILES:
                return Response(
                    {'error': 'No photo file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            photo = request.FILES['profile_photo']
            
            # Save to both StudentProfile and User model
            profile.profile_photo = photo
            profile.save()
            
            # Also save to User model for navbar display
            request.user.profile_photo = photo
            request.user.save()
            
            serializer = StudentProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsStudent])
    def upload_resume(self, request):
        """
        Upload resume
        """
        try:
            profile = StudentProfile.objects.get(user=request.user)
            
            if 'resume' not in request.FILES:
                return Response(
                    {'error': 'No resume file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            profile.resume = request.FILES['resume']
            profile.save()
            
            serializer = StudentProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class CompanyDriveViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Company Drives
    - STUDENT: Can view active drives (read-only)
    - STAFF: Can view all drives (read-only)
    - PLACEMENT: Full CRUD access
    """
    queryset = CompanyDrive.objects.all().select_related('created_by')
    serializer_class = CompanyDriveSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = CompanyDrive.objects.all().select_related('created_by')
        
        # Students can only see active drives
        if user.role == 'STUDENT':
            queryset = queryset.filter(status='active')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only placement officers can create/update/delete
            return [IsAuthenticated(), IsPlacementOfficer()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Applications
    - STUDENT: Can view own applications and apply
    - STAFF: Can view all applications (read-only)
    - PLACEMENT: Can view and update application status
    """
    queryset = Application.objects.all().select_related('student__user', 'drive')
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'STUDENT':
            # Students see only their applications
            try:
                profile = StudentProfile.objects.get(user=user)
                return Application.objects.filter(student=profile).select_related('drive', 'student__user')
            except StudentProfile.DoesNotExist:
                return Application.objects.none()
        
        elif user.role in ['STAFF', 'PLACEMENT']:
            # Staff and Placement see all applications
            queryset = Application.objects.all().select_related('student__user', 'drive')
            
            # Filter by drive if provided
            drive_id = self.request.query_params.get('drive')
            if drive_id:
                queryset = queryset.filter(drive_id=drive_id)
            
            # Filter by status if provided
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            return queryset.order_by('-applied_at')
        
        return Application.objects.none()
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            # Only placement officers can update status
            return [IsAuthenticated(), IsPlacementOfficer()]
        elif self.action == 'create':
            # Only students can apply
            return [IsAuthenticated(), IsStudent()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """
        Student applies for a drive
        """
        try:
            profile = StudentProfile.objects.get(user=request.user)
            drive_id = request.data.get('drive')
            
            if not drive_id:
                return Response(
                    {'error': 'Drive ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if drive exists and is active
            try:
                drive = CompanyDrive.objects.get(id=drive_id, status='active')
            except CompanyDrive.DoesNotExist:
                return Response(
                    {'error': 'Drive not found or not active'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if already applied
            if Application.objects.filter(student=profile, drive=drive).exists():
                return Response(
                    {'error': 'You have already applied for this drive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check eligibility (CGPA)
            if profile.cgpa and profile.cgpa < drive.minimum_cgpa:
                return Response(
                    {'error': f'Your CGPA ({profile.cgpa}) does not meet the minimum requirement ({drive.minimum_cgpa})'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create application
            application = Application.objects.create(
                student=profile,
                drive=drive,
                status='Applied'
            )
            
            serializer = ApplicationSerializer(application)
            return Response(
                {
                    'message': 'Application submitted successfully',
                    'application': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
            
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsPlacementOfficer])
    def update_status(self, request, pk=None):
        """
        Update application status (Placement Officer only)
        """
        try:
            application = self.get_object()
            new_status = request.data.get('status')
            remarks = request.data.get('remarks', '')
            
            if new_status not in dict(Application.STATUS_CHOICES):
                return Response(
                    {'error': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            application.status = new_status
            application.remarks = remarks
            application.save()
            
            serializer = ApplicationSerializer(application)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Application.DoesNotExist:
            return Response(
                {'error': 'Application not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# ============================================
# STAFF-SPECIFIC VIEWS
# ============================================

@api_view(['GET'])
@permission_classes([IsStaff])
def staff_list_students(request):
    """
    STAFF: List all students with search and filter
    """
    search = request.query_params.get('search', '')
    department = request.query_params.get('department', '')
    
    queryset = StudentProfile.objects.all().select_related('user')
    
    # Search by name or email
    if search:
        queryset = queryset.filter(
            Q(user__username__icontains=search) |
            Q(user__email__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search)
        )
    
    # Filter by department
    if department:
        queryset = queryset.filter(user__department=department)
    
    serializer = StudentProfileSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsStaff])
def staff_get_student_detail(request, student_id):
    """
    STAFF: Get individual student profile details
    """
    try:
        profile = StudentProfile.objects.select_related('user').get(id=student_id)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsStaff])
def staff_update_student_academics(request, student_id):
    """
    STAFF: Update student academic details (CGPA, Department, Skills)
    CANNOT: Delete students, reset passwords, change roles
    """
    try:
        profile = StudentProfile.objects.select_related('user').get(id=student_id)
        user = profile.user
        
        # Only allow updating specific fields
        allowed_fields = ['cgpa', 'skills', 'department']
        
        # Update CGPA
        if 'cgpa' in request.data:
            cgpa = request.data['cgpa']
            if cgpa is not None:
                try:
                    cgpa_float = float(cgpa)
                    if 0.0 <= cgpa_float <= 10.0:
                        profile.cgpa = cgpa_float
                    else:
                        return Response(
                            {'error': 'CGPA must be between 0.0 and 10.0'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except (ValueError, TypeError):
                    return Response(
                        {'error': 'Invalid CGPA value'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        # Update Skills
        if 'skills' in request.data:
            skills = request.data['skills']
            if isinstance(skills, list):
                profile.skills = skills
            else:
                return Response(
                    {'error': 'Skills must be a list'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update Department
        if 'department' in request.data:
            user.department = request.data['department']
            user.save()
        
        profile.save()
        
        serializer = StudentProfileSerializer(profile)
        return Response({
            'success': True,
            'message': 'Student academic details updated successfully',
            'student': serializer.data
        }, status=status.HTTP_200_OK)
        
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsStaff])
def staff_verify_eligibility(request, student_id):
    """
    STAFF: Mark student as Eligible / Not Eligible
    """
    try:
        profile = StudentProfile.objects.get(id=student_id)
        is_eligible = request.data.get('is_eligible', False)
        remarks = request.data.get('remarks', '')
        
        profile.is_eligible = is_eligible
        profile.eligibility_remarks = remarks
        profile.save()
        
        return Response({
            'success': True,
            'message': f'Student marked as {"eligible" if is_eligible else "not eligible"}',
            'is_eligible': is_eligible,
            'remarks': remarks
        }, status=status.HTTP_200_OK)
        
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsStaff])
def staff_list_drives(request):
    """
    STAFF: View all company drives (read-only)
    """
    status_filter = request.query_params.get('status')
    
    queryset = CompanyDrive.objects.all().select_related('created_by')
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    queryset = queryset.order_by('-created_at')
    
    serializer = CompanyDriveSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsStaff])
def staff_list_applications(request):
    """
    STAFF: View all applications (read-only)
    """
    drive_id = request.query_params.get('drive')
    status_filter = request.query_params.get('status')
    
    queryset = Application.objects.all().select_related('student__user', 'drive')
    
    if drive_id:
        queryset = queryset.filter(drive_id=drive_id)
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    queryset = queryset.order_by('-applied_at')
    
    serializer = ApplicationSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================
# USER MANAGEMENT (PLACEMENT ONLY)
# ============================================

@api_view(['GET'])
@permission_classes([IsPlacementOfficer])
def list_users(request):
    """
    List all users (Placement Officer only)
    """
    role_filter = request.query_params.get('role')
    department_filter = request.query_params.get('department')
    search = request.query_params.get('search')
    
    # Show all users except those marked as deleted
    queryset = User.objects.filter(is_deleted=False)
    
    if role_filter:
        queryset = queryset.filter(role=role_filter)
    
    if department_filter:
        queryset = queryset.filter(department=department_filter)
    
    if search:
        queryset = queryset.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    users = queryset.values(
        'id', 'username', 'email', 'first_name', 'last_name', 
        'role', 'department', 'is_active', 'date_joined'
    )
    
    return Response(list(users), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsPlacementOfficer])
def create_user(request):
    """
    Create new user (STUDENT, STAFF, or PLACEMENT)
    """
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role')
        department = request.data.get('department', '')
        
        # Validation
        if not username or not email or not password or not role:
            return Response(
                {'error': 'Username, email, password, and role are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if role not in ['STUDENT', 'STAFF', 'PLACEMENT']:
            return Response(
                {'error': 'Invalid role. Must be STUDENT, STAFF, or PLACEMENT'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            department=department
        )
        
        # If creating a student, also create their StudentProfile
        if role == 'STUDENT':
            StudentProfile.objects.create(
                user=user,
                cgpa=None,
                skills=[]
            )
        
        return Response({
            'success': True,
            'message': f'{role} user created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'department': user.department
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to create user: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsPlacementOfficer])
def update_user(request, user_id):
    """
    Update user details
    """
    try:
        user = User.objects.get(id=user_id)
        
        # Update fields
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            # Check if email already exists for another user
            if User.objects.filter(email=request.data['email']).exclude(id=user_id).exists():
                return Response(
                    {'error': 'Email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = request.data['email']
        if 'department' in request.data:
            user.department = request.data['department']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        
        user.save()
        
        return Response({
            'success': True,
            'message': 'User updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'department': user.department,
                'is_active': user.is_active
            }
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsPlacementOfficer])
def reset_user_password(request, user_id):
    """
    Reset user password
    """
    try:
        user = User.objects.get(id=user_id)
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response(
                {'error': 'New password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password reset successfully'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsPlacementOfficer])
def toggle_user_status(request, user_id):
    """
    Activate/Deactivate user
    """
    try:
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        
        status_text = 'activated' if user.is_active else 'deactivated'
        
        return Response({
            'success': True,
            'message': f'User {status_text} successfully',
            'is_active': user.is_active
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_user_profile_photo(request):
    """
    Upload profile photo for any user (Staff/Placement)
    """
    try:
        if 'profile_photo' not in request.FILES:
            return Response(
                {'error': 'No photo file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        photo = request.FILES['profile_photo']
        request.user.profile_photo = photo
        request.user.save()
        
        return Response({
            'success': True,
            'message': 'Profile photo uploaded successfully',
            'profile_photo': request.user.profile_photo.url if request.user.profile_photo else None
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update user profile (first_name, last_name, email, department)
    Available for STAFF and PLACEMENT roles
    """
    try:
        user = request.user
        
        # Update allowed fields
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        
        if 'email' in request.data:
            email = request.data['email']
            # Check if email already exists for another user
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response(
                    {'error': 'Email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = email
        
        if 'department' in request.data:
            user.department = request.data['department']
        
        user.save()
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'department': user.department,
                'profile_photo': user.profile_photo.url if user.profile_photo else None
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsPlacementOfficer])
def verify_student_eligibility(request, student_id):
    """
    Mark student as eligible/not eligible
    """
    try:
        profile = StudentProfile.objects.get(id=student_id)
        is_eligible = request.data.get('is_eligible', False)
        remarks = request.data.get('remarks', '')
        
        profile.is_eligible = is_eligible
        profile.eligibility_remarks = remarks
        profile.save()
        
        return Response({
            'success': True,
            'message': f'Student marked as {"eligible" if is_eligible else "not eligible"}',
            'is_eligible': is_eligible
        }, status=status.HTTP_200_OK)
        
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsPlacementOfficer])
def approve_student_profile(request, student_id):
    """
    Approve student profile
    """
    try:
        profile = StudentProfile.objects.get(id=student_id)
        approved = request.data.get('approved', False)
        
        profile.profile_approved = approved
        if approved:
            profile.approved_by = request.user
            profile.approved_at = timezone.now()
        else:
            profile.approved_by = None
            profile.approved_at = None
        profile.save()
        
        return Response({
            'success': True,
            'message': f'Profile {"approved" if approved else "approval revoked"}',
            'profile_approved': approved
        }, status=status.HTTP_200_OK)
        
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsPlacementOfficer])
def delete_user(request, user_id):
    """
    Delete user (soft delete by marking as deleted)
    """
    print(f"=== DELETE USER CALLED ===")
    print(f"User ID: {user_id}")
    print(f"Request user: {request.user.username} (ID: {request.user.id})")
    
    try:
        user = User.objects.get(id=user_id)
        print(f"Found user: {user.username} (ID: {user.id})")
        
        # Prevent deleting yourself
        if user.id == request.user.id:
            print("ERROR: User trying to delete themselves")
            return Response(
                {'error': 'Cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Soft delete - mark as deleted (different from deactivate)
        print(f"Marking user as deleted: {user.username}")
        user.is_deleted = True
        user.save()
        print(f"User {user.username} marked as deleted successfully")
        
        return Response({
            'success': True,
            'message': 'User deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        print(f"ERROR: User with ID {user_id} not found")
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"ERROR: Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
