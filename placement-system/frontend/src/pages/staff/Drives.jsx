import { useState, useEffect } from 'react';
import { staffListDrives } from '../../services/api';
import toast from 'react-hot-toast';

function StaffDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDrives();
  }, [statusFilter]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await staffListDrives(params);
      setDrives(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. Staff role required.');
      } else {
        toast.error('Failed to load drives');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
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
        <h1 className="text-3xl font-bold text-gray-900">Company Drives (Read-Only)</h1>
        <p className="mt-2 text-gray-600">View all company placement drives</p>
      </div>

      {/* Filter */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No drives found</p>
          </div>
        ) : (
          drives.map((drive) => (
            <div key={drive.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {drive.company_name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(drive.status)}`}>
                    {drive.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Role:</span> {drive.job_role}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Package:</span> ₹{drive.package} LPA
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Min CGPA:</span> {drive.minimum_cgpa}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Applications:</span> {drive.applications_count || 0}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">
                    Deadline: {new Date(drive.deadline).toLocaleDateString()}
                  </p>
                  {drive.drive_date && (
                    <p className="text-xs text-gray-500">
                      Drive Date: {new Date(drive.drive_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
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
              <strong>Read-Only Access:</strong> You can view all company drives but cannot create, edit, or delete them. 
              Contact the Placement Officer for any changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDrives;
