// App.jsx
import React, { useEffect } from 'react';
import Modal from 'react-modal'; // Import the Modal component
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout'; // Import the Layout component
import Login from './components/Login';
import Register from './components/Register';
import RegisterStudent from './components/RegisterStudent';
import ViewStudents from './components/ViewStudents'; // Import the ViewStudents component
import './tailwind.css';

// Set the app element for accessibility purposes
Modal.setAppElement('#root'); // Make sure this matches the ID of your main HTML element

const App = () => {
    useEffect(() => {
        // Optional: Any side effects or setup can be placed here
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/register" element={<Layout><Register /></Layout>} />
                <Route path="/register-student" element={<Layout><RegisterStudent /></Layout>} />
                <Route path="/view-students" element={<Layout><ViewStudents /></Layout>} /> {/* Add the ViewStudents route */}
            </Routes>
        </Router>
    );
};

export default App;
