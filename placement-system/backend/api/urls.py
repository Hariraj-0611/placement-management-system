from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router for ViewSets
router = DefaultRouter()
router.register(r'students', views.StudentProfileViewSet, basename='student')
router.register(r'drives', views.CompanyDriveViewSet, basename='drive')
router.register(r'applications', views.ApplicationViewSet, basename='application')

urlpatterns = [
    # ============================================
    # AUTHENTICATION ENDPOINTS
    # ============================================
    path('register/', views.register_student, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('me/', views.get_current_user, name='current-user'),
    
    # Password Reset
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('reset-password/', views.reset_password, name='reset-password'),
    
    # Password Change (All Users)
    path('change-password/', views.change_password, name='change-password'),
    path('change-first-login-password/', views.change_first_login_password, name='change-first-login-password'),
    
    # Profile Management (All Users)
    path('upload-profile-photo/', views.upload_user_profile_photo, name='upload-profile-photo'),
    path('update-profile/', views.update_user_profile, name='update-profile'),
    
    # ============================================
    # DASHBOARD ENDPOINTS (Role-Based)
    # ============================================
    path('dashboard/student/', views.student_dashboard, name='student-dashboard'),
    path('dashboard/staff/', views.staff_dashboard, name='staff-dashboard'),
    path('dashboard/placement/', views.placement_dashboard, name='placement-dashboard'),
    
    # ============================================
    # STAFF-SPECIFIC ENDPOINTS (Read + Limited Write)
    # ============================================
    path('staff/students/', views.staff_list_students, name='staff-list-students'),
    path('staff/students/<int:student_id>/', views.staff_get_student_detail, name='staff-student-detail'),
    path('staff/students/<int:student_id>/update-academics/', views.staff_update_student_academics, name='staff-update-academics'),
    path('staff/students/<int:student_id>/verify-eligibility/', views.staff_verify_eligibility, name='staff-verify-eligibility'),
    path('staff/drives/', views.staff_list_drives, name='staff-list-drives'),
    path('staff/applications/', views.staff_list_applications, name='staff-list-applications'),
    
    # ============================================
    # USER MANAGEMENT (Placement Officer Only)
    # ============================================
    path('users/', views.list_users, name='list-users'),
    path('users/create/', views.create_user, name='create-user'),
    path('users/<int:user_id>/update/', views.update_user, name='update-user'),
    path('users/<int:user_id>/reset-password/', views.reset_user_password, name='reset-user-password'),
    path('users/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle-user-status'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete-user'),
    
    # Bulk Upload
    path('placement/bulk-upload-students/', views.bulk_upload_students, name='bulk-upload-students'),
    path('placement/bulk-upload-staff/', views.bulk_upload_staff, name='bulk-upload-staff'),
    
    # CGPA Update (Placement Only)
    path('placement/students/<int:student_id>/update-cgpa/', views.placement_update_student_cgpa, name='placement-update-cgpa'),
    
    # ============================================
    # STUDENT VERIFICATION (Placement Officer Only)
    # ============================================
    path('students/<int:student_id>/verify-eligibility/', views.verify_student_eligibility, name='verify-eligibility'),
    path('students/<int:student_id>/approve-profile/', views.approve_student_profile, name='approve-profile'),
    
    # ============================================
    # VIEWSETS (CRUD Operations)
    # ============================================
    # Students: /api/students/
    # Drives: /api/drives/
    # Applications: /api/applications/
    path('', include(router.urls)),
]
