import { useState, useEffect } from 'react';
import { staffListApplications, staffGetCompanies } from '../../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

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

  const exportToExcel = (data, filename) => {
    // Prepare data for Excel
    const excelData = data.map((app, index) => ({
      'S.No': index + 1,
      'Student Name': app.student_name,
      'Email': app.student_email,
      'Register Number': app.student_register_number || 'N/A',
      'Department': app.student_department || 'N/A',
      'CGPA': app.student_cgpa ? app.student_cgpa.toFixed(2) : 'N/A',
      'Company': app.drive_company,
      'Job Role': app.drive_role,
      'Package (LPA)': app.drive_package || 'N/A',
      'Status': app.status,
      'Applied Date': new Date(app.applied_at).toLocaleDateString(),
      'Remarks': app.remarks || ''
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 6 },  // S.No
      { wch: 20 }, // Student Name
      { wch: 30 }, // Email
      { wch: 15 }, // Register Number
      { wch: 20 }, // Department
      { wch: 8 },  // CGPA
      { wch: 25 }, // Company
      { wch: 25 }, // Job Role
      { wch: 12 }, // Package
      { wch: 12 }, // Status
      { wch: 15 }, // Applied Date
      { wch: 30 }  // Remarks
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');

    // Save file
    XLSX.writeFile(wb, filename);
    toast.success(`Exported ${data.length} applications to Excel`);
  };

  const exportAllCompaniesSeparate = () => {
    if (applications.length === 0) {
      toast.error('No applications to export');
      return;
    }

    // Group applications by company
    const companiesData = {};
    applications.forEach(app => {
      const company = app.drive_company;
      if (!companiesData[company]) {
        companiesData[company] = [];
      }
      companiesData[company].push(app);
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add a sheet for each company
    Object.keys(companiesData).sort().forEach(company => {
      const companyApps = companiesData[company];
      
      // Prepare data
      const excelData = companyApps.map((app, index) => ({
        'S.No': index + 1,
        'Student Name': app.student_name,
        'Email': app.student_email,
        'Register Number': app.student_register_number || 'N/A',
        'Department': app.student_department || 'N/A',
        'CGPA': app.student_cgpa ? app.student_cgpa.toFixed(2) : 'N/A',
        'Job Role': app.drive_role,
        'Package (LPA)': app.drive_package || 'N/A',
        'Status': app.status,
        'Applied Date': new Date(app.applied_at).toLocaleDateString(),
        'Remarks': app.remarks || ''
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 6 },  // S.No
        { wch: 20 }, // Student Name
        { wch: 30 }, // Email
        { wch: 15 }, // Register Number
        { wch: 20 }, // Department
        { wch: 8 },  // CGPA
        { wch: 25 }, // Job Role
        { wch: 12 }, // Package
        { wch: 12 }, // Status
        { wch: 15 }, // Applied Date
        { wch: 30 }  // Remarks
      ];
      ws['!cols'] = colWidths;

      // Sanitize sheet name (Excel has 31 char limit and special char restrictions)
      let sheetName = company.substring(0, 31).replace(/[:\\/?*\[\]]/g, '_');
      
      // Add sheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Add summary sheet
    const summaryData = Object.keys(companiesData).sort().map((company, index) => ({
      'S.No': index + 1,
      'Company': company,
      'Total Applications': companiesData[company].length,
      'Applied': companiesData[company].filter(a => a.status === 'Applied').length,
      'Shortlisted': companiesData[company].filter(a => a.status === 'Shortlisted').length,
      'Selected': companiesData[company].filter(a => a.status === 'Selected').length,
      'Rejected': companiesData[company].filter(a => a.status === 'Rejected').length
    }));

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 }
    ];
    
    // Insert summary sheet at the beginning
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Save file
    const filename = `All_Companies_Separate_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success(`Exported ${Object.keys(companiesData).length} companies in separate sheets`);
  };

  const exportWithStatistics = () => {
    if (applications.length === 0) {
      toast.error('No applications to export');
      return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // 1. All Applications Sheet
    const allAppsData = applications.map((app, index) => ({
      'S.No': index + 1,
      'Student Name': app.student_name,
      'Email': app.student_email,
      'Register Number': app.student_register_number || 'N/A',
      'Department': app.student_department || 'N/A',
      'CGPA': app.student_cgpa ? app.student_cgpa.toFixed(2) : 'N/A',
      'Company': app.drive_company,
      'Job Role': app.drive_role,
      'Package (LPA)': app.drive_package || 'N/A',
      'Status': app.status,
      'Applied Date': new Date(app.applied_at).toLocaleDateString()
    }));

    const allAppsWs = XLSX.utils.json_to_sheet(allAppsData);
    allAppsWs['!cols'] = [
      { wch: 6 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 20 },
      { wch: 8 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, allAppsWs, 'All Applications');

    // 2. Statistics by Company
    const companiesData = {};
    applications.forEach(app => {
      const company = app.drive_company;
      if (!companiesData[company]) {
        companiesData[company] = [];
      }
      companiesData[company].push(app);
    });

    const companyStats = Object.keys(companiesData).sort().map((company, index) => ({
      'S.No': index + 1,
      'Company': company,
      'Total': companiesData[company].length,
      'Applied': companiesData[company].filter(a => a.status === 'Applied').length,
      'Shortlisted': companiesData[company].filter(a => a.status === 'Shortlisted').length,
      'Selected': companiesData[company].filter(a => a.status === 'Selected').length,
      'Rejected': companiesData[company].filter(a => a.status === 'Rejected').length,
      'Selection Rate': companiesData[company].length > 0 
        ? ((companiesData[company].filter(a => a.status === 'Selected').length / companiesData[company].length) * 100).toFixed(1) + '%'
        : '0%'
    }));

    const companyStatsWs = XLSX.utils.json_to_sheet(companyStats);
    companyStatsWs['!cols'] = [
      { wch: 6 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, 
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, companyStatsWs, 'Company Statistics');

    // 3. Statistics by Status
    const statusStats = [
      {
        'Status': 'Applied',
        'Count': applications.filter(a => a.status === 'Applied').length,
        'Percentage': ((applications.filter(a => a.status === 'Applied').length / applications.length) * 100).toFixed(1) + '%'
      },
      {
        'Status': 'Shortlisted',
        'Count': applications.filter(a => a.status === 'Shortlisted').length,
        'Percentage': ((applications.filter(a => a.status === 'Shortlisted').length / applications.length) * 100).toFixed(1) + '%'
      },
      {
        'Status': 'Selected',
        'Count': applications.filter(a => a.status === 'Selected').length,
        'Percentage': ((applications.filter(a => a.status === 'Selected').length / applications.length) * 100).toFixed(1) + '%'
      },
      {
        'Status': 'Rejected',
        'Count': applications.filter(a => a.status === 'Rejected').length,
        'Percentage': ((applications.filter(a => a.status === 'Rejected').length / applications.length) * 100).toFixed(1) + '%'
      }
    ];

    const statusStatsWs = XLSX.utils.json_to_sheet(statusStats);
    statusStatsWs['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, statusStatsWs, 'Status Statistics');

    // Save file
    const filename = `Applications_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success('Exported detailed report with statistics');
  };

  const handleExportAll = () => {
    if (applications.length === 0) {
      toast.error('No applications to export');
      return;
    }
    
    const filename = `All_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(applications, filename);
  };

  const handleExportByCompany = () => {
    if (!companyFilter) {
      toast.error('Please select a company first');
      return;
    }

    const companyApplications = applications.filter(app => 
      app.drive_company.toLowerCase().includes(companyFilter.toLowerCase())
    );

    if (companyApplications.length === 0) {
      toast.error('No applications found for this company');
      return;
    }

    const filename = `${companyFilter.replace(/\s+/g, '_')}_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(companyApplications, filename);
  };

  const handleExportByStatus = () => {
    if (!statusFilter) {
      toast.error('Please select a status first');
      return;
    }

    const statusApplications = applications.filter(app => app.status === statusFilter);

    if (statusApplications.length === 0) {
      toast.error('No applications found for this status');
      return;
    }

    const filename = `${statusFilter}_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(statusApplications, filename);
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
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Applications (Read-Only)</h1>
          <p className="mt-2 text-gray-600">View student applications from your department</p>
        </div>

        {/* Export by Company Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Export Single Company Applications
              </label>
              <div className="flex gap-3">
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Select a Company --</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleExportByCompany}
                  disabled={!companyFilter}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    companyFilter
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
              {companyFilter && (
                <p className="mt-2 text-sm text-blue-700">
                  Ready to download applications for <strong>{companyFilter}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter for Table View */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
          {statusFilter && (
            <button
              onClick={handleExportByStatus}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export {statusFilter}
            </button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Active Filters Display */}
        {(statusFilter || companyFilter) && (
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {companyFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Company: {companyFilter}
                  <button
                    onClick={() => setCompanyFilter('')}
                    className="ml-1 hover:text-blue-900"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('')}
                    className="ml-1 hover:text-orange-900"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCompanyFilter('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
        
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
