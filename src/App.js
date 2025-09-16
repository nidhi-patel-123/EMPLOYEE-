import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LeaveAdd from "./components/LeaveAdd";
import Projects from "./components/Projects";
import Setting from "./components/Setting";
import PayrollList from "./components/PayrollList";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MyProfile from "./components/MyProfile";
import Attendance from "./components/Attendance";
import EmployeeLogin from "./components/EmployeeLogin";

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('employeeToken');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<EmployeeLogin />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Header />
                  <div className="flex-1 p-6 bg-gray-100">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/my-profile" element={<MyProfile />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/leave" element={<LeaveAdd />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/payroll" element={<PayrollList />} />
                      <Route path="/settings" element={<Setting />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


