# Update User Departments

Since the department-based access control has been implemented, all users need to have a department assigned. This guide shows you how to update existing users.

## Quick Method (Recommended)

Run the interactive Python script:

```bash
cd placement-system/backend
python update_user_departments.py
```

This will:
1. Show all current users and their departments
2. Let you choose how to update departments
3. Update the users automatically

## Using Django Management Commands

### 1. List All Users

See all users and their current departments:

```bash
python manage.py list_users
```

Filter by role:
```bash
python manage.py list_users --role STUDENT
python manage.py list_users --role STAFF
python manage.py list_users --role PLACEMENT
```

### 2. Update All Users Without Department

Set a default department for all users that don't have one:

```bash
python manage.py update_departments --department "Computer Science"
```

Update only students without department:
```bash
python manage.py update_departments --department "Computer Science" --role STUDENT
```

Update only staff without department:
```bash
python manage.py update_departments --department "Computer Science" --role STAFF
```

### 3. Set Department for Specific Users

Update a specific user by email:
```bash
python manage.py set_department --email student@example.com --department "Computer Science"
```

Update a specific user by ID:
```bash
python manage.py set_department --user-id 5 --department "Mechanical Engineering"
```

Update all students:
```bash
python manage.py set_department --all-students --department "Computer Science"
```

Update all staff:
```bash
python manage.py set_department --all-staff --department "Computer Science"
```

## Common Department Names

Here are some common department names you might use:

- Computer Science
- Information Technology
- Mechanical Engineering
- Electrical Engineering
- Civil Engineering
- Electronics and Communication
- Chemical Engineering
- Biotechnology
- Business Administration
- Management Studies

## Example Workflow

1. **Check current state:**
   ```bash
   python manage.py list_users
   ```

2. **Update all students to Computer Science:**
   ```bash
   python manage.py set_department --all-students --department "Computer Science"
   ```

3. **Update all staff to Computer Science:**
   ```bash
   python manage.py set_department --all-staff --department "Computer Science"
   ```

4. **Verify the changes:**
   ```bash
   python manage.py list_users
   ```

## Important Notes

- **Staff can only see students from their own department**
- **Make sure staff and their students have the same department name**
- **Department names are case-sensitive** (use consistent naming)
- **Placement Officers can see all users regardless of department**

## After Updating

Once you've updated the departments:

1. Staff members will only see students from their department
2. Staff can only modify students from their department
3. The frontend will show "View student applications from your department"

## Troubleshooting

**Problem:** Staff can't see any students

**Solution:** Make sure the staff member and students have the same department value:
```bash
# Check staff department
python manage.py list_users --role STAFF

# Check student departments
python manage.py list_users --role STUDENT

# Update if needed
python manage.py set_department --email staff@example.com --department "Computer Science"
```
