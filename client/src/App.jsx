// App.jsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout'; // Import the Layout component
import Login from './components/Login';
import Register from './components/Register';
import RegisterStudent from './components/RegisterStudent';
import './tailwind.css';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/register" element={<Layout><Register /></Layout>} />
                <Route path="/register-student" element={<Layout><RegisterStudent /></Layout>} />
            </Routes>
        </Router>
    );
};

export default App;
