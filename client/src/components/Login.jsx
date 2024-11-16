// Login.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Try admin login first
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { username, password }
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userType", "admin");
      navigate("/dashboard");
    } catch (adminError) {
      try {
        // If admin login fails, try student login
        const studentResponse = await axios.post(
          "http://localhost:5000/api/auth/login/student",
          { username, password }
        );
        localStorage.setItem("token", studentResponse.data.token);
        localStorage.setItem("userType", "student");
        localStorage.setItem("studentId", studentResponse.data.studentId);
        navigate("/student-dashboard");
      } catch (studentError) {
        alert("Login failed");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Welcome
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
