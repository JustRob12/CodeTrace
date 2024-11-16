import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderStudent from './HeaderStudent';
import StudentQRCode from './QRCode';
import { FaQrcode, FaCalendarAlt, FaUserGraduate } from 'react-icons/fa';

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState(null);
    const [events, setEvents] = useState([]);
    const [activeSection, setActiveSection] = useState('info');
    const studentId = localStorage.getItem('studentId');
    const activeYear = localStorage.getItem('activeYear');

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/student/${studentId}`);
                setStudentData(response.data);
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
        };

        const fetchEvents = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/events");
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        if (studentId) {
            fetchStudentData();
            fetchEvents();
        }
    }, [studentId]);

    // Group events by academic year
    const groupedEvents = events.reduce((acc, event) => {
        const startYear = new Date(event.start).getFullYear();
        const academicYear = `${startYear}-${startYear + 1}`;
        if (!acc[academicYear]) {
            acc[academicYear] = [];
        }
        acc[academicYear].push(event);
        return acc;
    }, {});

    const renderContent = () => {
        switch(activeSection) {
            case 'events':
                return (
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-black text-center">
                            {activeYear ? `${activeYear} Events` : 'No Active Semester Selected'}
                        </h2>
                        {activeYear && groupedEvents[activeYear] ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {groupedEvents[activeYear].map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex flex-col items-start transition-transform transform hover:scale-105 cursor-pointer"
                                    >
                                        <h3 className="font-bold text-lg md:text-xl text-[#0f8686] mb-2">{event.title}</h3>
                                        <div className="text-sm md:text-base mb-3 text-gray-700 w-full">
                                            <div className="flex flex-col md:flex-row md:items-center mb-2">
                                                <span className="font-semibold mr-2">Start:</span>
                                                <div className="flex flex-col">
                                                    <span className="text-base md:text-lg font-medium">
                                                        {new Date(event.start).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs md:text-sm text-gray-500">
                                                        {new Date(event.start).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row md:items-center">
                                                <span className="font-semibold mr-2">End:</span>
                                                <div className="flex flex-col">
                                                    <span className="text-base md:text-lg font-medium">
                                                        {new Date(event.end).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs md:text-sm text-gray-500">
                                                        {new Date(event.end).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                {activeYear ? 'No events found for this semester.' : 'Please select an active semester to view events.'}
                            </div>
                        )}
                    </div>
                );
            case 'qr':
                return <StudentQRCode studentId={studentId} />;
            case 'info':
            default:
                return (
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Student Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-gray-600 text-sm md:text-base">Student ID:</p>
                                <p className="font-semibold text-base md:text-lg">{studentData.studentId}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-600 text-sm md:text-base">Name:</p>
                                <p className="font-semibold text-base md:text-lg">
                                    {`${studentData.firstname} ${studentData.middlename || ''} ${studentData.lastname}`}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-600 text-sm md:text-base">Year:</p>
                                <p className="font-semibold text-base md:text-lg">{studentData.year}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-600 text-sm md:text-base">Section:</p>
                                <p className="font-semibold text-base md:text-lg">{studentData.section}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-600 text-sm md:text-base">Contact Number:</p>
                                <p className="font-semibold text-base md:text-lg">{studentData.contactNumber}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-600 text-sm md:text-base">Email:</p>
                                <p className="font-semibold text-base md:text-lg">{studentData.gmail}</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    if (!studentData) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-16">
            <HeaderStudent studentName={`${studentData.firstname} ${studentData.lastname}`} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                {renderContent()}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-around items-center h-16">
                        <button
                            onClick={() => setActiveSection('info')}
                            className={`flex flex-col items-center w-1/3 ${
                                activeSection === 'info' ? 'text-[#0f8686]' : 'text-gray-600'
                            }`}
                        >
                            <FaUserGraduate className="text-xl md:text-2xl" />
                            <span className="text-xs mt-1">Information</span>
                        </button>

                        <button
                            onClick={() => setActiveSection('events')}
                            className={`flex flex-col items-center w-1/3 ${
                                activeSection === 'events' ? 'text-[#0f8686]' : 'text-gray-600'
                            }`}
                        >
                            <FaCalendarAlt className="text-xl md:text-2xl" />
                            <span className="text-xs mt-1">Events</span>
                        </button>

                        <button
                            onClick={() => setActiveSection('qr')}
                            className={`flex flex-col items-center w-1/3 ${
                                activeSection === 'qr' ? 'text-[#0f8686]' : 'text-gray-600'
                            }`}
                        >
                            <FaQrcode className="text-xl md:text-2xl" />
                            <span className="text-xs mt-1">QR Code</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard; 