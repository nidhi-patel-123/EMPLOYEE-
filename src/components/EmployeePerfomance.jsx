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
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  const avgPerformance =
    totalRecords > 0
      ? Math.round(
        performanceData.reduce((sum, record) => sum + (record.performance || 0), 0) / totalRecords
      )
      : 0;
  const totalTasksCompleted =
    totalRecords > 0
      ? performanceData.reduce((sum, record) => sum + (record.tasksCompleted || 0), 0)
      : 0;

  const renderPerformanceChart = (record) => {
    const chartData = {
      labels: ['Attendance', 'Leave', 'Tasks'],
      datasets: [
        {
          label: 'Scores',
          data: [record.attendanceScore || 0, record.leaveScore || 0, record.taskScore || 0],
          backgroundColor: ['#113a69', '#4473ACFF', '#7EAAE4FF'],
          borderColor: ['#388E3C', '#1976D2', '#FFA000'],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: 'Score (%)', font: { size: 12 } },
          ticks: { stepSize: 20, font: { size: 10 } },
        },
        x: {
          title: { display: true, text: 'Metrics', font: { size: 12 } },
          ticks: { font: { size: 10 } },
        },
      },
      plugins: {
        legend: { position: 'top', labels: { font: { size: 10 } } },
        title: {
          display: true,
          text: `Performance for ${record.month} ${record.year}`,
          font: { size: 14 },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              const metric = context.label;
              return `${label}: ${value.toFixed(2)}% (${metric})`;
            },
          },
        },
      },
    };

    return (
      <div className="h-48 sm:h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  };

  const getPerformanceCategory = (performance) => {
    if (performance >= 0 && performance <= 30)
      return { label: 'Bad', color: 'bg-red-100 text-red-700' };
    if (performance > 30 && performance <= 60)
      return { label: 'Good', color: 'bg-yellow-100 text-yellow-700' };
    if (performance > 60 && performance <= 90)
      return { label: 'Perfect', color: 'bg-green-100 text-green-700' };
    if (performance > 90 && performance <= 100)
      return { label: 'Excellent', color: 'bg-blue-100 text-blue-700' };
    return { label: 'N/A', color: 'bg-gray-100 text-gray-700' };
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'performance':
        return (
          <section className="bg-white shadow-lg rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-[#113a69] mb-4 sm:mb-6 tracking-wide">Performance History</h2>
            {performanceData.length === 0 ? (
              <p className="text-gray-500 italic text-sm sm:text-base">No performance records found.</p>
            ) : (
              <div className="space-y-6">
                {performanceData.map((record) => {
                  const { label, color } = getPerformanceCategory(record.performance);
                  return (
                    <div key={record._id} className="border-b pb-4 last:border-b-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Period</p>
                          <p className="text-base sm:text-lg font-semibold text-gray-900">{record.month} {record.year}</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mt-2">Performance</p>
                          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm sm:text-base">
                            <ChartBarIcon className="h-5 w-5" />
                            <span>{record.performance.toFixed(2)}% <span className={`inline-block px-2 py-1 rounded-full text-xs ${color}`}>{label}</span></span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mt-2">Metrics</p>
                          <p className="text-sm sm:text-base text-gray-700">Attendance: {record.attendanceScore.toFixed(2)}% ({record.presentDays} days)</p>
                          <p className="text-sm sm:text-base text-gray-700">Leave: {record.leaveScore.toFixed(2)}% ({record.leaveDays} days)</p>
                          <p className="text-sm sm:text-base text-gray-700">Tasks: {record.taskScore.toFixed(2)}% ({record.tasksCompleted}/{record.totalTasks})</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mt-2">Achievements</p>
                          <p className="text-sm sm:text-base text-gray-600 italic">{record.achievements || 'None'}</p>
                        </div>
                        <div>
                          {renderPerformanceChart(record)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      case 'attendance':
        return (
          <section className="bg-white shadow-lg rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-[#113a69] mb-4 sm:mb-6 tracking-wide">Attendance History</h2>
            {attendanceData.length === 0 ? (
              <p className="text-gray-500 italic text-sm sm:text-base">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 uppercase text-xs sm:text-sm tracking-wide">
                      <th className="p-3 sm:p-4 border-b font-semibold">Date</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">Check-In</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">Check-Out</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">Working Minutes</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            : 'N/A'}
                        </td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            : 'N/A'}
                        </td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">{record.workingMinutes || 'N/A'}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 capitalize text-sm sm:text-base">{record.status}</td>
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
          <section className="bg-white shadow-lg rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-[#113a69] mb-4 sm:mb-6 tracking-wide">Leave History</h2>
            {leaveData.length === 0 ? (
              <p className="text-gray-500 italic text-sm sm:text-base">No leave records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 uppercase text-xs sm:text-sm tracking-wide">
                      <th className="p-3 sm:p-4 border-b font-semibold">Type</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">From</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">To</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveData.map((leave) => (
                      <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 sm:p-4 border-b text-gray-700 capitalize text-sm sm:text-base">{leave.type}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">
                          {new Date(leave.from).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">
                          {new Date(leave.to).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 capitalize text-sm sm:text-base">{leave.status}</td>
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
          <section className="bg-white shadow-lg rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-[#113a69] mb-4 sm:mb-6 tracking-wide">Projects</h2>
            {projectData.length === 0 ? (
              <p className="text-gray-500 italic text-sm sm:text-base">No projects assigned.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {projectData.map((project) => (
                  <div key={project._id} className="border border-gray-200 p-4 rounded-md hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900">{project.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">{project.description}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Status: <span className="capitalize">{project.status}</span></p>
                    <p className="text-xs sm:text-sm text-gray-500">Progress: {project.progress}%</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      case 'payrolls':
        return (
          <section className="bg-white shadow-lg rounded-xl p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-[#113a69] mb-4 sm:mb-6 tracking-wide">Payroll History</h2>
            {payrollData.length === 0 ? (
              <p className="text-gray-500 italic text-sm sm:text-base">No payroll records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 uppercase text-xs sm:text-sm tracking-wide">
                      <th className="p-3 sm:p-4 border-b font-semibold">Month</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">Year</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">Basic Salary</th>
                      <th className="p-3 sm:p-4 border-b font-semibold">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((payroll) => (
                      <tr key={payroll._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">{payroll.month}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">{payroll.year}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">₹{payroll.basicSalary.toLocaleString()}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">₹{payroll.netSalary.toLocaleString()}</td>
                      </tr>
                    ))}
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
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-[#113a69] text-white p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <UserIcon className="h-8 w-8 sm:h-10 sm:w-10" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">
              {profile ? `${profile.name}'s Performance` : 'Employee Dashboard'}
            </h1>
            <p className="text-sm sm:text-base">{profile ? profile.email : 'Loading...'}</p>
          </div>
        </div>
        {/* <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-semibold transition"
          aria-label="Logout"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          Logout
        </button> */}
      </header>

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-100 text-red-700 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <p className="text-sm sm:text-base">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm sm:text-base transition"
              aria-label="Retry loading data"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
            <ChartBarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-[#113a69]" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Average Performance</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{avgPerformance}%</h2>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
            <ClipboardDocumentCheckIcon className="h-8 w-8 sm:h-12 sm:w-12 text-[#113a69]" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tasks Completed</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{totalTasksCompleted}</h2>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
            <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-[#113a69]" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Performance Records</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{totalRecords}</h2>
            </div>
          </div>
        </div>

        <nav className="mb-4 sm:mb-6" role="tablist">
          <ul className="flex flex-wrap gap-2 sm:gap-4">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-semibold transition ${activeTab === tab.id
                      ? 'bg-[#113a69] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'
                    }`}
                  disabled={loading}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={activeTab}>
          {loading ? (
            <p className="text-center py-6 text-gray-500 text-sm sm:text-base">Loading...</p>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;