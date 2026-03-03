import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH APIs
// ============================================
export const register = (userData) => api.post('/register/', userData);
export const login = (credentials) => api.post('/login/', credentials);
export const logout = (refreshToken) => api.post('/logout/', { refresh: refreshToken });
export const getCurrentUser = () => api.get('/me/');
export const forgotPassword = (email) => api.post('/forgot-password/', { email });
export const resetPassword = (token, newPassword) => api.post('/reset-password/', { token, new_password: newPassword });
export const uploadUserProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append('profile_photo', file);
  return api.post('/upload-profile-photo/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateUserProfile = (data) => api.put('/update-profile/', data);

// ============================================
// DASHBOARD APIs
// ============================================
export const getStudentDashboard = () => api.get('/dashboard/student/');
export const getStaffDashboard = () => api.get('/dashboard/staff/');
export const getPlacementDashboard = () => api.get('/dashboard/placement/');

// ============================================
// STUDENT APIs
// ============================================
export const getStudentProfile = (page = 1) => api.get(`/students/?page=${page}`);
export const updateStudentProfile = (id, data) => api.patch(`/students/${id}/`, data);
export const updateMyProfile = (data) => api.put('/students/update_profile/', data);

export const uploadProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append('profile_photo', file);
  return api.post('/students/upload_photo/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/students/upload_resume/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ============================================
// COMPANY DRIVE APIs
// ============================================
export const getDrives = (params = {}) => api.get('/drives/', { params });
export const getActiveDrives = (page = 1) => api.get(`/drives/?status=active&page=${page}`);
export const getDriveById = (id) => api.get(`/drives/${id}/`);
export const createDrive = (driveData) => api.post('/drives/', driveData);
export const updateDrive = (id, data) => api.patch(`/drives/${id}/`, data);
export const deleteDrive = (id) => api.delete(`/drives/${id}/`);

// ============================================
// APPLICATION APIs
// ============================================
export const getApplications = (params = {}) => api.get('/applications/', { params });
export const getMyApplications = () => api.get('/applications/');
export const applyForDrive = (driveId) => api.post('/applications/', { drive: driveId });
export const updateApplicationStatus = (id, status, remarks = '') => 
  api.patch(`/applications/${id}/update_status/`, { status, remarks });

// ============================================
// USER MANAGEMENT APIs (Placement Only)
// ============================================
export const listUsers = (params = {}) => api.get('/users/', { params });
export const createUser = (userData) => api.post('/users/create/', userData);
export const updateUser = (userId, userData) => api.put(`/users/${userId}/update/`, userData);
export const resetUserPassword = (userId, newPassword) => api.post(`/users/${userId}/reset-password/`, { new_password: newPassword });
export const toggleUserStatus = (userId) => api.post(`/users/${userId}/toggle-status/`);
export const deleteUser = (userId) => {
  console.log('deleteUser API called with userId:', userId);
  console.log('DELETE URL:', `/users/${userId}/delete/`);
  return api.delete(`/users/${userId}/delete/`);
};

// ============================================
// STUDENT VERIFICATION APIs (Placement Only)
// ============================================
export const verifyStudentEligibility = (studentId, isEligible, remarks = '') => 
  api.post(`/students/${studentId}/verify-eligibility/`, { is_eligible: isEligible, remarks });
export const approveStudentProfile = (studentId, approved) => 
  api.post(`/students/${studentId}/approve-profile/`, { approved });

// ============================================
// STAFF-SPECIFIC APIs
// ============================================
export const staffListStudents = (params = {}) => api.get('/staff/students/', { params });
export const staffGetStudentDetail = (studentId) => api.get(`/staff/students/${studentId}/`);
export const staffUpdateStudentAcademics = (studentId, data) => 
  api.patch(`/staff/students/${studentId}/update-academics/`, data);
export const staffVerifyEligibility = (studentId, isEligible, remarks = '') => 
  api.post(`/staff/students/${studentId}/verify-eligibility/`, { is_eligible: isEligible, remarks });
export const staffListDrives = (params = {}) => api.get('/staff/drives/', { params });
export const staffListApplications = (params = {}) => api.get('/staff/applications/', { params });

export default api;
