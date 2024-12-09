import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaHistory, 
    FaRegCheckCircle, 
    FaRegClock,
    FaCalendarDay,
    FaRegCalendarCheck 
} from 'react-icons/fa';

const History = ({ studentId }) => {
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendanceHistory = async () => {
            try {
                if (!studentId) throw new Error('No student ID provided');
                const response = await axios.get(`http://localhost:5000/api/auth/student/attendance/${studentId}`);
                setAttendanceHistory(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            } catch (error) {
                setError(error.response?.data?.message || error.message || 'Failed to load attendance history');
                setLoading(false);
            }
        };

        fetchAttendanceHistory();
    }, [studentId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Attendance History</div>
                    <div className="text-gray-600">{error}</div>
                </div>
            </div>
        );
    }

    // Group attendance records by month
    const groupedHistory = attendanceHistory.reduce((groups, record) => {
        const date = new Date(record.checkInTime);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!groups[monthYear]) {
            groups[monthYear] = [];
        }
        groups[monthYear].push(record);
        return groups;
    }, {});

    return (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative bg-[#0f8686] pt-8 pb-16">
                <div className="relative z-10 text-center">
                    <FaHistory className="mx-auto text-white/90 text-4xl mb-2" />
                    <h2 className="text-2xl font-bold text-white mb-1">Attendance History</h2>
                    <p className="text-white/80 text-sm">
                        Total Records: {attendanceHistory.length}
                    </p>
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
                        <FaRegCalendarCheck className="mx-auto text-4xl text-gray-400 mb-3" />
                        <p>No attendance records found.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedHistory).map(([monthYear, records]) => (
                            <div key={monthYear} className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-teal-100">
                                    <FaCalendarDay className="text-teal-600" />
                                    <h3 className="text-lg font-semibold text-gray-700">{monthYear}</h3>
                                </div>
                                <div className="space-y-4">
                                    {records.map((record, index) => (
                                        <div 
                                            key={index}
                                            className="bg-gradient-to-r from-white/80 to-white/80 rounded-xl shadow-md border-l-4 border-teal-500 p-5 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-teal-700 mb-3">
                                                        {record.event_name}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="flex items-start gap-3">
                                                            <FaRegCheckCircle className="text-teal-500 mt-1" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">Check-in</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {new Date(record.checkInTime).toLocaleDateString('en-US', {
                                                                        weekday: 'long',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {record.checkOutTime && (
                                                            <div className="flex items-start gap-3">
                                                                <FaRegClock className="text-teal-500 mt-1" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-700">Check-out</p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {new Date(record.checkOutTime).toLocaleDateString('en-US', {
                                                                            weekday: 'long',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History; 