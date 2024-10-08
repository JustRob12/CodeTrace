// Header.jsx
import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa'; // Importing the FontAwesome icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './Header.css'; // Importing the CSS file for styles

const Header = () => {
    const navigate = useNavigate(); // Create a navigate function

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token
        navigate('/'); // Redirect to the login page or home page
    };

    return (
        <header className="bg-black text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">CodeTrace</h1>
            <button onClick={handleLogout} className="flex items-center text-white hover:text-[#18e1e7] transition duration-300">
                <FaSignOutAlt className="text-xl mr-2" />
                Logout
            </button>
        </header>
    );
};

export default Header;
