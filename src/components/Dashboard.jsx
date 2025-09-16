import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper function to format date as dd/mm/yyyy
function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d)) return "--";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function Dashboard() {
  const [leaves, setLeaves] = useState([]);
  const [projects, setProjects] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [salaryStatus, setSalaryStatus] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem('employeeToken');
    const headers = { Authorization: `Bearer ${token}` };
    // Fetch attendance
    axios.get('http://localhost:3001/employee/attendance', { headers })
      .then(res => {
        setAttendance(res.data.length ? Math.round((res.data.filter(a => a.checkIn && a.checkOut).length / res.data.length) * 100) : 0);
      })
      .catch(() => setAttendance(null));
    // Fetch leaves
    axios.get('http://localhost:3001/employee/leaves', { headers })
      .then(res => setLeaves(res.data))
      .catch(() => setLeaves([]));
    // Fetch projects
    axios.get('http://localhost:3001/employee/projects', { headers })
      .then(res => setProjects(res.data))
      .catch(() => setProjects([]));
    // Fetch payrolls
    axios.get('http://localhost:3001/employee/payrolls', { headers })
      .then(res => setSalaryStatus(res.data.length && res.data[0].status ? res.data[0].status : "--"))
      .catch(() => setSalaryStatus("--"));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1">
        {/* Dashboard Cards */}
        <section className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="My Attendance" value={`${attendance ?? "--"}%`} />
          <Card title="Leaves Taken" value={leaves.length} />
          <Card title="Projects Assigned" value={projects.length} />
          {/* <Card
            title="Salary Status"
            value={salaryStatus || "--"}
            valueClass="text-green-600"
          /> */}
        </section>

        {/* Recent Leaves */}
        <section className="p-6">
          <Table
            title="My Leaves"
            headers={["Date", "Type", "Status"]}
            data={leaves.map((leave) => [
              formatDate(leave.from),
              leave.type,
              <StatusBadge
                key={leave._id}
                label={leave.status}
                type={leave.status === "Approved" ? "success" : "warning"}
              />,
            ])}
          />
        </section>

        {/* Assigned Projects */}
        <section className="p-6">
          <Table
            title="My Projects"
            headers={["Project", "Deadline", "Status"]}
            data={projects.map((proj) => [
              proj.name,
              formatDate(proj.deadline),
              <StatusBadge
                key={proj._id}
                label={proj.status}
                type={proj.status === "In Progress" ? "info" : "neutral"}
              />,
            ])}
          />
        </section>
      </main>
    </div>
  );
}

function Card({ title, value, valueClass = "" }) {
  return (
    <div className="bg-white shadow rounded-xl p-10">
      <h3 className="text-gray-500">{title}</h3>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function Table({ title, headers, data }) {
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            {headers.map((head, i) => (
              <th key={i} className="p-3">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="p-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ label, type }) {
  const styles = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-2 py-1 text-sm rounded-full ${styles[type] || ""}`}>
      {label}
    </span>
  );
}
