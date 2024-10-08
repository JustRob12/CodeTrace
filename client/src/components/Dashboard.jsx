// Dashboard.jsx
import React from 'react';

const Dashboard = () => {
    return (
        <div className="flex min-h-screen">
      

            {/* Main Content */}
            <div className="flex-1 p-8 bg-gray-100">
              
                
                <h1 className="text-3xl font-bold mb-6">Welcome to the Dashboard</h1>
                <p className="text-gray-600">Select a section from the sidebar to manage students, events, attendance, and calendar.</p>
            </div>
        </div>
    );
};

export default Dashboard;
