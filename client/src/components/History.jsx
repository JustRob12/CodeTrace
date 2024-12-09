import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHistory, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';

const History = ({ studentId }) => {
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendanceHistory = async () => {
            try {
                console.log('StudentId being used:', studentId);

                if (!studentId) {
                    throw new Error('No student ID provided');
                }

                const response = await axios.get(`http://localhost:5000/api/auth/student/attendance/${studentId}`);
                console.log('Response:', response.data);
                
                setAttendanceHistory(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            } catch (error) {
                console.error('Full error object:', error);
                console.error('Error response:', error.response?.data);
                
                setError(
                    error.response?.data?.message || 
                    error.message || 
                    'Failed to load attendance history'
                );
                setLoading(false);
            }
        };

        fetchAttendanceHistory();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 text-center">
                    <div className="text-red-600 mb-2">Error Loading Attendance History</div>
                    <div className="text-gray-600 text-sm">{error}</div>
                    <div className="text-gray-500 text-xs mt-2">Student ID: {studentId}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 pt-8 pb-16">
                <div className="relative z-10 text-center">
                    <FaHistory className="mx-auto text-white/90 text-4xl mb-2" />
                    <h2 className="text-2xl font-bold text-white mb-1">Attendance History</h2>
                    <p className="text-white/80 text-sm">Total Records: {attendanceHistory.length}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                    </svg>
                </div>
            </div>

            <div className="p-6">
                {attendanceHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No attendance records found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attendanceHistory.map((record, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-xl shadow-md border border-teal-100 p-4 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-teal-700 mb-2">
                                            {record.event_name}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <FaCalendarCheck className="text-teal-500" />
                                                <div>
                                                    <p className="text-sm font-medium">Check-in</p>
                                                    <p className="text-sm">
                                                        {new Date(record.checkInTime).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(record.checkInTime).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {record.checkOutTime && (
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <FaCalendarTimes className="text-teal-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">Check-out</p>
                                                        <p className="text-sm">
                                                            {new Date(record.checkOutTime).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(record.checkOutTime).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        record.checkOutTime 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {record.checkOutTime ? 'Completed' : 'Ongoing'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History; 