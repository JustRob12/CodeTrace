import React, { useState } from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaFileAlt,
  FaHome,
  FaQrcode,
  FaUserPlus,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = React.useState(location.pathname);
  const [pageTitle, setPageTitle] = React.useState("Dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLinkClick = (path, title) => {
    setActiveLink(path);
    setPageTitle(title);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: FaHome },
    { to: "/calendar", label: "Calendar", icon: FaCalendarAlt },
    { to: "/register-student", label: "Register Student", icon: FaUserPlus },
    { to: "/attendance", label: "Attendance Scanner", icon: FaQrcode },
    { to: "/attendance-report", label: "Attendance Report", icon: FaFileAlt },
    { to: "/semester", label: "Semester", icon: FaCalendarAlt },
  ];

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#064444] to-[#0f8686] transition-all duration-300 ${
          isExpanded ? "w-64" : "w-20"
        }`}
        style={{ paddingTop: "60px" }}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex justify-between items-center">
          <h2
            className={`${
              isExpanded ? "block" : "hidden"
            } text-xl font-bold text-white transition-opacity duration-200`}
          >
            {pageTitle}
          </h2>
          <button
            onClick={toggleSidebar}
            className="text-white/90 hover:text-white focus:outline-none transition-transform duration-200 hover:scale-110"
          >
            <FaBars size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6">
          <ul className="space-y-2 px-3">
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
                  <span
                    className={`${
                      isExpanded ? "ml-4 opacity-100" : "hidden opacity-0"
                    } text-base font-medium transition-opacity duration-200`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-8 left-0 right-0 px-3">
          <button
            onClick={handleLogoutClick}
            className={`w-full flex items-center p-3 rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200 ${
              isExpanded ? "justify-start" : "justify-center"
            }`}
          >
            <FaSignOutAlt className="text-xl" />
            <span
              className={`${
                isExpanded ? "ml-4 opacity-100" : "hidden opacity-0"
              } text-base font-medium transition-opacity duration-200`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-modal-appear">
            <div className="relative bg-gradient-to-r from-[#064444] to-[#0f8686] pt-8 pb-16">
              <div className="relative z-10 px-6 text-center">
                <FaSignOutAlt className="mx-auto text-white/90 text-4xl mb-2" />
                <h2 className="text-2xl font-bold text-white mb-1">
                  Confirm Logout
                </h2>
                <p className="text-white/80 text-sm">
                  Are you sure you want to logout?
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white">
                  <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                </svg>
              </div>
            </div>

            <div className="p-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 bg-gradient-to-r from-[#064444] to-[#0f8686] text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
                <button
                  onClick={handleLogoutCancel}
                  className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition duration-200 flex items-center justify-center space-x-2"
                >
                  <FaTimes />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Add this to your CSS or Tailwind config
const styles = {
  "@keyframes modalAppear": {
    "0%": {
      opacity: "0",
      transform: "scale(0.9)",
    },
    "100%": {
      opacity: "1",
      transform: "scale(1)",
    },
  },
};

export default Sidebar;
