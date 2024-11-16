import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import AttendanceReport from './components/AttendanceReport';
import AttendanceScanner from './components/AttendanceScanner';
import CalendarPage from './components/CalendarPage';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import RegisterStudent from './components/RegisterStudent';
import ViewStudents from './components/ViewStudents';
import Semester from './components/Semester';
import './tailwind.css';

Modal.setAppElement('#root');

const App = () => {
    useEffect(() => {
        // Optional: Any side effects or setup can be placed here
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                {/* Wrap all other routes with Layout */}
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/register" element={<Layout><Register /></Layout>} />
                <Route path="/register-student" element={<Layout><RegisterStudent /></Layout>} />
                <Route path="/view-students" element={<Layout><ViewStudents /></Layout>} />
                <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
                <Route path="/attendance" element={<Layout><AttendanceScanner /></Layout>} />
                <Route path="/attendance-report" element={<Layout><AttendanceReport /></Layout>} />
                <Route path="/semester" element={<Layout><Semester /></Layout>} />
            </Routes>
        </Router>
    );
};

export default App;
