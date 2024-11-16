import axios from "axios";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaIdCard, FaGraduationCap, FaPhone, FaEnvelope } from "react-icons/fa";
import ViewStudents from "./ViewStudents";

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    lastname: "",
    firstname: "",
    middlename: "",
    studentId: "",
    year: "",
    section: "",
    contactNumber: "",
    gmail: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/registerStudent",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Student Added Successfully!");

      setFormData({
        lastname: "",
        firstname: "",
        middlename: "",
        studentId: "",
        year: "",
        section: "",
        contactNumber: "",
        gmail: "",
      });
    } catch (error) {
      console.error("Error registering student:", error);
      toast.error(
        error.response?.data?.[0]?.message || "Error registering student."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-200">
      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-black mb-6">
          Register Student
        </h2>
        {errorMessage && (
          <div className="text-red-600 mb-4 text-center">{errorMessage}</div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              required
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#18e1e7] focus:border-[#18e1e7]"
            />
          </div>
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleChange}
              required
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#18e1e7] focus:border-[#18e1e7]"
            />
          </div>
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              name="middlename"
              placeholder="Middle Name (Optional)"
              value={formData.middlename}
              onChange={handleChange}
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#18e1e7] focus:border-[#18e1e7]"
            />
          </div>
          <div className="relative">
            <FaIdCard className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              name="studentId"
              placeholder="Student ID"
              value={formData.studentId}
              onChange={handleChange}
              maxLength={9}
              required
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#18e1e7] focus:border-[#18e1e7]"
            />
          </div>
          <div className="relative">
            <FaGraduationCap className="absolute top-3 left-3 text-gray-500" />
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#18e1e7] focus:border-[#18e1e7]"
            >
              <option value="" disabled>Select Year</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div className="relative">
            <FaGraduationCap className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              name="section"
              placeholder="Section"
              value={formData.section}
              onChange={handleChange}
              required
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#18e1e7] focus:border-[#18e1e7]"
            />
          </div>
          <div className="relative">
            <FaPhone className="absolute top-3 left-3 text-gray-500" />
            <input
              type="tel"
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              maxLength={11}
              required
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#18e1e7] focus:border-[#18e1e7]"
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-500" />
            <input
              type="email"
              name="gmail"
              placeholder="Gmail"
              value={formData.gmail}
              onChange={handleChange}
              required
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-[#18e1e7] focus:border-[#18e1e7]"
            />
          </div>
          <button
            type="submit"
            className="col-span-2 bg-[#18e1e7] text-white p-3 rounded hover:bg-[#00b3b8] transition disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register Student"}
          </button>
        </form>
        <ViewStudents />
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegisterStudent;
