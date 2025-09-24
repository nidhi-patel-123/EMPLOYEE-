import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Attendance() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [breakStart, setBreakStart] = useState(null);
  const [breakEnd, setBreakEnd] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch attendance records on component mount
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = sessionStorage.getItem("employeeToken");
        if (!token) throw new Error("No authentication token found");

        const res = await axios.get("https://backend-6bli.onrender.com/employee/attendance", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAttendanceRecords(res.data || []);
        const today = new Date().toISOString().slice(0, 10);
        const todayRecord = res.data.find((a) => a.date === today);

        setCheckIn(todayRecord?.checkIn ? new Date(todayRecord.checkIn) : null);
        setCheckOut(todayRecord?.checkOut ? new Date(todayRecord.checkOut) : null);
        setBreakStart(todayRecord?.breakStart ? new Date(todayRecord.breakStart) : null);
        setBreakEnd(todayRecord?.breakEnd ? new Date(todayRecord.breakEnd) : null);
      } catch (err) {
        console.error("Fetch error:", err);
        setAttendanceRecords([]);
        setError(err.message || "Failed to fetch attendance records");
      }
    };
    fetchAttendance();
  }, []);

  // Handle Check In/Out toggle
  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("employeeToken");
      if (!token) throw new Error("No authentication token found");

      if (!checkIn) {
        // Check-in
        const res = await axios.post(
          "https://backend-6bli.onrender.com/employee/attendance/checkin",
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
          "https://backend-6bli.onrender.com/employee/attendance/checkout",
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
      setError(err.response?.data?.message || "Check-in/out action failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Break Start/End toggle
  const handleBreakToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("employeeToken");
      if (!token) throw new Error("No authentication token found");

      const onBreak = breakStart && !breakEnd;
      let res;
      if (!onBreak) {
        // Start break
        res = await axios.post(
          "https://backend-6bli.onrender.com/employee/attendance/breakin",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBreakStart(new Date(res.data.breakStart));
      } else {
        // End break
        res = await axios.post(
          "https://backend-6bli.onrender.com/employee/attendance/breakout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBreakEnd(new Date(res.data.breakEnd));
      }
      setAttendanceRecords((prev) => [
        res.data,
        ...prev.filter((record) => record.date !== res.data.date),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Break action failed");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total working hours (checkOut - checkIn, excluding breaks)
  const calculateTotalHours = (checkIn, checkOut, breakStart, breakEnd) => {
    if (!checkIn || !checkOut) return "00:00";

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    let totalMs = end - start;

    // Subtract break time if both breakStart and breakEnd exist
    if (breakStart && breakEnd) {
      const breakStartTime = new Date(breakStart);
      const breakEndTime = new Date(breakEnd);
      const breakDurationMs = breakEndTime - breakStartTime;
      if (breakDurationMs > 0) {
        totalMs -= breakDurationMs;
      }
    }

    if (totalMs <= 0) return "00:00";

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time to HH:MM:SS
  const formatTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-8xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-[#113a69] mb-8 text-center">
          Attendance
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

        {/* New Entry Section */}
        <div className="mb-12 bg-gray-50 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-[#113a69] mb-6">New Entry</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {/* Clock In */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Clock In*</p>
              <button
                onClick={handleToggle}
                disabled={!!checkIn}
                className={`px-4 py-2 rounded-md text-white font-medium ${checkIn
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                Set Current Time
              </button>
              <p className="mt-2 text-lg font-semibold text-[#113a69]">
                {formatTime(checkIn)}
              </p>
            </div>

            {/* Break In */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Break In*</p>
              <button
                onClick={handleBreakToggle}
                disabled={!checkIn || !!breakStart}
                className={`px-4 py-2 rounded-md text-white font-medium ${!checkIn || !!breakStart
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                Set Current Time
              </button>
              <p className="mt-2 text-lg font-semibold text-[#113a69]">
                {formatTime(breakStart)}
              </p>
            </div>

            {/* Break Out */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Break Out*</p>
              <button
                onClick={handleBreakToggle}
                disabled={!breakStart || !!breakEnd}
                className={`px-4 py-2 rounded-md text-white font-medium ${!breakStart || !!breakEnd
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                Set Current Time
              </button>
              <p className="mt-2 text-lg font-semibold text-[#113a69]">
                {formatTime(breakEnd)}
              </p>
            </div>

            {/* Clock Out */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Clock Out*</p>
              <button
                onClick={handleToggle}
                disabled={!checkIn || !!checkOut} // ✅ Break not required
                className={`px-4 py-2 rounded-md text-white font-medium ${!checkIn || !!checkOut
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                Set Current Time
              </button>
              <p className="mt-2 text-lg font-semibold text-[#113a69]">
                {formatTime(checkOut)}
              </p>
            </div>
          </div>

          {/* Total Hours */}
          <div className="mt-8 text-center">
            <span className="text-lg font-semibold text-gray-700 mr-2">
              Total Hours:
            </span>
            <span className="px-4 py-2 bg-gray-100 rounded-md text-[#113a69] font-medium">
              {calculateTotalHours(checkIn, checkOut, breakStart, breakEnd)}
            </span>
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
                      Break Start
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-[#113a69]">
                      Break End
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-[#113a69]">
                      Total Hours
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
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {formatTime(record.checkIn)}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {formatTime(record.checkOut)}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {formatTime(record.breakStart)}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {formatTime(record.breakEnd)}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69]">
                        {calculateTotalHours(
                          record.checkIn,
                          record.checkOut,
                          record.breakStart,
                          record.breakEnd
                        )}
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
