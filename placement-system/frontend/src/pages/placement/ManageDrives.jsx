import { useState, useEffect } from 'react';
import { getDrives, deleteDrive } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function ManageDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await getDrives();
      setDrives(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load drives');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drive?')) return;

    try {
      await deleteDrive(id);
      toast.success('Drive deleted successfully');
      fetchDrives();
    } catch (error) {
      toast.error('Failed to delete drive');
      console.error(error);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Drives</h1>
        <Link
          to="/placement/drives/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Create New Drive
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.map((drive) => (
          <div key={drive.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">{drive.company_name}</h3>
            <p className="text-sm text-gray-600 mt-1">{drive.job_role}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Package:</span> ₹{drive.package} LPA</p>
              <p className="text-sm"><span className="font-medium">Min CGPA:</span> {drive.minimum_cgpa}</p>
              <p className="text-sm"><span className="font-medium">Applications:</span> {drive.applications_count || 0}</p>
              <p className="text-sm"><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  drive.status === 'active' ? 'bg-green-100 text-green-800' : 
                  drive.status === 'closed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {drive.status}
                </span>
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleDelete(drive.id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageDrives;
