import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Eye and EyeOff SVGs for show/hide password
const EyeIcon = ({ className = "" }) => (
  <svg
    className={className}
    width="22"
    height="22"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3.5" strokeWidth="1.5" />
  </svg>
);

const EyeOffIcon = ({ className = "" }) => (
  <svg
    className={className}
    width="22"
    height="22"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      d="M3 3l18 18M10.7 10.7a3.5 3.5 0 004.6 4.6M6.53 6.53C4.21 8.36 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.61 0 3.09-.32 4.41-.89M17.47 17.47C19.79 15.64 21.5 12 21.5 12s-3.5-6.5-9.5-6.5c-1.61 0-3.09.32-4.41.89"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Setting() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    department: "",
    role: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('employeeToken');
      const { data } = await axios.get("http://localhost:3001/employee/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData((prev) => ({ ...prev, ...data }));
    } catch (err) {
      // ignore
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('employeeToken');
      await axios.put("http://localhost:3001/employee/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert("Please fill all password fields");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords does not match");
      return;
    }
    setLoading(true);
    try {
      // You need to implement this endpoint in backend for employee password change
      const token = sessionStorage.getItem('employeeToken');
      await axios.put("http://localhost:3001/employee/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Password changed successfully!");
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      alert("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('employeeToken');
    navigate('/login');
  };

  const tabs = ["Profile", "Security"];

  // Helper for toggling password visibility
  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-t-lg font-medium transition-all ${activeTab === tab
              ? "bg-white shadow text-[#113a69] border border-b-0 border-gray-200"
              : "text-gray-600 hover:text-[#113a69]"
              }`}
          >
            {tab}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="ml-auto px-6 py-2 rounded-t-lg font-medium bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      {/* Tab Content */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        {/* PROFILE */}
        {activeTab === "Profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <InputField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
            <InputField label="Department" name="department" value={formData.department.name} onChange={handleChange} disabled={true} />
            <InputField label="Role" name="role" value={formData.role} onChange={handleChange} disabled={true} />
            <div className="col-span-2">
              <label className="block text-sm font-medium">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#113a69] text-white px-6 py-2 rounded-lg shadow hover:bg-[#1b5393]"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        )}
        {/* SECURITY */}
        {activeTab === "Security" && (
          <div className="max-w-md space-y-5">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              show={showPassword.currentPassword}
              onToggle={() => toggleShowPassword("currentPassword")}
              disabled={loading}
            />
            <PasswordField
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              show={showPassword.newPassword}
              onToggle={() => toggleShowPassword("newPassword")}
              disabled={loading}
            />
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              show={showPassword.confirmPassword}
              onToggle={() => toggleShowPassword("confirmPassword")}
              disabled={loading}
            />
            <div className="flex justify-end">
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const InputField = ({ label, name, type = "text", value, onChange, disabled }) => (
  <div>
    <label className="block mb-2 font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
      disabled={disabled}
    />
  </div>
);

// PasswordField component with show/hide toggle and improved UI
const PasswordField = ({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  disabled,
}) => (
  <div className="relative">
    <label className="block mb-2 font-medium">{label}</label>
    <div className="relative flex items-center">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 pr-12"
        disabled={disabled}
        autoComplete="new-password"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggle}
        className="absolute right-3 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
        style={{ top: "50%", transform: "translateY(-50%)" }}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <EyeOffIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <EyeIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
    </div>
  </div>
);
