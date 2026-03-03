# Testing Delete User Functionality

## Quick Test Steps

### 1. Check Backend is Running
```bash
# In backend terminal, you should see:
python manage.py runserver
# Server should be running on http://localhost:8000
```

### 2. Test Delete via Browser Console

Open browser console (F12) and run:

```javascript
// Get your access token
const token = localStorage.getItem('access_token');
console.log('Token:', token);

// Test delete user (replace USER_ID with actual user ID)
fetch('http://localhost:8000/api/users/7/delete/', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### 3. Check What Error You Get

Look for these common issues:

**Error: "Cannot delete your own account"**
- Solution: Try deleting a different user (not yourself)

**Error: 403 Forbidden**
- Solution: Make sure you're logged in as PLACEMENT role
- Check: Look at navbar, should show purple "PLACEMENT" badge

**Error: 404 Not Found**
- Solution: User ID doesn't exist
- Check: Make sure the user ID is correct

**Error: 405 Method Not Allowed**
- Solution: Backend route might be wrong
- Check: URL should be `/api/users/{id}/delete/`

**Error: Network Error**
- Solution: Backend not running
- Check: Start backend with `python manage.py runserver`

### 4. Check Backend Logs

Look at your Django terminal for errors:

```
# You should see:
DELETE /api/users/7/delete/ HTTP/1.1" 200

# If you see 403:
DELETE /api/users/7/delete/ HTTP/1.1" 403
# This means permission denied

# If you see 404:
DELETE /api/users/7/delete/ HTTP/1.1" 404
# This means user not found

# If you see 500:
DELETE /api/users/7/delete/ HTTP/1.1" 500
# This means server error - check traceback
```

### 5. Manual Test via Manage Users Page

1. Login as `placement1` / `placement123`
2. Go to "Manage Users" tab
3. Find a user (NOT yourself)
4. Click "Delete" button
5. Confirm the dialog
6. Open browser console (F12)
7. Look for any error messages
8. Check Network tab for the DELETE request

### 6. Create a Test User First

If you don't have extra users to delete:

1. Click "Create New User"
2. Fill in:
   - Username: testuser
   - Email: test@example.com
   - Password: test123
   - Role: STAFF
3. Click "Create User"
4. Now try to delete "testuser"

## Common Issues and Solutions

### Issue 1: Button doesn't do anything

**Check:**
```javascript
// Open console and check for errors
// Look for: "Cannot read property..." or "undefined"
```

**Solution:**
- Make sure `deleteUser` function is imported in ManageUsers.jsx
- Check: `import { deleteUser } from '../../services/api';`

### Issue 2: "Failed to delete user" toast

**Check console for actual error:**
```javascript
// You should see:
// Delete user error: {...}
// Error response: {...}
```

**Common causes:**
- 403: Not logged in as PLACEMENT
- 404: User doesn't exist
- 400: Trying to delete yourself

### Issue 3: Confirmation dialog doesn't appear

**Check:**
```javascript
// Make sure window.confirm is not blocked
// Try in console:
window.confirm('Test');
// Should show a dialog
```

### Issue 4: User doesn't disappear from list

**Check:**
- Does toast show "User deleted successfully"?
- If yes, but user still visible, try refreshing page
- Check if `fetchUsers()` is being called after delete

## Debugging Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Logged in as PLACEMENT role (purple badge)
- [ ] Trying to delete a different user (not yourself)
- [ ] User ID exists in database
- [ ] Browser console shows no errors
- [ ] Network tab shows DELETE request
- [ ] Backend logs show request received

## Expected Behavior

### Success Flow:
1. Click "Delete" → Confirmation dialog appears
2. Click "OK" → Loading/processing
3. Toast shows "User deleted successfully"
4. User disappears from table
5. User status changes to "Inactive"

### What Actually Happens (Soft Delete):
- User is NOT permanently deleted
- User's `is_active` field is set to `False`
- User cannot login anymore
- User data is preserved
- Can be reactivated later

## Test with cURL

If browser test doesn't work, try with cURL:

```bash
# Get your token first (from browser localStorage)
TOKEN="your_access_token_here"

# Test delete
curl -X DELETE \
  http://localhost:8000/api/users/7/delete/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
# {"success": true, "message": "User deleted successfully"}
```

## Still Not Working?

### Check these files:

1. **Backend Route** (`placement-system/backend/api/urls.py`):
```python
path('users/<int:user_id>/delete/', views.delete_user, name='delete-user'),
```

2. **Backend View** (`placement-system/backend/api/views.py`):
```python
@api_view(['DELETE'])
@permission_classes([IsPlacementOfficer])
def delete_user(request, user_id):
    # ... implementation
```

3. **Frontend API** (`placement-system/frontend/src/services/api.js`):
```javascript
export const deleteUser = (userId) => api.delete(`/users/${userId}/delete/`);
```

4. **Frontend Component** (`placement-system/frontend/src/pages/placement/ManageUsers.jsx`):
```javascript
const handleDeleteUser = async (userId) => {
  // ... implementation
};
```

### Enable Debug Mode

Add this to your ManageUsers.jsx temporarily:

```javascript
const handleDeleteUser = async (userId) => {
  console.log('=== DELETE USER DEBUG ===');
  console.log('User ID:', userId);
  console.log('User ID type:', typeof userId);
  console.log('Token:', localStorage.getItem('access_token'));
  
  if (!window.confirm('Are you sure?')) {
    console.log('User cancelled');
    return;
  }
  
  console.log('Calling deleteUser API...');
  
  try {
    const response = await deleteUser(userId);
    console.log('Success! Response:', response);
    toast.success('User deleted');
    fetchUsers();
  } catch (error) {
    console.error('ERROR:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    toast.error(error.response?.data?.error || 'Failed');
  }
};
```

Then check console output when you click Delete.

## Contact for Help

If still not working, provide:
1. Browser console errors
2. Backend terminal logs
3. Network tab screenshot
4. Which user you're trying to delete
5. Your role (should be PLACEMENT)
