import axios from 'axios';
import { toPng } from 'html-to-image';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaQrcode, FaTrashAlt, FaUserCircle } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import EditStudentModal from './EditStudentModal';

const ViewStudents = () => {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isQRCodeVisible, setIsQRCodeVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const years = [1, 2, 3, 4];

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/students');
                setStudents(response.data);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, []);

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (studentId) => {
        const confirmed = window.confirm("Are you sure you want to delete this student?");
        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/auth/students/${studentId}`);
            setStudents(students.filter(student => student.studentId !== studentId));
            setSelectedStudent(null);
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    const handleGenerateQrCode = () => {
        setIsQRCodeVisible(true);
    };

    const handleSave = async (updatedStudent) => {
        const { studentId } = updatedStudent;

        try {
            await axios.put(`http://localhost:5000/api/auth/students/${studentId}`, updatedStudent);
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.studentId === studentId ? updatedStudent : student
                )
            );
            setIsModalOpen(false);
            setSelectedStudent(null);
            alert('Student updated successfully!');
        } catch (error) {
            console.error('Error updating student:', error);
            alert(`Error updating student: ${error.response?.data?.message || 'Please try again.'}`);
        }

        window.location.reload();
    };

    const downloadQRCodeWithDetails = () => {
        const node = document.getElementById('qr-code-container');

        toPng(node)
            .then((dataUrl) => {
                const downloadLink = document.createElement('a');
                downloadLink.href = dataUrl;
                downloadLink.download = `QRCode_${selectedStudent.studentId}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            })
            .catch((error) => {
                console.error('Error generating QR Code image:', error);
            });
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              student.lastname.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = selectedYear ? student.year === parseInt(selectedYear, 10) : true; 
        return matchesSearch && matchesYear;
    });

    return (
        <div className="flex space-x-6 animate-fadeIn">
            <div className="w-2/3 p-6 bg-white rounded shadow-lg">
                <h2 className="text-3xl font-bold mb-6">Students List</h2>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 mb-4 w-full focus:border-blue-500"
                />
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 mb-4 w-full"
                >
                    <option value="">All Years</option>
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">Student ID</th>
                            <th className="px-4 py-2">First Name</th>
                            <th className="px-4 py-2">Last Name</th>
                            <th className="px-4 py-2">Year</th>
                          
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr
                                    key={student.studentId}
                                    className="bg-white border-b hover:bg-blue-100 cursor-pointer transition"
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    <td className="px-4 py-2">{student.studentId}</td>
                                    <td className="px-4 py-2">{student.firstname}</td>
                                    <td className="px-4 py-2">{student.lastname}</td>
                                    <td className="px-4 py-2">{student.year}</td>
                                    <td className="px-4 py-2">
                                      
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    No students available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="w-1/3 p-6 bg-white rounded shadow-lg border-l border-gray-200 animate-fadeIn">
                {selectedStudent ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                            <FaUserCircle className="text-blue-500" />
                            <span>Student Details</span>
                        </h2>
                        <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                        <p><strong>First Name:</strong> {selectedStudent.firstname}</p>
                        <p><strong>Last Name:</strong> {selectedStudent.lastname}</p>
                        <p><strong>Middle Name:</strong> {selectedStudent.middlename}</p>
                        <p><strong>Year:</strong> {selectedStudent.year}</p>
                        <p><strong>Section:</strong> {selectedStudent.section}</p>
                        <p><strong>Contact Number:</strong> {selectedStudent.contactNumber}</p>
                        <p><strong>Gmail:</strong> {selectedStudent.gmail}</p>
                        
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Account Credentials</h3>
                            <p><strong>Username:</strong> {selectedStudent.studentId}</p>
                            <p><strong>Password:</strong> {selectedStudent.credentials?.password || 'Not set'}</p>
                        </div>

                        <div className="mt-6 flex space-x-4">
                            <button
                                onClick={() => handleEdit(selectedStudent)}
                                className="bg-teal-500 p-3 rounded-full hover:bg-teal-600 transition-transform transform hover:scale-110"
                            >
                                <FaEdit className="text-white" />
                            </button>
                            <button
                                onClick={() => handleDelete(selectedStudent.studentId)}
                                className="bg-red-500 p-3 rounded-full hover:bg-red-600 transition-transform transform hover:scale-110"
                            >
                                <FaTrashAlt className="text-white" />
                            </button>
                            <button
                                onClick={handleGenerateQrCode}
                                className="bg-teal-500 p-3 rounded-full hover:bg-teal-600 transition-transform transform hover:scale-110"
                            >
                                <FaQrcode className="text-white" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center">Select a student to view details.</p>
                )}
            </div>

            {isQRCodeVisible && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 animate-fadeIn">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-2xl font-bold mb-4 text-center">QR Code</h2>
                        <div
                            id="qr-code-container"
                            className="flex flex-col items-center mb-4"
                            style={{
                                background: '#18e1e7',
                                width: '300px',
                                height: '400px',
                                padding: '20px',
                                borderRadius: '10px',
                            }}
                        >
                            <p className="text-lg font-semibold">{selectedStudent?.firstname} {selectedStudent?.lastname}</p>
                            <p className="text-sm text-black-500">{selectedStudent?.studentId}</p>
                            <QRCode id="qrcode" value={selectedStudent ? selectedStudent.studentId : ''} size={256} />
                        </div>
                        <button
                            onClick={downloadQRCodeWithDetails}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        >
                            Download QR Code
                        </button>
                        <button
                            onClick={() => setIsQRCodeVisible(false)}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <EditStudentModal
                    student={selectedStudent}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ViewStudents;
