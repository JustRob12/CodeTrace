// Layout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-grow">
                <Sidebar />
                <div className="flex-1 p-8 bg-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
