# Quick Start: Update User Departments

## The Fastest Way (1 Command)

If you want to set all users to "Computer Science" department:

```bash
cd placement-system/backend
python quick_setup_departments.py
```

This will:
- Show you how many users will be updated
- Ask for confirmation
- Update all users to "Computer Science" department

## Alternative: Interactive Setup

For more control:

```bash
python update_user_departments.py
```

This gives you options to:
1. Update all users without department
2. Update all students
3. Update all staff
4. Update specific user by email

## Verify It Worked

Check all users and their departments:

```bash
python manage.py list_users
```

## What This Fixes

After running these commands:
- ✓ Staff can see students from their department
- ✓ Staff can view applications from their department
- ✓ Staff can update student information from their department
- ✓ No more empty lists in staff dashboard

## Need Different Departments?

Use the management commands:

```bash
# Set Computer Science students
python manage.py set_department --all-students --department "Computer Science"

# Set Mechanical Engineering staff
python manage.py set_department --email staff@example.com --department "Mechanical Engineering"
```

See `UPDATE_DEPARTMENTS_README.md` for more details.
