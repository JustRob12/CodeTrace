import React from "react";
import { FaSignOutAlt } from "react-icons/fa"; // Importing the FontAwesome icon
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import logo from "./CT.png"; // Adjust the path to where CT.png is located

const Header = () => {
  const navigate = useNavigate(); // Create a navigate function

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token
    navigate("/"); // Redirect to the login page or home page
  };

  return (
    <header className="bg-black text-white p-4 flex justify-between items-center h-16 fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="flex items-center">
        <img
          src={logo}
          alt="Logo"
          className="h-8 mr-2" // Adjust height as needed
        />
        <h1 className="text-2xl font-bold">CodeTrace</h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center text-white hover:text-[#18e1e7] transition duration-300"
      >
        <FaSignOutAlt className="text-xl mr-2" />
        Logout
      </button>
    </header>
  );
};

export default Header;
