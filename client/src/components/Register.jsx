import * as AlertDialog from "@radix-ui/react-alert-dialog";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserCog, FaUserShield, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const navigate = useNavigate();

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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Admin registered successfully',
        confirmButtonColor: '#0f8686'
      }).then(() => {
        setUsername("");
        setPassword("");
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
    console.log('Editing admin:', admin);
    setEditingAdmin({
      id: admin.id,
      username: admin.username
    });
    setUsername(admin.username);
    setPassword("");
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
      console.log('Updating admin:', editingAdmin.id);
      await axios.put(`http://localhost:5000/api/auth/admin/${editingAdmin.id}`, {
        username,
        password: password || undefined, // Only send password if it was changed
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Admin updated successfully',
        confirmButtonColor: '#0f8686'
      }).then(() => {
        setUsername("");
        setPassword("");
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
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  />
                </div>
              </div>

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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  />
                </div>
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
                    setUsername("");
                    setPassword("");
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
                      Username
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
                        {admin.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit({
                            id: admin.admin_id,
                            username: admin.username
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
