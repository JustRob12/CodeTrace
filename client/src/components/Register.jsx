import * as AlertDialog from "@radix-ui/react-alert-dialog";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserCog, FaUserShield, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    position: "",
    username: "",
    password: ""
  });
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const positions = ["President", "Vice-President", "Secretary"];

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        html: passwordValidation.errors.join('<br>'),
        confirmButtonColor: '#0f8686'
      });
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Admin registered successfully',
        confirmButtonColor: '#0f8686'
      }).then(() => {
        setFormData({
          studentId: "",
          firstName: "",
          middleName: "",
          lastName: "",
          position: "",
          username: "",
          password: ""
        });
        fetchAdmins();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.message || 'An error occurred during registration',
        confirmButtonColor: '#0f8686'
      });
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin({
      id: admin.id,
      username: admin.username
    });
    setFormData({
      studentId: admin.studentId,
      firstName: admin.firstName,
      middleName: admin.middleName,
      lastName: admin.lastName,
      position: admin.position,
      username: admin.username,
      password: ""
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editingAdmin || !editingAdmin.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid admin data',
        confirmButtonColor: '#0f8686'
      });
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/auth/admin/${editingAdmin.id}`, {
        studentId: formData.studentId,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        position: formData.position,
        username: formData.username,
        password: formData.password || undefined
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Admin updated successfully',
        confirmButtonColor: '#0f8686'
      }).then(() => {
        setFormData({
          studentId: "",
          firstName: "",
          middleName: "",
          lastName: "",
          position: "",
          username: "",
          password: ""
        });
        setEditingAdmin(null);
        fetchAdmins();
      });
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'An error occurred during update',
        confirmButtonColor: '#0f8686'
      });
    }
  };

  const handleDelete = async (adminId) => {
    try {
      await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0f8686',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(`http://localhost:5000/api/auth/admin/${adminId}`);
          fetchAdmins();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Admin has been deleted.',
            confirmButtonColor: '#0f8686'
          });
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Deletion Failed',
        text: error.response?.data?.message || 'An error occurred during deletion',
        confirmButtonColor: '#0f8686'
      });
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/admins");
      console.log('Fetched admins:', response.data);
      setAdmins(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch admin list',
        confirmButtonColor: '#0f8686'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-t-2xl shadow-md p-6 mb-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
              <FaUserShield className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {editingAdmin ? 'Edit Admin Account' : 'Add Admin Account'}
              </h1>
              <p className="text-gray-600">
                {editingAdmin ? 'Update administrator credentials' : 'Create new administrator credentials'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-b-2xl shadow-md p-6">
          <form onSubmit={editingAdmin ? handleUpdate : handleRegister} className="max-w-md mx-auto space-y-6">
            <div className="space-y-4">
              {/* Student ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="Enter student ID"
                  required
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Position Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-teal-600" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter admin username"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-teal-600" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter secure password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Password must contain at least 8 characters, one uppercase letter, one number, and one special character.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2.5 rounded-xl font-medium hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform transition duration-200 hover:scale-[1.02]"
              >
                {editingAdmin ? 'Update Admin Account' : 'Create Admin Account'}
              </button>
              {editingAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAdmin(null);
                    setFormData({
                      studentId: "",
                      firstName: "",
                      middleName: "",
                      lastName: "",
                      position: "",
                      username: "",
                      password: ""
                    });
                  }}
                  className="w-full mt-2 bg-gray-100 text-gray-800 py-2.5 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transform transition duration-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>All admin accounts have full system access.</p>
              <p>Please ensure credentials are kept secure.</p>
            </div>
          </form>

          {/* Admin List Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.admin_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {`${admin.last_name}, ${admin.first_name} ${admin.middle_name || ''}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit({
                            id: admin.admin_id,
                            username: admin.username,
                            firstName: admin.first_name,
                            middleName: admin.middle_name,
                            lastName: admin.last_name,
                            position: admin.position,
                            studentId: admin.student_id
                          })}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                        >
                          <FaEdit className="inline-block" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(admin.admin_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline-block" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
