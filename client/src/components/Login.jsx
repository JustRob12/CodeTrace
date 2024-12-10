// Login.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaFingerprint } from 'react-icons/fa';
import background from '../assets/background.jpg';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/change-password", {
        studentId: localStorage.getItem("studentId"),
        newPassword,
      });

      // After successful password change, proceed to dashboard
      navigate("/student-dashboard");
    } catch (error) {
      alert("Error changing password. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { username, password }
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userType", "admin");
      navigate("/dashboard");
    } catch (adminError) {
      try {
        const studentResponse = await axios.post(
          "http://localhost:5000/api/auth/login/student",
          { username, password }
        );
        
        localStorage.setItem("token", studentResponse.data.token);
        localStorage.setItem("userType", "student");
        localStorage.setItem("studentId", studentResponse.data.studentId);

        // Check if this is first login
        if (studentResponse.data.isFirstLogin) {
          setShowPasswordChange(true);
        } else {
          navigate("/student-dashboard");
        }
      } catch (studentError) {
        alert("Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18e1e7] to-[#0f8686] opacity-90"></div>
        <img 
          src={background} 
          alt="background" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md relative z-10 p-4">
        {/* Glass-like card effect */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with wave design */}
          <div className="relative bg-[#0f8686] pt-10 pb-16">
            <div className="relative z-10 text-center">
              <FaFingerprint className="mx-auto text-white/90 text-4xl mb-2" />
              <h1 className="text-2xl font-bold text-white mb-1">
                Welcome to CodeTrace
              </h1>
              <p className="text-white/80 text-sm">
                Sign in to continue
              </p>
            </div>
            {/* Wave effect */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg
                viewBox="0 0 1440 120"
                className="w-full h-[60px] fill-white/90"
              >
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z">
                </path>
              </svg>
            </div>
          </div>

          {/* Login Form */}
          <div className="px-8 pb-8 pt-2">
            {!showPasswordChange ? (
              // Regular login form
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-[#0f8686]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-[#0f8686]" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0f8686] text-white py-2.5 rounded-xl font-medium hover:bg-[#0a6565] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f8686] transform transition duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            ) : (
              // Password change form
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Change Your Password</h2>
                  <p className="text-sm text-gray-600">Please set a new password for your account</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-[#0f8686]" />
                  </div>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-[#0f8686]" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0f8686] text-white py-2.5 rounded-xl font-medium hover:bg-[#0a6565] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f8686] transform transition duration-200 hover:scale-[1.02]"
                >
                  Change Password
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>© 2024 CodeTrace. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
