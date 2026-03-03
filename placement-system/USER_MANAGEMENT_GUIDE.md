# User Management Guide - Placement Officer

## Overview
The Manage Users page provides full user management capabilities for Placement Officers. All actions are fully implemented and working.

---

## Available Actions

### 1. ✅ Edit User
**What it does**: Update user's personal information

**Fields you can edit**:
- First Name
- Last Name
- Email
- Department

**How to use**:
1. Click "Edit" button next to any user
2. Modal opens with current user information
3. Modify the fields you want to change
4. Click "Update User"
5. ✅ User information updates immediately

**Backend**: `PUT /api/users/{user_id}/update/`

---

### 2. ✅ Reset Password
**What it does**: Change a user's password

**How to use**:
1. Click "Reset Password" button next to any user
2. Modal opens showing username
3. Enter new password
4. Click "Reset Password"
5. ✅ User can now login with new password

**Backend**: `POST /api/users/{user_id}/reset-password/`

**Note**: User will need to use the new password on next login

---

### 3. ✅ Activate/Deactivate
**What it does**: Enable or disable user account

**Status indicators**:
- 🟢 **Active** (green badge) - User can login
- 🔴 **Inactive** (red badge) - User cannot login

**How to use**:
1. Click "Activate" or "Deactivate" button
2. Status toggles immediately
3. ✅ Active users can login
4. ✅ Inactive users are blocked from login

**Backend**: `POST /api/users/{user_id}/toggle-status/`

**Use cases**:
- Temporarily suspend a user
- Reactivate a suspended user
- Disable graduated students
- Block problematic accounts

---

### 4. ✅ Delete User
**What it does**: Remove user from system (soft delete - deactivates account)

**How to use**:
1. Click "Delete" button next to any user
2. Confirmation dialog appears
3. Click "OK" to confirm
4. ✅ User is deactivated (not permanently deleted)

**Backend**: `DELETE /api/users/{user_id}/delete/`

**Safety features**:
- Confirmation required before deletion
- Cannot delete your own account
- Soft delete (deactivates instead of removing)

---

## Create New User

**What it does**: Add new STAFF or PLACEMENT users

**Required fields**:
- Username (unique)
- Email (unique)
- Password
- Role (STAFF or PLACEMENT)

**Optional fields**:
- First Name
- Last Name
- Department

**How to use**:
1. Click "Create New User" button (top right)
2. Fill in the form
3. Select role (STAFF or PLACEMENT)
4. Click "Create User"
5. ✅ New user can login immediately

**Backend**: `POST /api/users/create/`

**Note**: Cannot create STUDENT users from this page (students register themselves)

---

## Filters

### Search
- Search by username, email, first name, or last name
- Real-time filtering as you type

### Role Filter
- All Roles
- STUDENT
- STAFF
- PLACEMENT

### Department Filter
- Filter by department name
- Useful for large organizations

---

## User Table Columns

| Column | Description |
|--------|-------------|
| **User** | Username and full name |
| **Email** | User's email address |
| **Role** | STUDENT (blue), STAFF (green), PLACEMENT (purple) |
| **Department** | User's department |
| **Status** | Active (green) or Inactive (red) |
| **Actions** | Edit, Reset Password, Activate/Deactivate, Delete |

---

## Permissions

### Who can access?
- ✅ PLACEMENT role only
- ❌ STAFF cannot access
- ❌ STUDENT cannot access

### What can be managed?
- ✅ Create STAFF users
- ✅ Create PLACEMENT users
- ✅ Edit any user
- ✅ Reset any user's password
- ✅ Activate/Deactivate any user
- ✅ Delete any user (except yourself)
- ❌ Cannot create STUDENT users (they self-register)

---

## API Endpoints

All endpoints require PLACEMENT role:

```
GET    /api/users/                        # List all users
POST   /api/users/create/                 # Create new user
PUT    /api/users/{id}/update/            # Update user info
POST   /api/users/{id}/reset-password/    # Reset password
POST   /api/users/{id}/toggle-status/     # Activate/Deactivate
DELETE /api/users/{id}/delete/            # Delete user
```

---

## Testing

### Test Edit
```
1. Login as placement1/placement123
2. Go to "Manage Users"
3. Find staff1 in the list
4. Click "Edit"
5. Change first name to "John"
6. Click "Update User"
7. ✅ Name updates in table
```

### Test Reset Password
```
1. Find staff1 in the list
2. Click "Reset Password"
3. Enter new password: "newpass123"
4. Click "Reset Password"
5. ✅ Success message appears
6. Logout and login as staff1/newpass123
7. ✅ Login works with new password
```

### Test Activate/Deactivate
```
1. Find staff1 in the list
2. Note current status (Active)
3. Click "Deactivate"
4. ✅ Status changes to Inactive (red)
5. Try to login as staff1
6. ✅ Login fails (account disabled)
7. Click "Activate"
8. ✅ Status changes to Active (green)
9. Try to login as staff1
10. ✅ Login works
```

### Test Delete
```
1. Create a test user
2. Click "Delete" next to test user
3. Confirm deletion
4. ✅ User disappears from list
5. Try to login as deleted user
6. ✅ Login fails
```

---

## Error Handling

### Common Errors

**"Email already exists"**
- Solution: Use a different email address

**"Username already exists"**
- Solution: Use a different username

**"Cannot delete your own account"**
- Solution: Ask another placement officer to delete your account

**"Failed to update user"**
- Check: Email might be taken by another user
- Check: Network connection

**"Access denied"**
- Check: You must be logged in as PLACEMENT role

---

## Best Practices

### Creating Users
1. Use meaningful usernames (e.g., firstname.lastname)
2. Use official email addresses
3. Set strong initial passwords
4. Inform users of their credentials securely

### Editing Users
1. Verify information before updating
2. Keep email addresses up to date
3. Update department when users transfer

### Resetting Passwords
1. Verify user identity before resetting
2. Use strong passwords
3. Inform user of password change
4. Consider requiring password change on next login

### Deactivating Users
1. Deactivate instead of deleting when possible
2. Document reason for deactivation
3. Can reactivate later if needed

### Deleting Users
1. Use sparingly (deactivate is usually better)
2. Confirm with user before deletion
3. Cannot be undone (soft delete only deactivates)

---

## Security Features

### Password Security
- Passwords are hashed (never stored in plain text)
- Strong password requirements recommended
- Password reset requires PLACEMENT role

### Access Control
- Only PLACEMENT officers can manage users
- Cannot delete your own account
- All actions are logged

### Data Protection
- Email uniqueness enforced
- Username uniqueness enforced
- Soft delete preserves data

---

## Troubleshooting

### Actions not working?

**Check 1: Are you logged in as PLACEMENT?**
```
- Look at navbar
- Should show purple "PLACEMENT" badge
- If not, logout and login as placement1
```

**Check 2: Is backend running?**
```
- Backend should be on http://localhost:8000
- Check terminal for errors
- Restart if needed: python manage.py runserver
```

**Check 3: Check browser console**
```
- Press F12
- Look for error messages
- Check Network tab for failed requests
```

**Check 4: Check backend logs**
```
- Look at Django terminal
- Check for 403 Forbidden errors
- Check for 500 Internal Server errors
```

---

## Summary

✅ **All 4 actions are fully implemented and working**:
1. Edit - Update user information
2. Reset Password - Change user password
3. Activate/Deactivate - Enable/disable accounts
4. Delete - Remove users (soft delete)

✅ **Additional features**:
- Create new users
- Search and filter
- Role-based access control
- Real-time updates

✅ **Security**:
- PLACEMENT role required
- Password hashing
- Soft delete
- Cannot delete own account

The user management system is production-ready and fully functional!
