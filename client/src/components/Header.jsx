import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTimes } from "react-icons/fa";
import logo from "./CT.png";

const Header = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  return (
    <>
      <header className="bg-gradient-to-r from-[#0f8686] to-[#18e1e7] text-white p-4 flex justify-between items-center h-16 fixed top-0 left-0 w-full z-50 shadow-lg backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="CodeTrace Logo"
            className="h-10 w-auto transition-transform duration-300 hover:scale-105"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              Code<span className="text-[#e7e7e7]">Trace</span>
            </h1>
            <p className="text-xs text-white/80">Attendance Management System</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </header>

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

export default Header;
