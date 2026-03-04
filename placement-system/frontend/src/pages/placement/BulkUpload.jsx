import { useState } from 'react';
import { bulkUploadStudents, bulkUploadStaff } from '../../services/api';
import toast from 'react-hot-toast';

function BulkUpload() {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'staff'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const response = activeTab === 'students' 
        ? await bulkUploadStudents(file)
        : await bulkUploadStaff(file);
      
      setResult(response.data);
      const userType = activeTab === 'students' ? 'students' : 'staff members';
      toast.success(`Successfully created ${response.data.summary.created} ${userType}!`);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    if (activeTab === 'students') {
      const csvContent = "Name,Email,Department,Date of Birth,CGPA\nJohn Doe,john@example.com,Computer Science,2000-01-15,8.5\nJane Smith,jane@example.com,Electronics,1999-12-20,9.0";
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_upload_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const csvContent = "Name,Email,Department,Date of Birth,Designation\nDr. John Smith,john.staff@example.com,Computer Science,1980-05-15,Professor\nDr. Jane Doe,jane.staff@example.com,Electronics,1985-08-20,Associate Professor";
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff_upload_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFile(null);
    setResult(null);
    // Reset file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Users</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload an Excel or CSV file to create multiple user accounts at once
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('students')}
              className={`${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Students
            </button>
            <button
              onClick={() => handleTabChange('staff')}
              className={`${
                activeTab === 'staff'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Staff
            </button>
          </nav>
        </div>
      </div>

      {/* Instructions */}
      <div className={`${activeTab === 'students' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-6 mb-6`}>
        <h2 className={`text-lg font-semibold ${activeTab === 'students' ? 'text-blue-900' : 'text-green-900'} mb-3`}>Instructions</h2>
        <ul className={`list-disc list-inside space-y-2 text-sm ${activeTab === 'students' ? 'text-blue-800' : 'text-green-800'}`}>
          <li>Upload an Excel file (.xlsx, .xls) or CSV file (.csv) with {activeTab} data</li>
          <li>Required column: <strong>Email</strong></li>
          {activeTab === 'students' ? (
            <>
              <li>Optional columns: <strong>Name</strong> (or First Name + Last Name), <strong>Department</strong>, <strong>Date of Birth</strong>, <strong>CGPA</strong></li>
              <li>Date of Birth format: YYYY-MM-DD or DD/MM/YYYY (will be used as password in DDMMYYYY format)</li>
            </>
          ) : (
            <>
              <li>Optional columns: <strong>Name</strong> (or First Name + Last Name), <strong>Department</strong>, <strong>Date of Birth</strong>, <strong>Designation</strong></li>
              <li>Date of Birth format: YYYY-MM-DD or DD/MM/YYYY (will be used as password in DDMMYYYY format)</li>
            </>
          )}
          <li>If Date of Birth is not provided, system will generate a secure random password</li>
          <li>System will automatically generate usernames from email addresses</li>
          <li>Duplicate emails will be skipped</li>
          <li>Download the template below for reference</li>
        </ul>
        <button
          onClick={downloadTemplate}
          className={`mt-4 px-4 py-2 ${activeTab === 'students' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg text-sm`}
        >
          Download Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel or CSV File
            </label>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full px-4 py-3 ${activeTab === 'students' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium`}
          >
            {loading ? 'Uploading...' : `Upload and Create ${activeTab === 'students' ? 'Students' : 'Staff'}`}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{result.summary.total_records}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Created</p>
                <p className="text-2xl font-bold text-green-900">{result.summary.created}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Skipped</p>
                <p className="text-2xl font-bold text-yellow-900">{result.summary.skipped}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Errors</p>
                <p className="text-2xl font-bold text-red-900">{result.summary.errors}</p>
              </div>
            </div>
          </div>

          {/* Created Users */}
          {((activeTab === 'students' && result.created_students) || (activeTab === 'staff' && result.created_staff)) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Created {activeTab === 'students' ? 'Students' : 'Staff Members'}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date of Birth</th>
                      {activeTab === 'students' ? (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CGPA</th>
                      ) : (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(activeTab === 'students' ? result.created_students : result.created_staff)?.map((user, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-mono">{user.password}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.date_of_birth || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activeTab === 'students' ? (user.cgpa || 'N/A') : (user.designation || 'N/A')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Save these passwords! They are shown only once. Users will need these credentials to log in.
                </p>
              </div>
            </div>
          )}

          {/* Errors */}
          {result.errors && result.errors.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Errors</h2>
              <div className="space-y-2">
                {result.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Row {error.row}:</strong> {error.error}
                      {error.email && ` (${error.email})`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BulkUpload;
