import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Attendance() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = sessionStorage.getItem("employeeToken");
        const res = await axios.get(
          "http://localhost:3001/employee/attendance",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAttendanceRecords(res.data);
        const today = new Date().toISOString().slice(0, 10);
        const todayRecord = res.data.find((a) => a.date === today);
        setCheckIn(todayRecord?.checkIn ? new Date(todayRecord.checkIn) : null);
        setCheckOut(
          todayRecord?.checkOut ? new Date(todayRecord.checkOut) : null
        );
      } catch (err) {
        console.error(err);
        setAttendanceRecords([]);
        setCheckIn(null);
        setCheckOut(null);
        setError("Failed to fetch attendance records");
      }
    };
    fetchAttendance();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("employeeToken");
      if (!checkIn) {
        // Check-in
        const res = await axios.post(
          "http://localhost:3001/employee/attendance/checkin",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCheckIn(new Date(res.data.checkIn));
        setAttendanceRecords((prev) => [
          res.data,
          ...prev.filter((record) => record.date !== res.data.date),
        ]);
      } else if (!checkOut) {
        // Check-out
        const res = await axios.post(
          "http://localhost:3001/employee/attendance/checkout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCheckOut(new Date(res.data.checkOut));
        setAttendanceRecords((prev) => [
          res.data,
          ...prev.filter((record) => record.date !== res.data.date),
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingHours = (start, end) => {
    if (!start || !end) return "—";
    const diffMs = new Date(end) - new Date(start);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatus = (record) => {
    if (!record.checkIn) return "Absent";
    if (record.checkIn && !record.checkOut) return "Working";
    return "Completed";
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-[#113a69] mb-8 text-center">
          My Attendance
        </h2>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Today's Attendance */}
        <div className="mb-12 bg-gray-50 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-[#113a69] mb-4">
              Today's Attendance
            </h3>
            {/* Toggle Switch */}
            <div className="flex justify-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkIn && !checkOut}
                  onChange={handleToggle}
                  disabled={!!checkOut || loading}
                  className="sr-only peer"
                />
                <div
                  className={`w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-[#113a69] transition-all duration-300 ${loading || !!checkOut ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transform transition-all duration-300 ${checkIn && !checkOut ? "translate-x-7" : ""
                      }`}
                  ></div>
                </div>
                <span className="ml-3 text-sm font-medium text-[#113a69]">
                  {loading
                    ? "Processing..."
                    : checkIn && !checkOut
                      ? "Working"
                      : "Check In"}
                </span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Check In</p>
              <p className="text-lg text-[#113a69]">
                {checkIn ? new Date(checkIn).toLocaleTimeString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Check Out</p>
              <p className="text-lg text-[#113a69]">
                {checkOut ? new Date(checkOut).toLocaleTimeString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Working Hours</p>
              <p className="text-lg text-[#113a69]">
                {calculateWorkingHours(checkIn, checkOut)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatus({ checkIn, checkOut }) === "Completed"
                  ? "bg-green-100 text-green-700"
                  : getStatus({ checkIn, checkOut }) === "Working"
                    ? "bg-blue-100 text-[#113a69]"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {getStatus({ checkIn, checkOut })}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Attendance History
          </h3>
          {attendanceRecords.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-[#113a69]">
                      Date
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-[#113a69]">
                      Check In
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-[#113a69]">
                      Check Out
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-[#113a69]">
                      Working Hours
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-[#113a69]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {(() => {
                          const d = new Date(record.date);
                          const day = String(d.getDate()).padStart(2, '0');
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const year = d.getFullYear();
                          return `${day}/${month}/${year}`;
                        })()}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString()
                          : "—"}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString()
                          : "—"}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {record.workingMinutes > 0
                          ? `${Math.floor(record.workingMinutes / 60)}h ${record.workingMinutes % 60
                          }m`
                          : "—"}
                      </td>
                      <td className="py-3 px-6 border-b">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${record.status === "present"
                            ? "bg-green-100 text-green-700"
                            : record.status === "working"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#113a69] text-center">
              No attendance records found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
