import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const EditStudentModal = ({ student, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    middlename: "",
    year: "",
    section: "",
    contactNumber: "",
    gmail: "", // Add gmail field here
  });

  useEffect(() => {
    if (student) {
      setFormData({
        firstname: student.firstname || "",
        lastname: student.lastname || "",
        middlename: student.middlename || "",
        year: student.year || "",
        section: student.section || "",
        contactNumber: student.contactNumber || "",
        gmail: student.gmail || "", // Populate gmail from student data
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...student, ...formData });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Student</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1" htmlFor="firstname">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1" htmlFor="lastname">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1" htmlFor="middlename">
                    Middle Name (optional)
                  </label>
                  <input
                    type="text"
                    id="middlename"
                    name="middlename"
                    value={formData.middlename}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1" htmlFor="year">
                    Year
                  </label>
                  <input
                    type="text"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1" htmlFor="section">
                    Section
                  </label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1" htmlFor="contactNumber">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1" htmlFor="gmail">
                    Email (Gmail)
                  </label>
                  <input
                    type="email"
                    id="gmail"
                    name="gmail"
                    value={formData.gmail}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#18e2e9] text-white py-2 px-4 rounded-md hover:bg-[#0b6c70] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditStudentModal;
