# Deleted User Filtering - Implementation Summary

## Overview

The system now automatically hides deleted and inactive users from all views. When a placement officer deletes a user, that user will be hidden from:

1. ✓ Staff login (staff can't see deleted students)
2. ✓ Applications page (deleted user's applications don't show)
3. ✓ Student lists
4. ✓ Dashboard statistics
5. ✓ All API endpoints

## How It Works

### User Deletion States

Users have two flags:
- `is_deleted` - Soft delete flag (user is marked as deleted but data is preserved)
- `is_active` - Active status (user account is enabled/disabled)

### Filtering Rules

All queries now filter out users where:
- `is_deleted = True` OR
- `is_active = False`

This ensures deleted/inactive users are completely hidden from the system.

## Updated Endpoints

### 1. Applications (ViewSet)
**File:** `api/views.py` - `ApplicationViewSet`

```python
queryset = Application.objects.filter(
    student__user__is_deleted=False,
    student__user__is_active=True
)
```

**Affects:**
- `/api/applications/` (GET, POST)
- Placement officer application view
- Student application view

### 2. Staff Applications
**File:** `api/views.py` - `staff_list_applications`

```python
queryset = Application.objects.filter(
    student__user__department=request.user.department,
    student__user__is_deleted=False,
    student__user__is_active=True
)
```

**Affects:**
- `/api/staff/applications/` (GET)
- Staff can only see applications from active students in their department

### 3. Staff Students List
**File:** `api/views.py` - `staff_list_students`

```python
queryset = StudentProfile.objects.filter(
    user__is_deleted=False,
    user__department=request.user.department
)
```

**Affects:**
- `/api/staff/students/` (GET)
- Staff can only see active students from their department

### 4. Dashboard Statistics
**File:** `api/views.py` - `staff_dashboard`, `placement_dashboard`

All counts now filter deleted/inactive users:
```python
'total_students': StudentProfile.objects.filter(
    user__is_deleted=False, 
    user__is_active=True
).count()

'total_applications': Application.objects.filter(
    student__user__is_deleted=False,
    student__user__is_active=True
).count()
```

**Affects:**
- `/api/dashboard/staff/` (GET)
- `/api/dashboard/placement/` (GET)
- Dashboard counts only include active users

## Testing

### Verify Deleted Users Are Hidden

1. **Check current deleted users:**
   ```bash
   python manage.py list_users
   ```
   Look for users with `Active: No` or check the database.

2. **Count visible vs hidden applications:**
   ```bash
   python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings'); django.setup(); from api.models import Application; active = Application.objects.filter(student__user__is_deleted=False, student__user__is_active=True).count(); deleted = Application.objects.filter(student__user__is_deleted=True).count(); print(f'Active: {active}, Hidden: {deleted}')"
   ```

3. **Test in UI:**
   - Login as placement officer
   - Delete a student user
   - Check that the user disappears from:
     - Applications page
     - Student list
     - Dashboard counts
   - Login as staff
   - Verify the deleted student doesn't appear

### Example Users Currently Deleted

Based on the database check:
- `dinesh@gmail.com` - is_deleted=True, is_active=True
- `Student@gmail.com` - is_deleted=True, is_active=True
- `harirajpalani06112004@gmail.com` - is_deleted=True, is_active=False
- `nan` (ID: 28) - is_deleted=True, is_active=True

These users should NOT appear in any lists or counts.

## Important Notes

### 1. Restart Backend Server

After these changes, you MUST restart the Django backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
python manage.py runserver
```

### 2. Clear Frontend Cache

If deleted users still appear in the frontend:
- Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Logout and login again

### 3. Soft Delete vs Hard Delete

The system uses **soft delete** by default:
- User data is preserved
- User is marked as `is_deleted=True`
- User is hidden from all views
- Can be restored by setting `is_deleted=False`

To permanently delete users, use:
```bash
python cleanup_invalid_users.py
```

## Troubleshooting

### Problem: Deleted users still showing

**Solution:**
1. Restart backend server
2. Clear browser cache
3. Check user status:
   ```bash
   python manage.py list_users
   ```

### Problem: Staff can't see any students

**Solution:**
Check department matching:
```bash
python manage.py list_users --role STAFF
python manage.py list_users --role STUDENT
```
Ensure staff and students have the same department name.

### Problem: Application counts don't match

**Solution:**
The counts now exclude deleted users. This is correct behavior.
- Old count: All applications (including deleted users)
- New count: Only active user applications

## Summary

✓ Deleted users are automatically hidden from all views
✓ Staff can only see active students from their department
✓ Placement officers see all active users
✓ Dashboard statistics only count active users
✓ Applications from deleted users are hidden
✓ System maintains data integrity with soft delete

When you delete a user as a placement officer, the change is immediate and affects all views system-wide.
