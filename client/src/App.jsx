import React, { useEffect } from 'react';
import Modal from 'react-modal'; // Import the Modal component
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import CalendarPage from './components/CalendarPage'; // Import the CalendarPage component
import Dashboard from './components/Dashboard'; // Import the Dashboard component
import Layout from './components/Layout'; // Import the Layout component
import Login from './components/Login'; // Import the Login component
import Register from './components/Register'; // Import the Register component
import RegisterStudent from './components/RegisterStudent'; // Import the RegisterStudent component
import ViewStudents from './components/ViewStudents'; // Import the ViewStudents component
import './tailwind.css'; // Import Tailwind CSS styles

// Set the app element for accessibility purposes
Modal.setAppElement('#root'); // Make sure this matches the ID of your main HTML element

const App = () => {
    useEffect(() => {
        // Optional: Any side effects or setup can be placed here
    }, []);

    return (
        <Router>
            <Routes>
                {/* Define your application routes here */}
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/register" element={<Layout><Register /></Layout>} />
                <Route path="/register-student" element={<Layout><RegisterStudent /></Layout>} />
                <Route path="/view-students" element={<Layout><ViewStudents /></Layout>} />
                <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} /> {/* Add Calendar route */}
            </Routes>
        </Router>
    );
};

export default App;
