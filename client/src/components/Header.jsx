import React from "react";
import logo from "./CT.png";

const Header = () => {
  return (
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
    </header>
  );
};

export default Header;
