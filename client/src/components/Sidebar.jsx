// Sidebar.jsx
import React, { useState } from 'react';
import { FaBars, FaCalendarAlt, FaCalendarCheck, FaClipboardList, FaUserPlus } from 'react-icons/fa'; // FontAwesome icons
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Importing the CSS file for styles

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`bg-black text-white ${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300`}>
            <div className="p-4 flex justify-between items-center">
                <h2 className={`${isExpanded ? 'block' : 'hidden'} text-2xl font-bold`}>Dashboard</h2>
                <button onClick={toggleSidebar} className="text-white focus:outline-none">
                    <FaBars size={24} />
                </button>
            </div>
            <nav>
                <ul className="mt-4">
                    <li className="mb-4">
                        <Link to="/dashboard" className="flex items-center p-2 hover:bg-gray-700 hover:shadow-lg transition duration-300">
                            <FaClipboardList className="text-xl icon" />
                            <span className={`${isExpanded ? 'ml-4' : 'hidden'} text-lg`}>Dashboard</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/register-student" className="flex items-center p-2 hover:bg-gray-700 hover:shadow-lg transition duration-300">
                            <FaUserPlus className="text-xl icon" />
                            <span className={`${isExpanded ? 'ml-4' : 'hidden'} text-lg`}>Register Student</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/view-students" className="flex items-center p-2 hover:bg-gray-700 hover:shadow-lg transition duration-300">
                            <FaClipboardList className="text-xl icon" />
                            <span className={`${isExpanded ? 'ml-4' : 'hidden'} text-lg`}>View Students</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/add-event" className="flex items-center p-2 hover:bg-gray-700 hover:shadow-lg transition duration-300">
                            <FaCalendarCheck className="text-xl icon" />
                            <span className={`${isExpanded ? 'ml-4' : 'hidden'} text-lg`}>Add Event</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/attendance" className="flex items-center p-2 hover:bg-gray-700 hover:shadow-lg transition duration-300">
                            <FaClipboardList className="text-xl icon" />
                            <span className={`${isExpanded ? 'ml-4' : 'hidden'} text-lg`}>Attendance</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link to="/calendar" className="flex items-center p-2 hover:bg-gray-700 hover:shadow-lg transition duration-300">
                            <FaCalendarAlt className="text-xl icon" />
                            <span className={`${isExpanded ? 'ml-4' : 'hidden'} text-lg`}>Calendar</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
