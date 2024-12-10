import axios from 'axios';
import { toPng } from 'html-to-image';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaQrcode, FaTrashAlt, FaUserCircle, FaSearch, FaGraduationCap } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import EditStudentModal from './EditStudentModal';
import Swal from 'sweetalert2';

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
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0f8686',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/auth/students/${studentId}`);
                setStudents(students.filter(student => student.studentId !== studentId));
                setSelectedStudent(null);
                
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Student has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#0f8686'
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete student.',
                    icon: 'error',
                    confirmButtonColor: '#0f8686'
                });
            }
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
            
            Swal.fire({
                title: 'Success!',
                text: 'Student updated successfully!',
                icon: 'success',
                confirmButtonColor: '#0f8686'
            });

            window.location.reload();
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to update student.',
                icon: 'error',
                confirmButtonColor: '#0f8686'
            });
        }
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
                
                Swal.fire({
                    title: 'Success!',
                    text: 'QR Code downloaded successfully!',
                    icon: 'success',
                    confirmButtonColor: '#0f8686',
                    timer: 1500,
                    showConfirmButton: false
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to generate QR Code.',
                    icon: 'error',
                    confirmButtonColor: '#0f8686'
                });
            });
    };

    const filteredStudents = students.filter(student => {
        const searchTerm = searchQuery.toLowerCase();
        const matchesSearch = 
            student.firstname.toLowerCase().includes(searchTerm) || 
            student.lastname.toLowerCase().includes(searchTerm) ||
            student.studentId.toLowerCase().includes(searchTerm);
        const matchesYear = selectedYear ? student.year === parseInt(selectedYear, 10) : true; 
        return matchesSearch && matchesYear;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <FaGraduationCap className="text-teal-600" />
                        Student Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage and view all student information
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Search and Filter Section */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <FaSearch />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by name or student ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 w-full h-10 border-gray-200 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="border-gray-200 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">All Years</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year} Year</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Year
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStudents.map((student) => (
                                            <tr
                                                key={student.studentId}
                                                onClick={() => setSelectedStudent(student)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {student.studentId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.firstname} {student.lastname}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.year}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Student Details Section */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            {selectedStudent ? (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                            <FaUserCircle className="text-teal-600" />
                                            Student Profile
                                        </h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(selectedStudent)}
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedStudent.studentId)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                            <button
                                                onClick={handleGenerateQrCode}
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                title="Generate QR Code"
                                            >
                                                <FaQrcode />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500">Student ID</label>
                                                <p className="font-medium">{selectedStudent.studentId}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Year & Section</label>
                                                <p className="font-medium">{selectedStudent.year}-{selectedStudent.section}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500">Full Name</label>
                                            <p className="font-medium">
                                                {selectedStudent.firstname} {selectedStudent.middlename} {selectedStudent.lastname}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500">Contact Information</label>
                                            <p className="font-medium">{selectedStudent.contactNumber}</p>
                                            <p className="text-sm text-gray-600">{selectedStudent.gmail}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Account Credentials</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-500">Username</label>
                                                    <p className="font-medium">{selectedStudent.studentId}</p>
                                                </div>
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaUserCircle className="mx-auto text-4xl text-gray-300 mb-2" />
                                    <p className="text-gray-500">Select a student to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {isQRCodeVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold text-center mb-4">Student QR Code</h2>
                        <div
                            id="qr-code-container"
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 rounded-xl flex flex-col items-center"
                        >
                            <p className="text-white font-semibold mb-1">
                                {selectedStudent?.firstname} {selectedStudent?.lastname}
                            </p>
                            <p className="text-white/80 text-sm mb-4">{selectedStudent?.studentId}</p>
                            <div className="bg-white p-3 rounded-lg">
                                <QRCode
                                    value={selectedStudent ? selectedStudent.studentId : ''}
                                    size={200}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={downloadQRCodeWithDetails}
                                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                Download
                            </button>
                            <button
                                onClick={() => setIsQRCodeVisible(false)}
                                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <EditStudentModal
                    student={selectedStudent}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ViewStudents;
