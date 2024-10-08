// RegisterStudent.jsx
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
    profilePicture: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profilePicture: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/auth/registerStudent', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error registering student:', error);
      alert('Error registering student');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
   
      <div className="flex flex-1">
   
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold mb-6">Register Student</h2>
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
            <input
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Register Student
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
