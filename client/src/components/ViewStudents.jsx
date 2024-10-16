import axios from 'axios';
import { toPng } from 'html-to-image';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaQrcode, FaTrashAlt } from 'react-icons/fa';
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
        <div className="flex">
            <div className="w-2/3 p-4">
                <h2 className="text-2xl font-bold mb-4">Students List</h2>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-2 mb-4 w-full"
                />
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border p-2 mb-4"
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
                                    className="bg-white border-b cursor-pointer"
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    <td className="px-4 py-2">{student.studentId}</td>
                                    <td className="px-4 py-2">{student.firstname}</td>
                                    <td className="px-4 py-2">{student.lastname}</td>
                                    <td className="px-4 py-2">{student.year}</td>
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

            <div className="w-1/3 p-4 border-l border-gray-300">
                {selectedStudent ? (
                    <div>
                        <h2 className="text-xl font-bold mb-2">Student Details</h2>
                        <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                        <p><strong>First Name:</strong> {selectedStudent.firstname}</p>
                        <p><strong>Last Name:</strong> {selectedStudent.lastname}</p>
                        <p><strong>Middle Name:</strong> {selectedStudent.middlename}</p>
                        <p><strong>Year:</strong> {selectedStudent.year}</p>
                        <p><strong>Section:</strong> {selectedStudent.section}</p>
                        <p><strong>Contact Number:</strong> {selectedStudent.contactNumber}</p>
                        <p><strong>Gmail:</strong> {selectedStudent.gmail}</p>

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

            {isQRCodeVisible && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-2">QR Code</h2>
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
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Download QR Code
                        </button>
                        <button
                            onClick={() => setIsQRCodeVisible(false)}
                            className="mt-2 text-red-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <EditStudentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    student={selectedStudent}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ViewStudents;
