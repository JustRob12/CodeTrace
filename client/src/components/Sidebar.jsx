import React from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaFileAlt,
  FaHome,
  FaQrcode,
  FaUserPlus
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const location = useLocation(); // Get the current path to highlight active link
  const [activeLink, setActiveLink] = React.useState(location.pathname);

  // State variable for the page title
  const [pageTitle, setPageTitle] = React.useState("Dashboard");

  const handleLinkClick = (path, title) => {
    setActiveLink(path); // Update active link state on click
    setPageTitle(title); // Update page title based on the selected link
  };

  const isActive = (path) => path === activeLink;

  return (
    <div
      className={`bg-black text-white fixed top-0 left-0 h-screen transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
      style={{ paddingTop: "60px" }} // Adjust the top padding to align below the header
    >
      <div className="p-4 flex justify-between items-center">
        <h2 className={`${isExpanded ? "block" : "hidden"} text-xl font-bold`}>
          {pageTitle} {/* Display the current page title */}
        </h2>
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none"
        >
          <FaBars size={24} />
        </button>
      </div>
      <nav>
        <ul className="mt-4">
          {[
            { to: "/dashboard", label: "Dashboard", icon: FaHome }, // Change icon to FaHome
            { to: "/calendar", label: "Calendar", icon: FaCalendarAlt },
            {
              to: "/register-student",
              label: "Register Student",
              icon: FaUserPlus,
            },
            // {
            //   to: "/view-students",
            //   label: "View Students",
            //   icon: FaClipboardList,
            // },
            { to: "/attendance", label: "Attendance Scanner", icon: FaQrcode },
            {
              to: "/attendance-report",
              label: "Attendance Report",
              icon: FaFileAlt,
            },
            {
              to: "/semester",
              label: "Semester",
              icon: FaCalendarAlt,
            },
          ].map((item) => (
            <li key={item.to} className="mb-4">
              <Link
                to={item.to}
                onClick={() => handleLinkClick(item.to, item.label)} // Pass the title when the link is clicked
                className={`flex items-center p-2 transition duration-300 ${
                  isActive(item.to)
                    ? "bg-white text-black"
                    : "text-[#18eaf1] hover:bg-gray-700 hover:shadow-lg"
                } ${isExpanded ? "justify-start" : "justify-center"}`}
              >
                <item.icon
                  className={`text-xl transition duration-300 ${
                    isActive(item.to) ? "text-black" : "text-[#18eaf1]"
                  }`}
                />
                <span
                  className={`${
                    isExpanded ? "ml-4" : "hidden"
                  } text-lg transition duration-300 ${
                    isActive(item.to) ? "text-black" : "text-[#18eaf1]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
