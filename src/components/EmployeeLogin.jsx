import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EmployeeLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/employee/login', form);
      sessionStorage.setItem('employeeToken', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-lg rounded-2xl overflow-hidden">

        {/* Left vector illustration */}
        <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center p- h-full">
          <img
            src="https://img.freepik.com/premium-vector/character-using-cyber-security-services-protect-private-personal-data-user-account-password_773844-395.jpg?uid=R195395238&ga=GA1.1.1975205788.1747372593&semt=ais_hybrid&w=740&q=80"
            alt="Login Illustration"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right login form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <div className="mb-6 text-sm text-blue-600 flex items-center gap-2">

            Employee Dashboard Login
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login to Employee Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>


  );
}

export default EmployeeLogin;
