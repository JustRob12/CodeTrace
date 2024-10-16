import React, { useState } from "react";
import Header from "./Header"; // Import the Header component
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* Header at the top */}
      <div className="flex flex-grow">
        <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-grow transition-all duration-300 ${
            isSidebarExpanded ? 'ml-64' : 'ml-20'
          }`}
          style={{ paddingTop: '60px' }} // Add padding-top here to match the header's height
        >
          <main className="p-4">
            {/* Main content area */}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
