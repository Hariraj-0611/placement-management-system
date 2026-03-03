import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActiveDrives, applyForDrive, getMyApplications } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BriefcaseIcon, CalendarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ReactPaginate from 'react-paginate';

const CompanyDrives = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDrives();
    fetchMyApplications();
  }, [currentPage]);

  useEffect(() => {
    if (id && drives.length > 0) {
      const drive = drives.find(d => d.id === parseInt(id));
      if (drive) {
        setSelectedDrive(drive);
      }
    }
  }, [id, drives]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const response = await getActiveDrives(currentPage);
      setDrives(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 10) || 1);
    } catch (error) {
      console.error('Failed to fetch drives:', error);
      toast.error('Failed to load company drives');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await getMyApplications();
      console.log('My applications response:', response.data);
      setMyApplications(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const handleApply = async (driveId) => {
    try {
      setApplying(true);
      console.log('Applying for drive:', driveId);
      const response = await applyForDrive(driveId);
      console.log('Apply response:', response.data);
      toast.success(response.data.message || 'Application submitted successfully!');
      fetchMyApplications();
      if (selectedDrive) {
        setSelectedDrive(null);
        navigate('/drives');
      }
    } catch (error) {
      console.error('Apply error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to apply';
      toast.error(errorMsg);
    } finally {
      setApplying(false);
    }
  };

  const hasApplied = (driveId) => {
    const applied = myApplications.some(app => {
      // Check both app.drive and app.drive.id to handle different response formats
      const appDriveId = typeof app.drive === 'object' ? app.drive.id : app.drive;
      return appDriveId === driveId;
    });
    console.log('Has applied to drive', driveId, ':', applied);
    return applied;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selected':
      case 'selected':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'Shortlisted':
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'Applied':
      case 'applied':
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  if (loading && drives.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Detail View
  if (selectedDrive) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => {
            setSelectedDrive(null);
            navigate('/drives');
          }}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Drives
        </button>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">{selectedDrive.company_name}</h1>
            <p className="text-blue-100 mt-2">{selectedDrive.job_role}</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Drive Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">Role:</span>
                    <span className="ml-2">{selectedDrive.job_role}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">Minimum CGPA:</span>
                    <span className="ml-2">{selectedDrive.minimum_cgpa}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">Deadline:</span>
                    <span className="ml-2">
                      {new Date(selectedDrive.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDrive.required_skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{selectedDrive.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Eligibility Criteria</h3>
              <p className="text-gray-700">{selectedDrive.eligibility_criteria}</p>
            </div>

            {hasApplied(selectedDrive.id) ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">
                  You have already applied for this drive
                </p>
              </div>
            ) : (
              <button
                onClick={() => handleApply(selectedDrive.id)}
                disabled={applying}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Drives</h1>
        <p className="text-gray-600 mt-2">
          Browse and apply to upcoming placement drives
        </p>
      </div>

      {drives.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Drives</h3>
          <p className="text-gray-600">
            There are no active company drives at the moment. Please check back later.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drives.map((drive) => {
              const applied = hasApplied(drive.id);
              const application = myApplications.find(app => {
                const appDriveId = typeof app.drive === 'object' ? app.drive.id : app.drive;
                return appDriveId === drive.id;
              });
              
              return (
                <div
                  key={drive.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/drives/${drive.id}`)}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {drive.company_name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-4">{drive.job_role}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        <span>Min CGPA: {drive.minimum_cgpa}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {drive.required_skills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {drive.required_skills?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{drive.required_skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {applied && application ? (
                      <div className={`text-center py-2 px-3 rounded-md text-sm font-medium ${getStatusColor(application.status)}`}>
                        Status: {application.status}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(drive.id);
                        }}
                        disabled={applying}
                        className="w-full py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {applying ? 'Applying...' : 'Apply'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

export default CompanyDrives;
