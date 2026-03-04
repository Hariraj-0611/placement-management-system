import { useState, useEffect } from 'react';
import { getStudentProfile, updateStudentCGPA, updateUser, resetUserPassword, toggleUserStatus, deleteUser } from '../../services/api';
import { PencilIcon, KeyIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCGPA, setEditingCGPA] = useState(null);
  const [cgpaValue, setCgpaValue] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form states
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getStudentProfile();
      setStudents(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCGPA = (student) => {
    setEditingCGPA(student.id);
    setCgpaValue(student.cgpa || '');
  };

  const handleSaveCGPA = async (studentId) => {
    try {
      const cgpa = cgpaValue === '' ? null : parseFloat(cgpaValue);
      
      if (cgpa !== null && (cgpa < 0 || cgpa > 10)) {
        toast.error('CGPA must be between 0 and 10');
        return;
      }

      await updateStudentCGPA(studentId, cgpa);
      toast.success('CGPA updated successfully');
      setEditingCGPA(null);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update CGPA');
    }
  };

  const handleCancelEdit = () => {
    setEditingCGPA(null);
    setCgpaValue('');
  };

  // Edit User Modal
  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      first_name: student.user?.first_name || '',
      last_name: student.user?.last_name || '',
      email: student.user?.email || '',
      department: student.user?.department || ''
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(selectedStudent.user.id, editFormData);
      toast.success('Student updated successfully');
      setShowEditModal(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update student');
    }
  };

  // Reset Password Modal
  const handleOpenResetPasswordModal = (student) => {
    setSelectedStudent(student);
    setNewPassword('');
    setConfirmPassword('');
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      await resetUserPassword(selectedStudent.user.id, newPassword);
      toast.success('Password reset successfully');
      setShowResetPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (student) => {
    const action = student.user.is_active ? 'deactivate' : 'activate';
    
    if (window.confirm(`Are you sure you want to ${action} this student?`)) {
      try {
        await toggleUserStatus(student.user.id);
        toast.success(`Student ${action}d successfully`);
        fetchStudents();
      } catch (error) {
        toast.error(error.response?.data?.error || `Failed to ${action} student`);
      }
    }
  };

  // Delete User Modal
  const handleOpenDeleteModal = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedStudent.user.id);
      toast.success('Student deleted successfully');
      setShowDeleteModal(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete student');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and edit student academic records. Only placement officers can update CGPA.
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.user?.username || student.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.user?.email || student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.user?.department || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingCGPA === student.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={cgpaValue}
                        onChange={(e) => setCgpaValue(e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00"
                      />
                      <button
                        onClick={() => handleSaveCGPA(student.id)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span>{student.cgpa || 'N/A'}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {student.skills?.join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {student.user?.is_active ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.resume ? (
                    <a href={student.resume} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                      View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    {editingCGPA !== student.id && (
                      <>
                        <button
                          onClick={() => handleEditCGPA(student)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-xs"
                          title="Edit CGPA"
                        >
                          Edit CGPA
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Edit Student"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenResetPasswordModal(student)}
                          className="p-1 text-yellow-600 hover:text-yellow-900"
                          title="Reset Password"
                        >
                          <KeyIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`p-1 ${student.user?.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                          title={student.user?.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(student)}
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Delete Student"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <PencilIcon className="h-6 w-6 mr-2 text-blue-600" />
                Edit Student
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <KeyIcon className="h-6 w-6 mr-2 text-yellow-600" />
                Reset Password
              </h2>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Student:</strong> {selectedStudent?.user?.first_name} {selectedStudent?.user?.last_name} ({selectedStudent?.user?.email})
              </p>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <TrashIcon className="h-6 w-6 mr-2 text-red-600" />
                Delete Student
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action will soft delete the student. The student will no longer be able to login or appear in lists.
                </p>
              </div>
              
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{selectedStudent?.user?.first_name} {selectedStudent?.user?.last_name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Email: {selectedStudent?.user?.email}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStudents;
