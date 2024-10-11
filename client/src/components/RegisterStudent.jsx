import axios from 'axios';
import React, { useState } from 'react';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    middlename: '',
    studentId: '',
    year: '',
    section: '',
    contactNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrorMessage(''); // Clear error message on input change
    setSuccessMessage(''); // Clear success message on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state to true

    try {
      const response = await axios.post('http://localhost:5000/api/auth/registerStudent', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccessMessage(response.data.message); // Set success message
      setFormData({ // Reset form fields
        lastname: '',
        firstname: '',
        middlename: '',
        studentId: '',
        year: '',
        section: '',
        contactNumber: '',
      });
    } catch (error) {
      console.error('Error registering student:', error);
      setErrorMessage('Error registering student: ' + (error.response?.data?.message || error.message)); // Detailed error message
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6">Register Student</h2>
          {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}
          {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="middlename"
              placeholder="Middle Name"
              value={formData.middlename}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="studentId"
              placeholder="Student ID"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Year</option>
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
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="tel"
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              disabled={isSubmitting} // Disable button during submission
            >
              {isSubmitting ? 'Registering...' : 'Register Student'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
