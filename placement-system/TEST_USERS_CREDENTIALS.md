# Test Users Credentials

## Quick Access Test Accounts

### 1. Placement Officer Account
**Email**: `placement1@example.com`  
**Password**: `placement123`  
**Role**: Placement Officer  
**Department**: Placement Cell  
**Access**: Full placement management capabilities

**Capabilities**:
- Create and manage company drives
- Manage all students (all departments)
- Update application status
- Export data from all departments
- Create Staff and Student accounts

---

### 2. Staff Account
**Email**: `staff1@example.com`  
**Password**: `staff123`  
**Role**: Staff  
**Department**: Administration  
**Access**: Department-specific management

**Capabilities**:
- View students in Administration department only
- Update student skills
- Verify student eligibility
- View applications from Administration department
- Export department-specific data

**Alternative Staff Account**:
- **Email**: `placementstaff@gmail.com`
- **Department**: Computer Science
- **Password**: Check with admin

---

### 3. Student Account
**Email**: `student1@example.com`  
**Password**: `student123`  
**Role**: Student  
**Department**: Computer Science  
**Access**: Personal profile and applications

**Capabilities**:
- Complete profile
- Upload resume and photo
- View available drives
- Check eligibility
- Apply for drives
- Track application status

**Alternative Student Accounts**:
- **Email**: `placementstudent@gmail.com` (Computer Science)
- **Email**: `studentlogin@gmail.com` (Information Technology)
- **Email**: `dinesh@gmail.com` (Information Technology)

---

## Active Users Summary

### Placement Officers (9 total)
1. `placement1@example.com` - Placement Cell ✅
2. `placement@example.com` - Placement Cell ✅
3. `placement1@gmail.com` ✅
4. `placementteam@gmail.com` ✅
5. `sara@gmail.com` ✅
6. `saravanan@gmail.com` ✅

### Staff Members (4 total)
1. `staff1@example.com` - Administration ✅
2. `placementstaff@gmail.com` - Computer Science ✅
3. `saravanan123@gmail.com` - Information Technology ✅

### Students (19 total)
**Computer Science Department**:
- `placementstudent@gmail.com` ✅
- `john@example.com` ✅

**Information Technology Department**:
- `studentlogin@gmail.com` ✅
- `dinesh@gmail.com` ✅
- `abishek@gmail.com` ✅
- `hariraj78@gmail.com` ✅
- `palani@gmail.com` ✅
- `Student@gmail.com` ✅
- `tharun@gmail.com` ✅
- `umap@gmail.com` ✅

**Electronics Department**:
- `jane@example.com` ✅

**ECE Department**:
- `hari@gmail.com` ✅

---

## Testing Scenarios

### Scenario 1: Complete Student Journey
1. Login as: `student1@example.com` / `student123`
2. Complete profile with all details
3. Upload resume
4. Wait for staff approval
5. Browse available drives
6. Check eligibility
7. Apply for eligible drives
8. Track application status

### Scenario 2: Staff Management
1. Login as: `staff1@example.com` / `staff123`
2. View students in Administration department
3. Review student profiles
4. Update student skills
5. Approve student profiles
6. View applications from department
7. Export department data

### Scenario 3: Placement Officer Operations
1. Login as: `placement1@example.com` / `placement123`
2. Create new company drive
3. Set eligibility criteria
4. View all applications
5. Update application status
6. Export company-specific data
7. Manage students from all departments

### Scenario 4: Department Access Control
1. Login as Staff: `placementstaff@gmail.com` (Computer Science)
2. Verify you only see Computer Science students
3. Try to access Information Technology students (should be restricted)
4. Export data (only Computer Science applications)

### Scenario 5: Excel Export Feature
1. Login as Placement Officer or Staff
2. Navigate to Applications page
3. Select a company from dropdown
4. Click Download button
5. Verify Excel file downloads with correct data

---

## Creating New Test Users

### Via Django Admin
```bash
cd placement-system/backend
python manage.py createsuperuser
```

### Via Management Command
```bash
# Create test users (Student, Staff, Placement Officer)
python manage.py create_test_users

# Create admin user
python manage.py create_admin

# Create placement officer
python manage.py create_officer
```

### Via API (Placement Officer/Admin)
**Endpoint**: `POST /api/users/create/`

**Request Body**:
```json
{
  "username": "newuser@example.com",
  "email": "newuser@example.com",
  "full_name": "New User",
  "password": "password123",
  "role": "STUDENT",
  "department": "Computer Science",
  "cgpa": 8.5
}
```

---

## Password Reset

### For Test Users
If you forget a test user password:

**Method 1: Management Command**
```bash
python manage.py shell
>>> from api.models import User
>>> user = User.objects.get(username='student1@example.com')
>>> user.set_password('newpassword123')
>>> user.save()
```

**Method 2: Via Admin Panel**
1. Login to Django admin: `http://localhost:8000/admin`
2. Navigate to Users
3. Select user
4. Click "Reset password"

**Method 3: Via API**
```bash
POST /api/users/{user_id}/reset-password/
{
  "new_password": "newpassword123"
}
```

---

## Important Notes

### Security
- ⚠️ These are TEST credentials only
- ⚠️ Never use these passwords in production
- ⚠️ Change all passwords before deployment
- ⚠️ Use strong passwords in production

### First Login
- Some users may have `is_first_login=True`
- They will be prompted to change password on first login
- This is a security feature

### Inactive Users
Some users are marked as inactive (`is_active=False`):
- `admin@gmail.com`
- `superadmin@example.com`
- `student1@example.com`
- `rani@gmail.com`
- `placement2@gmail.com`

To activate:
```python
user = User.objects.get(username='admin@gmail.com')
user.is_active = True
user.save()
```

### Department Assignment
Users without department (6 users):
- Cannot access department-specific features
- Should be assigned a department

To assign department:
```python
user = User.objects.get(username='sara@gmail.com')
user.department = 'Computer Science'
user.save()
```

---

## Quick Login URLs

### Development
- **Frontend**: http://localhost:5173
- **Student Login**: http://localhost:5173/login
- **Admin Login**: http://localhost:5173/admin-login
- **Backend Admin**: http://localhost:8000/admin

### Production
- Update URLs based on your deployment

---

## Testing Checklist

- [ ] Login with each role (Student, Staff, Placement Officer)
- [ ] Complete student profile
- [ ] Create company drive
- [ ] Apply for drive
- [ ] Update application status
- [ ] Export Excel data
- [ ] Test department access control
- [ ] Verify eligibility checking
- [ ] Test password reset
- [ ] Upload files (resume, photo)

---

**Last Updated**: March 9, 2026  
**Status**: Active Test Environment

<!-- CHECKPOINT id="ckpt_mmj08knw_y60s2n" time="2026-03-09T09:54:38.876Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->
