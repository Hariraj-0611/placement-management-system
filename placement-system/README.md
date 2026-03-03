# Placement Management System

A full-stack web application with Role-Based Access Control (RBAC) for managing college placement drives.

## 🚀 Features

### Three User Roles:
1. **STUDENT** - Apply for drives, manage profile
2. **STAFF** - Read-only access to view data
3. **PLACEMENT** - Full administrative control

### Key Functionality:
- ✅ JWT Authentication with token refresh
- ✅ Role-based authorization
- ✅ Company drive management
- ✅ Application tracking
- ✅ Student profile management
- ✅ File uploads (resume, profile photo)
- ✅ Dashboard analytics
- ✅ Responsive UI with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- SimpleJWT (JWT Authentication)
- MySQL Database
- django-cors-headers

### Frontend
- React 18 (Vite)
- React Router v6
- Axios
- Tailwind CSS
- React Hot Toast

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### Backend Setup

1. Navigate to backend directory:
```bash
cd placement-system/backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure database in `backend/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'placement',
        'USER': 'root',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create test users:
```bash
python manage.py create_test_users
```

7. Start development server:
```bash
python manage.py runserver
```

Backend will run at: http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd placement-system/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run at: http://localhost:3000 or http://localhost:5173

## 🔐 Test Accounts

### Student Account
- Username: `student1`
- Password: `student123`
- Role: STUDENT

### Staff Account
- Username: `staff1`
- Password: `staff123`
- Role: STAFF

### Placement Officer Account
- Username: `placement1`
- Password: `placement123`
- Role: PLACEMENT

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/register/          - Register new student
POST   /api/login/             - Login (all roles)
POST   /api/logout/            - Logout
GET    /api/me/                - Get current user
POST   /api/forgot-password/   - Request password reset
POST   /api/reset-password/    - Reset password
```

### Dashboard Endpoints
```
GET    /api/dashboard/student/     - Student dashboard
GET    /api/dashboard/staff/       - Staff dashboard
GET    /api/dashboard/placement/   - Placement dashboard
```

### Drive Endpoints
```
GET    /api/drives/            - List drives
POST   /api/drives/            - Create drive (PLACEMENT only)
PUT    /api/drives/{id}/       - Update drive (PLACEMENT only)
DELETE /api/drives/{id}/       - Delete drive (PLACEMENT only)
```

### Application Endpoints
```
GET    /api/applications/      - List applications
POST   /api/applications/      - Apply for drive (STUDENT only)
PATCH  /api/applications/{id}/update_status/  - Update status (PLACEMENT only)
```

### Student Endpoints
```
GET    /api/students/          - List students
PUT    /api/students/update_profile/  - Update profile (STUDENT only)
POST   /api/students/upload_photo/    - Upload photo (STUDENT only)
POST   /api/students/upload_resume/   - Upload resume (STUDENT only)
```

## 🎯 Role Permissions

### STUDENT
- ✅ View active drives
- ✅ Apply for drives
- ✅ View own applications
- ✅ Update own profile
- ✅ Upload resume and photo
- ❌ Cannot view other students
- ❌ Cannot create/edit drives
- ❌ Cannot change application status

### STAFF
- ✅ View all students (read-only)
- ✅ View all drives (read-only)
- ✅ View all applications (read-only)
- ❌ Cannot create/edit/delete anything
- ❌ Cannot update application status

### PLACEMENT
- ✅ Full CRUD on drives
- ✅ View all students
- ✅ View all applications
- ✅ Update application status
- ✅ Manage users
- ✅ Full dashboard access

## 📁 Project Structure

```
placement-system/
├── backend/
│   ├── api/
│   │   ├── models.py           # Database models
│   │   ├── views.py            # API views
│   │   ├── serializers.py      # Data serialization
│   │   ├── permissions.py      # Custom permissions
│   │   └── urls.py             # API routing
│   ├── backend/
│   │   └── settings.py         # Django configuration
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── context/            # Auth context
│   │   ├── pages/              # Page components
│   │   │   ├── student/        # Student pages
│   │   │   ├── staff/          # Staff pages
│   │   │   └── placement/      # Placement pages
│   │   ├── services/           # API client
│   │   └── App.jsx             # Main app
│   └── package.json
└── RBAC_DOCUMENTATION.md       # Detailed documentation
```

## 🔒 Security Features

- JWT token-based authentication
- Token refresh mechanism
- Token blacklisting on logout
- Password hashing (PBKDF2)
- CORS configuration
- Input validation
- File upload validation
- SQL injection prevention
- XSS protection
- CSRF protection

## 🧪 Testing

### Manual Testing Flow

1. **Test Student Flow:**
   - Login as student1
   - View available drives
   - Apply for a drive
   - Check application status
   - Update profile

2. **Test Staff Flow:**
   - Login as staff1
   - View students (read-only)
   - View drives (read-only)
   - View applications (read-only)

3. **Test Placement Flow:**
   - Login as placement1
   - Create new drive
   - View applications
   - Update application status
   - Manage students

## 📖 Documentation

For detailed documentation, see [RBAC_DOCUMENTATION.md](./RBAC_DOCUMENTATION.md)

Topics covered:
- Authentication Flow
- Authorization Flow
- Database Schema
- API Endpoints
- Security Best Practices
- Common Mistakes to Avoid
- Production Deployment

## 🚀 Production Deployment

### Backend
1. Set `DEBUG=False`
2. Configure `ALLOWED_HOSTS`
3. Use environment variables for secrets
4. Set up HTTPS
5. Configure production database
6. Set up static file serving
7. Configure email backend

### Frontend
1. Build production bundle: `npm run build`
2. Update API_URL to production
3. Configure environment variables
4. Set up CDN for assets
5. Enable gzip compression

## 🤝 Contributing

This is an educational project demonstrating RBAC implementation. Feel free to use it as a reference for your own projects.

## 📝 License

This project is for educational purposes.

## 👨‍💻 Author

Built as a demonstration of full-stack development with RBAC.

---

**Note:** This is a development setup. For production, ensure proper security configurations, environment variables, and deployment best practices.

<!-- CHECKPOINT id="ckpt_mmae3xa0_frhw45" time="2026-03-03T09:13:00.984Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->

<!-- CHECKPOINT id="ckpt_mmaegs8f_avq5kw" time="2026-03-03T09:23:00.975Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->

<!-- CHECKPOINT id="ckpt_mmaetn73_iuly2e" time="2026-03-03T09:33:00.975Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->

<!-- CHECKPOINT id="ckpt_mmaf6i5y_g40mwy" time="2026-03-03T09:43:00.982Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->

<!-- CHECKPOINT id="ckpt_mmafjd54_0d7b3s" time="2026-03-03T09:53:01.000Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->

<!-- CHECKPOINT id="ckpt_mmafw83q_hshcyg" time="2026-03-03T10:03:00.998Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->

<!-- CHECKPOINT id="ckpt_mmag932w_it4tkc" time="2026-03-03T10:13:01.016Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->

<!-- CHECKPOINT id="ckpt_mmagv6zl_8qu1ay" time="2026-03-03T10:30:12.513Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->
