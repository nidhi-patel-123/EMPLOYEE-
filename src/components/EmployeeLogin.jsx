import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UsersIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function EmployeeLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('https://backend-6bli.onrender.com/employee/login', form);
      sessionStorage.setItem('employeeToken', res.data.token);
      toast.success('Login Successful!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
        style: { backgroundColor: '#113A69', color: '#FFFFFF' }, // Blue background for success
      });
      setTimeout(() => navigate('/'), 1000); // Navigate after toast
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
        style: { backgroundColor: '#EF4444', color: '#FFFFFF' }, // Red background for error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Left vector illustration */}
        <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center h-full">
          <img
            src="https://img.freepik.com/premium-vector/character-using-cyber-security-services-protect-private-personal-data-user-account-password_773844-395.jpg?uid=R195395238&ga=GA1.1.1975205788.1747372593&semt=ais_hybrid&w=740&q=80"
            alt="Login Illustration"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right login form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-6">
            <UsersIcon className="w-6 h-6 text-[#113a69]" />
            <h2 className="text-lg font-semibold text-gray-800">
              Employee Dashboard Login
            </h2>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">WELCOME BACK</h2>
          <p className="text-gray-500 mb-6">Access your Employee dashboard</p>

          {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] transition"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] transition pr-12"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#113a69] focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 bg-[#113a69] text-white py-3 rounded-lg font-semibold hover:bg-[#1b5393] transition disabled:bg-blue-400"
            >
              {loading ? (
                <span>
                  <svg className="animate-spin h-5 w-5 mr-2 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span>Login to Employee Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default EmployeeLogin;