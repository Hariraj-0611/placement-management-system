from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    """
    Permission class to check if user is a STUDENT
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'STUDENT'


class IsStaff(permissions.BasePermission):
    """
    Permission class to check if user is a STAFF member
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'STAFF'


class IsPlacementOfficer(permissions.BasePermission):
    """
    Permission class to check if user is a PLACEMENT officer
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'PLACEMENT'


class IsStudentOrReadOnly(permissions.BasePermission):
    """
    Allow students to read, placement officers to write
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated and request.user.role == 'STUDENT'
        return request.user.is_authenticated and request.user.role == 'PLACEMENT'


class IsOwnerOrPlacementOfficer(permissions.BasePermission):
    """
    Object-level permission to only allow owners or placement officers
    """
    def has_object_permission(self, request, view, obj):
        # Placement officers can access everything
        if request.user.role == 'PLACEMENT':
            return True
        
        # Students can only access their own profile
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class CanManageApplications(permissions.BasePermission):
    """
    Only PLACEMENT officers can update application status
    """
    def has_permission(self, request, view):
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return request.user.is_authenticated and request.user.role == 'PLACEMENT'
        return request.user.is_authenticated


class CanViewStudents(permissions.BasePermission):
    """
    STAFF and PLACEMENT can view students, STUDENT can view only themselves
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['STAFF', 'PLACEMENT', 'STUDENT']


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow staff or superuser access
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)
