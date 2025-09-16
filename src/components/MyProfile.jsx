import React, { useState, useEffect } from "react";
import { Edit2, Save, X } from "lucide-react";
import axios from "axios";

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('employeeToken');
        const res = await axios.get('http://localhost:3001/employee/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('employeeToken');
      const res = await axios.put('http://localhost:3001/employee/profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#113a69]">My Profile</h2>
        {/* Top Section */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}`}
            alt="profile"
            className="w-20 h-20 rounded-full shadow-md border-2 border-[#113a69]"
          />
          <div>
            <h3 className="text-xl font-semibold">{profile.name}</h3>
            {/* <p className="text-gray-600">ID: {profile._id}</p> */}
            <p className="text-[#113a69] font-medium">{profile.role}</p>
            <p className="text-gray-500 text-sm">Joined on {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : ''}</p>
          </div>
        </div>
        {/* Editable Form / Details */}
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Full Name" name="name" value={form.name || ''} onChange={handleChange} />
                <InputField label="Email" name="email" value={form.email || ''} onChange={handleChange} type="email" />
                <InputField label="Mobile" name="mobile" value={form.mobile || ''} onChange={handleChange} />
                {/* <InputField label="Department" name="department" value={form.department.name || ''} onChange={handleChange} /> */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium">Address</label>
                  <textarea
                    name="address"
                    value={form.address || ''}
                    onChange={handleChange}
                    rows="2"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#113a69] text-white px-4 py-2 rounded-lg shadow hover:[#113a69] disabled:opacity-50"
                >
                  <Save size={18} /> {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600"
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Email" value={profile.email} />
              <Detail label="Mobile" value={profile.mobile} />
              <Detail label="Department" value={profile?.department?.name} />
              <Detail label="Role" value={profile.role} />
              <Detail label="Gender" value={profile.gender} />
              <Detail label="Status" value={profile.status} />
              <div className="col-span-2">
                <Detail label="Address" value={profile.address} />
              </div>
            </div>
          )}
        </div>
        {/* Edit Button */}
        {!isEditing && (
          <div className="mt-6">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-[#113a69] text-white px-4 py-2 rounded-lg shadow hover:bg-[#1b5393]"
            >
              <Edit2 size={18} /> Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 w-full border rounded-lg px-3 py-2"
    />
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default MyProfile;
