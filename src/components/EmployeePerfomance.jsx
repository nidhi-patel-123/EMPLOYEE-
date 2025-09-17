import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

const tabs = [
  { id: 'performance', label: 'Performance', icon: ChartBarIcon },
  { id: 'attendance', label: 'Attendance', icon: CalendarIcon },
  { id: 'leaves', label: 'Leaves', icon: ClipboardDocumentCheckIcon },
  { id: 'projects', label: 'Projects', icon: BriefcaseIcon },
  { id: 'payrolls', label: 'Payrolls', icon: CurrencyRupeeIcon },
];

const API_ENDPOINTS = {
  profile: '/employee/profile',
  performance: '/employee/performance',
  attendance: '/employee/attendance',
  leaves: '/employee/leaves',
  projects: '/employee/projects',
  payrolls: '/employee/payrolls',
};

function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('performance');
  const [profile, setProfile] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    const token = sessionStorage.getItem('employeeToken');
    if (!token) {
      setError('Authentication token missing. Please log in.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://backend-6bli.onrender.com';

      const responses = await Promise.all(
        Object.values(API_ENDPOINTS).map((endpoint) =>
          axios.get(`${baseUrl}${endpoint}`, { headers })
        )
      );

      setProfile(responses[0].data);
      setPerformanceData(responses[1].data);
      setAttendanceData(responses[2].data);
      setLeaveData(responses[3].data);
      setProjectData(responses[4].data);
      setPayrollData(responses[5].data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      const endpoint = err.config?.url || 'unknown endpoint';
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Unknown error';
      setError(
        status === 401
          ? `Unauthorized: Invalid or expired token for ${endpoint}. Please log in again.`
          : `Failed to load data from ${endpoint}: ${message}`
      );
      if (status === 401) {
        sessionStorage.removeItem('employeeToken');
        navigate('/login');
      }
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    sessionStorage.removeItem('employeeToken');
    navigate('/login');
  };

  const handleRetry = () => {
    fetchData();
  };

  const totalRecords = performanceData.length;
  const avgPerformance = totalRecords > 0
    ? Math.round(performanceData.reduce((sum, record) => sum + (record.performance || 0), 0) / totalRecords)
    : 0;
  const totalTasksCompleted = totalRecords > 0
    ? performanceData.reduce((sum, record) => sum + (record.tasksCompleted || 0), 0)
    : 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'performance':
        return (
          <section className="bg-white shadow-xl rounded-2xl p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 tracking-wide">Performance History</h2>
            {performanceData.length === 0 ? (
              <p className="text-gray-500 italic">No performance records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
                      <th className="p-4 border-b font-semibold">Performance (%)</th>
                      <th className="p-4 border-b font-semibold">Tasks Completed</th>
                      <th className="p-4 border-b font-semibold">Achievements</th>
                      <th className="p-4 border-b font-semibold">Date Recorded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 border-b">
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <ChartBarIcon className="h-5 w-5" />
                            <span>{record.performance || 0}%</span>
                          </div>
                        </td>
                        <td className="p-4 border-b text-gray-700">{record.tasksCompleted || 0}</td>
                        <td className="p-4 border-b text-gray-600 italic">{record.achievements || 'None'}</td>
                        <td className="p-4 border-b text-gray-700">
                          {new Date(record.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      case 'attendance':
        return (
          <section className="bg-white shadow-xl rounded-2xl p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 tracking-wide">Attendance History</h2>
            {attendanceData.length === 0 ? (
              <p className="text-gray-500 italic">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
                      <th className="p-4 border-b font-semibold">Date</th>
                      <th className="p-4 border-b font-semibold">Check-In</th>
                      <th className="p-4 border-b font-semibold">Check-Out</th>
                      <th className="p-4 border-b font-semibold">Working Minutes</th>
                      <th className="p-4 border-b font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 border-b text-gray-700">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-4 border-b text-gray-700">
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </td>
                        <td className="p-4 border-b text-gray-700">
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </td>
                        <td className="p-4 border-b text-gray-700">{record.workingMinutes || 'N/A'}</td>
                        <td className="p-4 border-b text-gray-700 capitalize">{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      case 'leaves':
        return (
          <section className="bg-white shadow-xl rounded-2xl p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
  <h2 className="text-2xl font-bold text-[#113a69] mb-6 tracking-wide">Leave History</h2>
  {leaveData.length === 0 ? (
    <p className="text-gray-500 italic">No leave records found.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
            <th className="p-4 border-b font-semibold">Type</th>
            <th className="p-4 border-b font-semibold">From</th>
            <th className="p-4 border-b font-semibold">To</th>
            <th className="p-4 border-b font-semibold">Status</th>
            {/* <th className="p-4 border-b font-semibold">Reason</th> */}
          </tr>
        </thead>
        <tbody>
          {leaveData.map((leave) => (
            <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 border-b text-gray-700 capitalize">{leave.type}</td>
              <td className="p-4 border-b text-gray-700">
                {new Date(leave.from).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="p-4 border-b text-gray-700">
                {new Date(leave.to).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="p-4 border-b text-gray-700 capitalize">{leave.status}</td>
              {/* <td className="p-4 border-b text-gray-600 italic">
                {leave.reason?.trim() || 'No reason provided'}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>
        );
      case 'projects':
        return (
          <section className="bg-white shadow-xl rounded-2xl p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 tracking-wide">Projects</h2>
            {projectData.length === 0 ? (
              <p className="text-gray-500 italic">No projects assigned.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
                      <th className="p-4 border-b font-semibold">Project Name</th>
                      <th className="p-4 border-b font-semibold">Description</th>
                      <th className="p-4 border-b font-semibold">Start Date</th>
                      <th className="p-4 border-b font-semibold">End Date</th>
                      <th className="p-4 border-b font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectData.map((project) => (
                      <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 border-b text-gray-700">{project.name}</td>
                        <td className="p-4 border-b text-gray-600 italic">{project.description || 'N/A'}</td>
                        <td className="p-4 border-b text-gray-700">
                          {new Date(project.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-4 border-b text-gray-700">
                          {project.endDate
                            ? new Date(project.endDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Ongoing'}
                        </td>
                        <td className="p-4 border-b text-gray-700 capitalize">{project.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      case 'payrolls':
        return (
         <section className="bg-white shadow-xl rounded-2xl p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
  <h2 className="text-2xl font-bold text-blue-900 mb-6 tracking-wide">Payroll History</h2>
  {payrollData.length === 0 ? (
    <p className="text-gray-500 italic">No payroll records found.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
            <th className="p-4 border-b font-semibold">Month</th>
            <th className="p-4 border-b font-semibold">Basic Salary</th>
            <th className="p-4 border-b font-semibold">Allowances</th>
            <th className="p-4 border-b font-semibold">Deductions</th>
            <th className="p-4 border-b font-semibold">Net Salary</th>
          </tr>
        </thead>
        <tbody>
          {payrollData.map((payroll) => {
            // Calculate total allowances
            const totalAllowances = typeof payroll.allowances === 'object' && payroll.allowances !== null
              ? Object.values(payroll.allowances).reduce((sum, value) => sum + (Number(value) || 0), 0)
              : Number(payroll.allowances) || 0;

            // Calculate total deductions
            const totalDeductions = typeof payroll.deductions === 'object' && payroll.deductions !== null
              ? Object.values(payroll.deductions).reduce((sum, value) => sum + (Number(value) || 0), 0)
              : Number(payroll.deductions) || 0;

            return (
              <tr key={payroll._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border-b text-gray-700">{payroll.month}</td>
                <td className="p-4 border-b text-gray-700">₹{Number(payroll.basicSalary || 0).toLocaleString()}</td>
                <td className="p-4 border-b text-gray-700">₹{totalAllowances.toLocaleString()}</td>
                <td className="p-4 border-b text-gray-700">₹{totalDeductions.toLocaleString()}</td>
                <td className="p-4 border-b text-gray-700 font-semibold">
                  ₹{Number(payroll.netSalary || 0).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen font-sans">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 tracking-tight">
            {profile ? `${profile.name}'s Performance` : 'Employee Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg">
            Manage your profile, track performance, and view work details seamlessly.
          </p>
        </div>
        {/* <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          Logout
        </button> */}
      </header>

      {error && (
        <div className="mb-6 text-center">
          <p className="text-red-600 font-medium bg-red-50 py-3 px-4 rounded-lg">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Role</p>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{profile?.role || 'N/A'}</h2>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <ChartBarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Average Performance</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{avgPerformance}%</h2>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <ClipboardDocumentCheckIcon className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tasks Completed</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{totalTasksCompleted}</h2>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <nav className="flex flex-wrap gap-2 sm:gap-4 border-b-2 border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 text-sm font-semibold capitalize transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-600 text-lg animate-pulse">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
          </svg>
          <p className="mt-2">Loading...</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}

export default EmployeeDashboard;