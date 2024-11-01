import axios from "axios";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications
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
    gmail: "", // Add Gmail field
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
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

      // Show success message in toast
      toast.success("Student Added Successfully!");

      // Clear form data
      setFormData({
        lastname: "",
        firstname: "",
        middlename: "",
        studentId: "",
        year: "",
        section: "",
        contactNumber: "",
        gmail: "", // Clear Gmail field
      });
    } catch (error) {
      console.error("Error registering student:", error);

      // Show error message in toast
      toast.error(
        error.response?.data?.[0]?.message || "Error registering student."
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (

    <div className="flex flex-col min-h-screen items-center justify-center bg-white-100">
      <div className="w-full max-w-4xl p-3 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold text-center mb-6">
          Register Student
        </h2>
        {errorMessage && (
          <div className="text-red-600 mb-4 text-center">{errorMessage}</div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none"
          />
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none"
          />
          <input
            type="text"
            name="middlename"
            placeholder="Middle Name (Optional)"
            value={formData.middlename}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none"
          />
          <input
            type="text"
            name="studentId"
            placeholder="Student ID"
            value={formData.studentId}
            onChange={handleChange}
            maxLength={9}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none"
          />
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none"
          >
            <option value="" disabled>
              Select Year
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          <input
            type="text"
            name="section"
            placeholder="Section"
            value={formData.section}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none"
          />
          <input
            type="tel"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            maxLength={11}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none"
          />
          <input
            type="email" // Change input type to email
            name="gmail"
            placeholder="Gmail"
            value={formData.gmail}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none"
          />
          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register Student"}
          </button>
        </form>

        <ViewStudents/>
      </div>
      <ToastContainer /> {/* Include ToastContainer to render the toasts */}
    </div>


  )  
};


export default RegisterStudent;
