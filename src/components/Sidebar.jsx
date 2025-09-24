
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { PiUsersThreeLight } from 'react-icons/pi';
import {
  HomeIcon,
  CalendarIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: <HomeIcon className="h-7 w-7" />, path: "/" },
    { name: "My Profile", icon: <CgProfile className="h-7 w-7" />, path: "/my-profile" },
    { name: "Attendance", icon: <ClipboardDocumentListIcon className="h-7 w-7" />, path: "/attendance" },
    { name: "Leave", icon: <CalendarIcon className="h-7 w-7" />, path: "/leave" },
    { name: "Projects", icon: <BriefcaseIcon className="h-7 w-7" />, path: "/projects" },
    { name: "Payroll", icon: <CurrencyDollarIcon className="h-7 w-7" />, path: "/payroll" },
    { name: "Performance", icon: <PiUsersThreeLight className="h-7 w-7" />, path: "/employee-p" },
    { name: "Settings", icon: <Cog6ToothIcon className="h-7 w-7" />, path: "/settings" },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-30" : "w-72"
      } bg-gradient-to-b from-white to-gray-50 shadow-2xl flex flex-col h-screen sticky top-0 transition-all duration-300 font-inter`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
    <img src="https://cdn-icons-png.freepik.com/512/17806/17806427.png" alt="" className="w-[40px] h-auto object-cover" />

            <span className="text-xl font-semibold text-[#113a69] tracking-tight">Employee Portal</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#113a69] ml-4"
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-[#113a69]" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-[#113a69]" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto mt-4 px-2">
        {menu.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-left transition-all duration-200 relative group
                ${isActive
                  ? "bg-[#113a69] text-white shadow-lg border-l-4 border-[#1e5b9a]"
                  : "text-gray-700 hover:bg-[#e6edf7] hover:text-[#113a69] hover:shadow-md"
                }`}
              title={isCollapsed ? item.name : ""}
            >
              <span
                className={`transition-colors duration-200 ${
                  isActive ? "text-white" : "text-[#113a69]"
                }`}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-[16px] font-medium tracking-wide">{item.name}</span>
              )}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 text-sm text-white bg-[#113a69] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Cog6ToothIcon className="h-5 w-5 text-[#113a69]" />
            <span>Version 2.1.0</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} xAI Corp
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
