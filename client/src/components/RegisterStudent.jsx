import axios from "axios";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaIdCard, FaGraduationCap, FaPhone, FaEnvelope, FaUserPlus } from "react-icons/fa";
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Registration Form Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="relative bg-gradient-to-r from-[#064444] to-[#0f8686] pt-8 pb-16">
            <div className="relative z-10 px-6 text-center">
              <FaUserPlus className="mx-auto text-white/90 text-4xl mb-2" />
              <h2 className="text-2xl font-bold text-white mb-1">
                Register New Student
              </h2>
              <p className="text-white/80 text-sm">
                Enter student information below
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              </svg>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                      placeholder="Enter last name"
                    />
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                      placeholder="Enter first name"
                    />
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="middlename"
                      value={formData.middlename}
                      onChange={handleChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                      placeholder="Enter middle name (optional)"
                    />
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      maxLength={9}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                      placeholder="Enter student ID"
                    />
                    <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                  <div className="relative">
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200 appearance-none"
                    >
                      <option value="" disabled>Select Year Level</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                    <FaGraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                      placeholder="Enter section"
                    />
                    <FaGraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                      maxLength={11}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                      placeholder="Enter contact number"
                    />
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="gmail"
                      value={formData.gmail}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                      placeholder="Enter email address"
                    />
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-span-1 sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#064444] to-[#0f8686] text-white py-3 rounded-xl font-medium hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2"
                >
                  <FaUserPlus className="text-lg" />
                  <span>{isSubmitting ? "Registering..." : "Register Student"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* View Students Section */}
        <ViewStudents />
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default RegisterStudent;
