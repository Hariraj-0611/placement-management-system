import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadUserProfilePhoto, updateUserProfile, changePassword } from '../../services/api';
import { PencilIcon, KeyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const StaffProfile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    department: user?.department || ''
  });
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    try {
      setLoading(true);
      await uploadUserProfilePhoto(file);
      toast.success('Profile photo updated successfully');
      await refreshUser();
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data if canceling
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        department: user?.department || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateUserProfile(formData);
      toast.success('Profile updated successfully');
      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || '?';
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await changePassword(passwordData.oldPassword, passwordData.newPassword, passwordData.confirmPassword);
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        <div className="relative h-32 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              {user?.profile_photo ? (
                <img
                  src={`http://localhost:8000${user.profile_photo}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-white text-4xl font-bold">
                    {getInitials()}
                  </span>
                </div>
              )}
              <label
                htmlFor="photo-upload"
                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition"
                title="Change profile photo"
              >
                <PencilIcon className="h-4 w-4 text-gray-600" />
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-20 pb-6 px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.first_name || user?.username}{' '}
                {user?.last_name || ''}
              </h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user?.email}
              </p>
              <p className="text-gray-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {user?.department || 'Not specified'}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                {user?.role}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition flex items-center gap-2"
              >
                <KeyIcon className="h-4 w-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <form onSubmit={handleSaveProfile}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-900">{user?.first_name || 'Not set'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-900">{user?.last_name || 'Not set'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                {isEditing ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Administration">Administration</option>
                  </select>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-900">{user?.department || 'Not specified'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              You can update your profile information and photo. Changes will be reflected immediately across the system.
            </p>
          </div>
        </div>
      </div>
      
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <KeyIcon className="h-6 w-6 mr-2 text-green-600" />
                Change Password
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffProfile;
