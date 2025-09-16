import React, { useState, useEffect } from "react";
import axios from "axios";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaid, setShowPaid] = useState(true); // Toggle for paid/unpaid

  // Month mapping for display and search
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchPayrolls();
    // eslint-disable-next-line
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('employeeToken');
      const { data } = await axios.get("http://localhost:3001/employee/payrolls", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Map API response to match table keys
      const formattedData = data.map(p => ({
        ...p,
        monthName: monthNames[p.month - 1], // Convert numeric month to name
        basic: p.basicSalary,
        allowance: p.totalAllowances,
        deduction: p.totalDeductions,
        net: p.netSalary,
        status: p.paymentStatus.charAt(0).toUpperCase() + p.paymentStatus.slice(1),
      }));
      setPayrolls(formattedData);
    } catch (err) {
      setPayrolls([]);
      setError('Failed to fetch payroll records');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayrolls = payrolls.filter((p) =>
    p.monthName.toLowerCase().includes(search.toLowerCase()) &&
    (showPaid ? p.paymentStatus === "paid" : p.paymentStatus !== "paid")
  );

  return (
    <div className="bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-[#113a69] mb-8 text-center">
          My Salary
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

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by month (e.g., January)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full sm:w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#113a69]"
          />
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showPaid}
              onChange={() => setShowPaid(!showPaid)}
              className="sr-only peer"
            />
            <div
              className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-[#113a69] transition-all duration-300"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transform transition-all duration-300 ${showPaid ? "translate-x-7" : ""
                  }`}
              ></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {showPaid ? "Showing Paid" : "Showing Unpaid"}
            </span>
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow-sm">
          {loading ? (
            <p className="text-center py-6 text-gray-500">Loading...</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                    SNo
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                    Month
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                    Basic
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                    Allowance
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                    Deduction
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                    Net Salary
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.length > 0 ? (
                  filteredPayrolls.map((p, index) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 border-b text-gray-800">{index + 1}</td>
                      <td className="py-3 px-6 border-b text-gray-800 font-medium">
                        {p.monthName} {p.year}
                      </td>
                      <td className="py-3 px-6 border-b text-gray-800">
                        ₹{p.basic.toLocaleString()}
                      </td>
                      <td className="py-3 px-6 border-b text-gray-800">
                        ₹{p.allowance.toLocaleString()}
                      </td>
                      <td className="py-3 px-6 border-b text-red-600">
                        ₹{p.deduction.toLocaleString()}
                      </td>
                      <td className="py-3 px-6 border-b text-[#113a69] font-semibold">
                        ₹{p.net.toLocaleString()}
                      </td>
                      <td className="py-3 px-6 border-b">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${p.status === "Paid"
                            ? "bg-[#113a69] text-[#ffffff]"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      No payroll records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payroll;