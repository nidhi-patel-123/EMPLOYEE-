import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import {
  HomeIcon,
  // UserGroupIcon,
  CalendarIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [openEmployees, setOpenEmployees] = useState(false);
  const location = useLocation(); // 👈 current route ka path milega

  const menu = [
    { name: "Dashboard", icon: <HomeIcon className="h-6 w-6" />, path: "/" },
    { name: "My-profile", icon: <CgProfile className="h-6 w-6" />, path: "/my-profile" },
    { name: "Add-Attendance", icon: <ClipboardDocumentListIcon className="h-6 w-6" />, path: "/attendance" },
    { name: "Add-Leave", icon: <CalendarIcon className="h-6 w-6" />, path: "/leave" },
    { name: "Projects", icon: <BriefcaseIcon className="h-6 w-6" />, path: "/projects" },
    { name: "PayrollList", icon: <CurrencyDollarIcon className="h-6 w-6" />, path: "/payroll" },
    { name: "Settings", icon: <Cog6ToothIcon className="h-6 w-6" />, path: "/settings" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0 mt-2">
      {/* Sidebar Header */}
      <div className="p-3 text-2xl font-bold text-[#113a69] tracking-wide border-b">
        Employee Panel
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto mt-2">
        {menu.map((item, index) => {
          const isActive = location.pathname === item.path; // 👈 check active tab
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 w-full px-6 py-4 text-left transition-colors
              ${isActive
                  ? "bg-[#113a69] text-white font-medium shadow border-l-4 border-[#113a69]"
                  : "text-gray-600 hover:bg-blue-100 hover:text-[#113a69]"
                }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
