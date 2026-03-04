import { useState, useEffect } from 'react';
import { getStudentProfile, updateStudentCGPA } from '../../services/api';
import toast from 'react-hot-toast';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCGPA, setEditingCGPA] = useState(null);
  const [cgpaValue, setCgpaValue] = useState('');

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
                  {editingCGPA !== student.id && (
                    <button
                      onClick={() => handleEditCGPA(student)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Edit CGPA
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageStudents;
