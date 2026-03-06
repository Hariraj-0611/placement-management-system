import { useState, useEffect } from 'react';
import { staffListApplications, staffGetCompanies } from '../../services/api';
import toast from 'react-hot-toast';

function StaffApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, companyFilter]);

  const fetchCompanies = async () => {
    try {
      const response = await staffGetCompanies();
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (companyFilter) params.company = companyFilter;
      
      const response = await staffListApplications(params);
      setApplications(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. Staff role required.');
      } else {
        toast.error('Failed to load applications');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Applied: 'bg-yellow-100 text-yellow-800',
      Shortlisted: 'bg-blue-100 text-blue-800',
      Selected: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900">Applications (Read-Only)</h1>
        <p className="mt-2 text-gray-600">View student applications from your department</p>
      </div>

      {/* Filter */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>

          <label className="text-sm font-medium text-gray-700 ml-4">
            Filter by Company:
          </label>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CGPA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {app.student_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {app.student_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {app.drive_company}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {app.drive_role}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {app.student_cgpa ? app.student_cgpa.toFixed(2) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Applications</p>
          <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
        </div>
        <div className="bg-blue-50 shadow rounded-lg p-4">
          <p className="text-sm text-blue-600">Shortlisted</p>
          <p className="text-2xl font-bold text-blue-900">
            {applications.filter(app => app.status === 'Shortlisted').length}
          </p>
        </div>
        <div className="bg-green-50 shadow rounded-lg p-4">
          <p className="text-sm text-green-600">Selected</p>
          <p className="text-2xl font-bold text-green-900">
            {applications.filter(app => app.status === 'Selected').length}
          </p>
        </div>
        <div className="bg-red-50 shadow rounded-lg p-4">
          <p className="text-sm text-red-600">Rejected</p>
          <p className="text-2xl font-bold text-red-900">
            {applications.filter(app => app.status === 'Rejected').length}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Department Access:</strong> You can only view applications from students in your department. 
              <strong> Read-Only Access:</strong> You can view all applications but cannot update their status. 
              Only Placement Officers can change application status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffApplications;
