import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentDashboard } from '../../services/api';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { profile, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getStudentDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Available Drives',
      value: dashboardData?.total_drives_available || 0,
      icon: BriefcaseIcon,
      color: 'bg-blue-500',
      link: '/drives',
    },
    {
      name: 'Applied Drives',
      value: dashboardData?.applied_drives_count || 0,
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      link: '/applications',
    },
    {
      name: 'Selected',
      value: dashboardData?.selected_count || 0,
      icon: CheckCircleIcon,
      color: 'bg-purple-500',
      link: '/applications?status=selected',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your placement journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h2>
          </div>
          <div className="p-6">
            {dashboardData?.recent_applications?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {app.drive_company}
                      </p>
                      <p className="text-sm text-gray-600">{app.drive_role}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status.toLowerCase() === 'selected'
                          ? 'bg-green-100 text-green-800'
                          : app.status.toLowerCase() === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : app.status.toLowerCase() === 'shortlisted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No applications yet. Start applying to drives!
              </p>
            )}
            {dashboardData?.recent_applications?.length > 0 && (
              <div className="mt-4 text-center">
                <Link
                  to="/applications"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all applications →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Drives */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Drives
            </h2>
          </div>
          <div className="p-6">
            {dashboardData?.upcoming_drives?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcoming_drives.map((drive) => (
                  <div
                    key={drive.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {drive.company_name}
                      </p>
                      <p className="text-sm text-gray-600">{drive.job_role || drive.role}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Deadline: {new Date(drive.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      to={`/drives/${drive.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No upcoming drives at the moment.
              </p>
            )}
            {dashboardData?.upcoming_drives?.length > 0 && (
              <div className="mt-4 text-center">
                <Link
                  to="/drives"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all drives →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;