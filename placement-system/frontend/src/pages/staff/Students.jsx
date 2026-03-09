import { useState, useEffect } from 'react';
import { staffListStudents, staffGetStudentDetail, staffUpdateStudentAcademics, staffVerifyEligibility } from '../../services/api';
import toast from 'react-hot-toast';

function StaffStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [editForm, setEditForm] = useState({
    cgpa: '',
    department: '',
    skills: []
  });
  const [eligibilityForm, setEligibilityForm] = useState({
    is_eligible: false,
    remarks: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, departmentFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (departmentFilter) params.department = departmentFilter;
      
      const response = await staffListStudents(params);
      setStudents(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. Staff role required.');
      } else {
        toast.error('Failed to load students');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = async (student) => {
    try {
      const response = await staffGetStudentDetail(student.id);
      setSelectedStudent(response.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load student details');
    }
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditForm({
      cgpa: student.cgpa || '',
      department: student.user?.department || '',
      skills: student.skills || []
    });
    setShowEditModal(true);
  };

  const handleEligibilityClick = (student) => {
    setSelectedStudent(student);
    setEligibilityForm({
      is_eligible: student.is_eligible || false,
      remarks: student.eligibility_remarks || ''
    });
    setShowEligibilityModal(true);
  };

  const handleUpdateAcademics = async (e) => {
    e.preventDefault();
    try {
      // Only send skills - DO NOT send department
      // If department changes, student will move to different department and disappear from staff's list
      const updateData = {
        skills: editForm.skills
      };
      
      await staffUpdateStudentAcademics(selectedStudent.id, updateData);
      toast.success('Skills updated successfully');
      setShowEditModal(false);
      fetchStudents();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.error || 'Access denied. You do not have permission to update student details.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update student');
      }
    }
  };

  const handleVerifyEligibility = async (e) => {
    e.preventDefault();
    try {
      await staffVerifyEligibility(
        selectedStudent.id,
        eligibilityForm.is_eligible,
        eligibilityForm.remarks
      );
      toast.success(`Student marked as ${eligibilityForm.is_eligible ? 'eligible' : 'not eligible'}`);
      setShowEligibilityModal(false);
      fetchStudents();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to verify eligibility.');
      } else {
        toast.error('Failed to update eligibility');
      }
    }
  };

  const addSkill = () => {
    const skillInput = document.getElementById('skill-input');
    const skill = skillInput.value.trim();
    if (skill && !editForm.skills.includes(skill)) {
      setEditForm({ ...editForm, skills: [...editForm.skills, skill] });
      skillInput.value = '';
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(skill => skill !== skillToRemove)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
        <p className="mt-2 text-gray-600">View and update student academic details</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Students
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CGPA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Eligibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.user?.first_name || student.user?.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {student.user?.email || student.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {student.user?.department || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.is_eligible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.is_eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleDetailClick(student)}
                        className="text-left text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleEditClick(student)}
                        className="text-left text-green-600 hover:text-green-900 font-medium"
                      >
                        Edit Academics
                      </button>
                      <button
                        onClick={() => handleEligibilityClick(student)}
                        className="text-left text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Verify Eligibility
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Academic Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Edit Academic Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Student: <strong>{selectedStudent?.user?.username}</strong>
              </p>
            </div>
            
            <form onSubmit={handleUpdateAcademics} className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Staff cannot update CGPA. Only Placement Officers can update CGPA values.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CGPA (Read Only)
                    </label>
                    <input
                      type="text"
                      value={selectedStudent?.cgpa || 'Not Set'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Contact Placement Officer to update CGPA
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department (Read Only)
                    </label>
                    <input
                      type="text"
                      value={selectedStudent?.user?.department || 'Not Set'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Contact Placement Officer to change department
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <p className="text-sm text-yellow-700">
                    <strong>Warning:</strong> Staff cannot change student department. Changing department will move the student to a different department and they will disappear from your list.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      id="skill-input"
                      placeholder="Add a skill (e.g., Python, Java)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {editForm.skills.length === 0 ? (
                      <span className="text-sm text-gray-500">No skills added yet</span>
                    ) : (
                      editForm.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-green-600 hover:text-green-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                type="submit"
                onClick={handleUpdateAcademics}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Update Details
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail View Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="text-gray-900 font-medium">{selectedStudent.user?.username || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedStudent.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <p className="text-gray-900">{selectedStudent.user?.first_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      <p className="text-gray-900">{selectedStudent.user?.last_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="text-gray-900">{selectedStudent.user?.department || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Register Number</label>
                      <p className="text-gray-900">{selectedStudent.register_number || 'Not Set'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-500">CGPA</label>
                      <p className="text-gray-900 font-semibold text-lg">
                        {selectedStudent.cgpa ? selectedStudent.cgpa.toFixed(2) : 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Year of Study</label>
                      <p className="text-gray-900">{selectedStudent.year_of_study || 'Not Set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Backlog Count</label>
                      <p className="text-gray-900">{selectedStudent.backlog_count || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Profile Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedStudent.profile_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedStudent.profile_approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No skills added</p>
                    )}
                  </div>
                </div>

                {/* Eligibility Status */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Status</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        selectedStudent.is_eligible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedStudent.is_eligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                    {selectedStudent.eligibility_remarks && (
                      <div className="mt-2">
                        <label className="text-sm font-medium text-gray-500">Remarks:</label>
                        <p className="text-gray-900 mt-1">{selectedStudent.eligibility_remarks}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Documents</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Resume</span>
                        {selectedStudent.resume ? (
                          <a
                            href={selectedStudent.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                          >
                            View Resume →
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">Not uploaded</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Profile Photo</span>
                        {selectedStudent.profile_photo ? (
                          <a
                            href={selectedStudent.profile_photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                          >
                            View Photo →
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Eligibility Modal */}
      {showEligibilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Verify Eligibility</h3>
              <p className="text-sm text-gray-600 mt-1">
                Student: <strong>{selectedStudent?.user?.username}</strong>
              </p>
            </div>
            
            <form onSubmit={handleVerifyEligibility} className="px-6 py-4">
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                  <p className="text-sm text-blue-700">
                    Mark this student as eligible or not eligible for placement drives.
                  </p>
                </div>

                <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="eligibility-checkbox"
                    checked={eligibilityForm.is_eligible}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, is_eligible: e.target.checked })}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="eligibility-checkbox" className="ml-3 text-sm font-medium text-gray-900">
                    Mark as Eligible for Placement
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={eligibilityForm.remarks}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, remarks: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any remarks about eligibility (e.g., reasons, conditions, notes)..."
                  />
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                type="submit"
                onClick={handleVerifyEligibility}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Eligibility Status
              </button>
              <button
                type="button"
                onClick={() => setShowEligibilityModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Staff Permissions:</strong> You can update student <strong>Skills</strong> and verify eligibility for students in your department only. 
              You CANNOT update CGPA, change departments, delete students, reset passwords, or change user roles. Contact Placement Officer for these actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffStudents;
