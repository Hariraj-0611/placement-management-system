import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../../services/api';
import { DocumentTextIcon, CalendarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import ReactPaginate from 'react-paginate';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchApplications();
  }, [currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications(currentPage);
      setApplications(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 10) || 1);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-2">
          Track the status of your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't applied to any company drives yet.
          </p>
          <Link
            to="/drives"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Company Drives
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {application.drive_company}
                        </h3>
                      </div>
                      <p className="text-blue-600 font-medium mb-2">
                        {application.drive_role}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Applied on: {new Date(application.applied_at).toLocaleDateString()}
                      </div>
                      {application.remarks && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Remarks:</span> {application.remarks}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                          application.status.toLowerCase()
                        )}`}
                      >
                        {application.status}
                      </span>
                      
                      {application.status.toLowerCase() === 'shortlisted' && (
                        <span className="text-sm text-green-600">
                          ✅ You've been shortlisted! Check your email for next steps.
                        </span>
                      )}
                      
                      {application.status.toLowerCase() === 'selected' && (
                        <span className="text-sm text-green-600">
                          🎉 Congratulations! You've been selected.
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <ReactPaginate
                previousLabel="Previous"
                nextLabel="Next"
                pageCount={totalPages}
                onPageChange={handlePageChange}
                containerClassName="flex justify-center space-x-2"
                previousClassName="px-3 py-1 border rounded hover:bg-gray-50"
                nextClassName="px-3 py-1 border rounded hover:bg-gray-50"
                pageClassName="px-3 py-1 border rounded hover:bg-gray-50"
                activeClassName="bg-blue-600 text-white hover:bg-blue-700"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyApplications;