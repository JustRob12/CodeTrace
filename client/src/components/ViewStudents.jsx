import axios from 'axios';
import { toPng } from 'html-to-image'; // Import html-to-image
import React, { useEffect, useState } from 'react';
import { FaEdit, FaQrcode, FaTrashAlt } from 'react-icons/fa';
import QRCode from 'react-qr-code'; // Ensure this is installed and imported correctly
import EditStudentModal from './EditStudentModal';

const ViewStudents = () => {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isQRCodeVisible, setIsQRCodeVisible] = useState(false); // State to manage QR Code visibility

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
        setIsQRCodeVisible(true); // Show the QR Code modal
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
    };

    const downloadQRCodeWithDetails = () => {
        const node = document.getElementById('qr-code-container'); // Get the container

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

    return (
        <div className="flex">
            <div className="w-2/3 p-4">
                <h2 className="text-2xl font-bold mb-4">Students List</h2>
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">Profile Picture</th>
                            <th className="px-4 py-2">Student ID</th>
                            <th className="px-4 py-2">First Name</th>
                            <th className="px-4 py-2">Last Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr
                                    key={student.studentId}
                                    className="bg-white border-b cursor-pointer"
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    <td className="px-4 py-2">
                                        {student.profilePicture ? (
                                            <img
                                                src={`data:image/jpeg;base64,${student.profilePicture}`}
                                                alt="Profile"
                                                className="w-16 h-16 object-cover rounded-full"
                                            />
                                        ) : (
                                            <span>No Image</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">{student.studentId}</td>
                                    <td className="px-4 py-2">{student.firstname}</td>
                                    <td className="px-4 py-2">{student.lastname}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    No students available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Student Details Container */}
            <div className="w-1/3 p-4 border-l border-gray-300">
                {selectedStudent ? (
                    <div>
                        <h2 className="text-xl font-bold mb-2">Student Details</h2>
                        <div className="flex justify-center mb-2">
                            <img
                                src={`data:image/jpeg;base64,${selectedStudent.profilePicture}`}
                                alt="Profile"
                                className="w-24 h-24 object-cover rounded-full"
                            />
                        </div>
                        <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                        <p><strong>First Name:</strong> {selectedStudent.firstname}</p>
                        <p><strong>Last Name:</strong> {selectedStudent.lastname}</p>
                        <p><strong>Middle Name:</strong> {selectedStudent.middlename}</p>
                        <p><strong>Year:</strong> {selectedStudent.year}</p>
                        <p><strong>Section:</strong> {selectedStudent.section}</p>
                        <p><strong>Contact Number:</strong> {selectedStudent.contactNumber}</p>

                        <div className="mt-4 flex space-x-2">
                            <button
                                onClick={() => handleEdit(selectedStudent)}
                                className="bg-[#18e2e9] p-2 rounded-full hover:bg-[#0b6c70] transition-colors"
                            >
                                <FaEdit className="text-white" />
                            </button>
                            <button
                                onClick={() => handleDelete(selectedStudent.studentId)}
                                className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <FaTrashAlt className="text-white" />
                            </button>
                            <button
                                onClick={handleGenerateQrCode}
                                className="bg-[#18e2e9] p-2 rounded-full hover:bg-[#0b6c70] transition-colors"
                            >
                                <FaQrcode className="text-white" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center">Select a student to view details.</p>
                )}
            </div>

            {/* QR Code Modal */}
{isQRCodeVisible && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-2">QR Code</h2>
            <div
                id="qr-code-container"
                className="flex flex-col items-center mb-4"
                style={{
                    background: 'linear-gradient(to bottom, #18e1e7, black)', // Gradient background
                    width: '300px', // Width: 3 units
                    height: '400px', // Height: 4 units
                    padding: '20px', // Padding to ensure content does not touch the edges
                    borderRadius: '10px', // Optional: to round the corners
                }}
            >
                {/* Displaying Student's Profile Picture and Name */}
                {selectedStudent && selectedStudent.profilePicture ? (
                    <img
                        src={`data:image/jpeg;base64,${selectedStudent.profilePicture}`}
                        alt="Profile"
                        className="w-24 h-24 object-cover rounded-full mb-2"
                    />
                ) : (
                    <span>No Image</span>
                )}
                <p className="text-lg font-semibold">{selectedStudent?.firstname} {selectedStudent?.lastname}</p>
                <p className="text-sm text-black-500">{selectedStudent?.studentId}</p>

                {/* QR Code Display */}
                <QRCode id="qrcode" value={selectedStudent ? selectedStudent.studentId : ''} size={256} />
            </div>
            <div className="mt-4 flex justify-between">
                <button
                    onClick={downloadQRCodeWithDetails} // Use the new function
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                    Download QR Code with Details
                </button>
                <button
                    onClick={() => setIsQRCodeVisible(false)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}


            {/* Edit Student Modal */}
            <EditStudentModal
                student={selectedStudent}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

export default ViewStudents;
