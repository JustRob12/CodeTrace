import React from 'react';
import Modal from 'react-modal';
import { Route, HashRouter as Router, Routes, Navigate } from 'react-router-dom';
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
import StudentDashboard from './components/StudentDashboard';
import History from './components/History';
import EventAttendanceChart from './components/EventAttendanceCharts';
import './tailwind.css';

Modal.setAppElement('#root');

// Protected Route Component for Admin Routes
const ProtectedAdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (userType !== 'admin') {
        return <Navigate to="/student-dashboard" replace />;
    }

    return <>{children}</>;
};

// Protected Route Component for Student Routes
const ProtectedStudentRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (userType !== 'student') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (for Login page)
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (token) {
        if (userType === 'admin') {
            return <Navigate to="/dashboard" replace />;
        } else if (userType === 'student') {
            return <Navigate to="/student-dashboard" replace />;
        }
    }

    return <>{children}</>;
};

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Public Route */}
                <Route 
                    path="/" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />

                {/* Admin Protected Routes */}
                <Route path="/dashboard" element={
                    <ProtectedAdminRoute>
                        <Layout><Dashboard /></Layout>
                    </ProtectedAdminRoute>
                } />
                <Route path="/register" element={
                    <ProtectedAdminRoute>
                        <Layout><Register /></Layout>
                    </ProtectedAdminRoute>
                } />
                <Route path="/register-student" element={
                    <ProtectedAdminRoute>
                        <Layout><RegisterStudent /></Layout>
                    </ProtectedAdminRoute>
                } />
                <Route path="/view-students" element={
                    <ProtectedAdminRoute>
                        <Layout><ViewStudents /></Layout>
                    </ProtectedAdminRoute>
                } />
                <Route path="/calendar" element={
                    <ProtectedAdminRoute>
                        <Layout><CalendarPage /></Layout>
                    </ProtectedAdminRoute>
                } />
                <Route path="/attendance" element={
                    <ProtectedAdminRoute>
                        <Layout><AttendanceScanner /></Layout>
                    </ProtectedAdminRoute>
                } />
                <Route path="/attendance-report" element={
                    <ProtectedAdminRoute>
                        <Layout><AttendanceReport /></Layout>
                    </ProtectedAdminRoute>
                } />
                <Route path="/semester" element={
                    <ProtectedAdminRoute>
                        <Layout><Semester /></Layout>
                    </ProtectedAdminRoute>
                } />
                <Route path="/event-attendance" element={
                    <ProtectedAdminRoute>
                        <Layout><EventAttendanceChart /></Layout>
                    </ProtectedAdminRoute>
                } />

                {/* Student Protected Routes */}
                <Route path="/student-dashboard" element={
                    <ProtectedStudentRoute>
                        <StudentDashboard />
                    </ProtectedStudentRoute>
                } />
                <Route path="/history" element={
                    <ProtectedStudentRoute>
                        <History />
                    </ProtectedStudentRoute>
                } />

                {/* Catch all route - redirect to login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;