import React from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaFileAlt,
  FaHome,
  FaQrcode,
  FaUserPlus,
  FaTimes,
  FaUserCog,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = React.useState(location.pathname);
  const [pageTitle, setPageTitle] = React.useState("Dashboard");

  const handleLinkClick = (path, title) => {
    setActiveLink(path);
    setPageTitle(title);
  };

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: FaHome },
    { to: "/calendar", label: "Calendar", icon: FaCalendarAlt },
    { to: "/register-student", label: "Register Student", icon: FaUserPlus },
    { to: "/register", label: "Add Admin", icon: FaUserCog },
    { to: "/attendance", label: "Attendance Scanner", icon: FaQrcode },
    { to: "/attendance-report", label: "Attendance Report", icon: FaFileAlt },
    { to: "/semester", label: "Semester", icon: FaCalendarAlt },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#064444] to-[#0f8686] flex flex-col transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      <nav className="flex-1 overflow-y-auto pt-20">
        <ul className="space-y-2 px-3 py-4">
          {menuItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => handleLinkClick(item.to, item.label)}
                className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                  activeLink === item.to
                    ? "bg-white text-[#064444] shadow-lg transform scale-105"
                    : "text-white/90 hover:bg-white/10"
                } ${isExpanded ? "justify-start" : "justify-center"}`}
              >
                <item.icon
                  className={`text-xl ${
                    activeLink === item.to ? "text-[#064444]" : "text-current"
                  }`}
                />
                {isExpanded && (
                  <span className="ml-4 text-base font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
          
          {/* Expand/Collapse Button */}
          <li>
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center p-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200"
              style={{ justifyContent: isExpanded ? "start" : "center" }}
            >
              {isExpanded ? (
                <>
                  <FaAngleDoubleLeft className="text-xl" />
                  <span className="ml-4 text-base font-medium">Collapse</span>
                </>
              ) : (
                <FaAngleDoubleRight className="text-xl" />
              )}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
