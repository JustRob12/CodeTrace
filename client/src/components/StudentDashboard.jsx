import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderStudent from './HeaderStudent';
import StudentQRCode from './QRCode';
import { FaQrcode, FaCalendarAlt, FaHistory, FaUser, FaBell } from 'react-icons/fa';
import History from './History';

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState(null);
    const [events, setEvents] = useState([]);
    const [activeSection, setActiveSection] = useState('info');
    const studentId = localStorage.getItem('studentId');
    const activeYear = localStorage.getItem('activeYear');
    const [showProfile, setShowProfile] = useState(false);
    const [ongoingEvents, setOngoingEvents] = useState([]);

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
                const events = response.data;
                
                // Filter ongoing events
                const today = new Date();
                const ongoing = events.filter(event => {
                    const startDate = new Date(event.start);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(event.end);
                    endDate.setHours(23, 59, 59, 999);
                    return today >= startDate && today <= endDate;
                }).map(event => {
                    const endDate = new Date(event.end);
                    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                    return { 
                        ...event, 
                        daysLeft,
                        isToday: true
                    };
                });

                setOngoingEvents(ongoing);
                setEvents(events);
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

    // Add this helper function to check if an event is today
    const isEventToday = (eventDate) => {
        const today = new Date();
        const eventDay = new Date(eventDate);
        return eventDay.toDateString() === today.toDateString();
    };

    // Add this function to sort events
    const sortEventsByToday = (events) => {
        if (!events) return [];
        
        return [...events].sort((a, b) => {
            const isEventTodayA = isEventToday(a.start);
            const isEventTodayB = isEventToday(b.start);
            
            if (isEventTodayA && !isEventTodayB) return -1;
            if (!isEventTodayA && isEventTodayB) return 1;
            
            return new Date(a.start) - new Date(b.start);
        });
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'events':
                return (
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="relative bg-[#0f8686] pt-8 pb-16">
                            <div className="relative z-10 text-center">
                                <FaCalendarAlt className="mx-auto text-white/90 text-4xl mb-2" />
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {activeYear ? `${activeYear} Events` : 'No Active Semester Selected'}
                                </h2>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0">
                                <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                                    <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="p-6">
                            {activeYear && groupedEvents[activeYear] ? (
                                <div className="space-y-4">
                                    {sortEventsByToday(groupedEvents[activeYear]).map((event) => {
                                        const isToday = isEventToday(event.start);
                                        
                                        return (
                                            <div
                                                key={event.id}
                                                className={`bg-gradient-to-r ${
                                                    isToday 
                                                        ? 'from-teal-100 to-cyan-100 border-l-4 border-l-yellow-400' 
                                                        : 'from-white/80 to-white/80'
                                                } p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className={`font-bold text-xl ${isToday ? 'text-black' : 'text-[#0f8686]'}`}>
                                                        {event.title}
                                                    </h3>
                                                    {isToday && (
                                                        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                                                            <FaBell className="text-yellow-500 animate-pulse" size={12} />
                                                            <span className="text-xs font-medium text-yellow-700">Today</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className={`font-medium text-sm ${isToday ? 'text-black' : 'text-gray-600'}`}>
                                                            Start:
                                                        </p>
                                                        <p className={isToday ? 'text-black' : 'text-gray-700'}>
                                                            {new Date(event.start).toLocaleDateString()}
                                                        </p>
                                                        <p className={isToday ? 'text-black' : 'text-gray-500'}>
                                                            {new Date(event.start).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium text-sm ${isToday ? 'text-black' : 'text-gray-600'}`}>
                                                            End:
                                                        </p>
                                                        <p className={isToday ? 'text-black' : 'text-gray-700'}>
                                                            {new Date(event.end).toLocaleDateString()}
                                                        </p>
                                                        <p className={isToday ? 'text-black' : 'text-gray-500'}>
                                                            {new Date(event.end).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    {activeYear ? 'No events found for this semester.' : 'Please select an active semester to view events.'}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'qr':
                return <StudentQRCode studentId={studentId} />;
            case 'history':
                return <History studentId={studentId} />;
            case 'info':
            default:
                return (
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="relative bg-[#0f8686] pt-8 pb-16">
                            <div className="relative z-10 text-center">
                                <FaHistory className="mx-auto text-white/90 text-4xl mb-2" />
                                <h2 className="text-2xl font-bold text-white mb-1">Student Information</h2>
                            </div>
                            {/* Wave effect */}
                            <div className="absolute bottom-0 left-0 right-0">
                                <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                                    <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem label="Student ID" value={studentData.studentId} />
                                <InfoItem 
                                    label="Name" 
                                    value={`${studentData.firstname} ${studentData.middlename || ''} ${studentData.lastname}`} 
                                />
                                <InfoItem label="Year" value={studentData.year} />
                                <InfoItem label="Section" value={studentData.section} />
                                <InfoItem label="Contact Number" value={studentData.contactNumber} />
                                <InfoItem label="Email" value={studentData.gmail} />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    // Helper component for info items
    const InfoItem = ({ label, value }) => (
        <div className="bg-white/80 p-4 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="font-semibold text-gray-900">{value}</p>
        </div>
    );

    // Add this function to handle profile click
    const handleProfileClick = () => {
        setShowProfile(true);
        setActiveSection('info'); // Switch to info section when profile is clicked
    };

    if (!studentData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#18e1e7] to-[#0f8686] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#18e1e7] to-[#0f8686]">
            <HeaderStudent 
                studentName={`${studentData.firstname} ${studentData.lastname}`} 
                onProfileClick={handleProfileClick}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
                {ongoingEvents.length > 0 && (
                    <div className="mb-6">
                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                            <div className="relative bg-[#0f8686] pt-8 pb-16">
                                <div className="relative z-10 text-center">
                                    <FaBell className="mx-auto text-white/90 text-4xl mb-2" />
                                    <h2 className="text-2xl font-bold text-white mb-1">Ongoing Events</h2>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0">
                                    <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                                    </svg>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {ongoingEvents.map((event) => (
                                        <div 
                                            key={event.id}
                                            className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border-l-4 border-amber-500 shadow-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-lg text-gray-800">
                                                            {event.title}
                                                        </h3>
                                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                                        Ongoing Today
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {showProfile ? (
                    // Show profile content
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="relative bg-[#0f8686] pt-8 pb-16">
                            <div className="relative z-10 text-center">
                                <FaUser className="mx-auto text-white/90 text-4xl mb-2" />
                                <h2 className="text-2xl font-bold text-white mb-1">Profile Information</h2>
                            </div>
                            {/* Wave effect */}
                            <div className="absolute bottom-0 left-0 right-0">
                                <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                                    <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem label="Student ID" value={studentData.studentId} />
                                <InfoItem 
                                    label="Name" 
                                    value={`${studentData.firstname} ${studentData.middlename || ''} ${studentData.lastname}`} 
                                />
                                <InfoItem label="Year" value={studentData.year} />
                                <InfoItem label="Section" value={studentData.section} />
                                <InfoItem label="Contact Number" value={studentData.contactNumber} />
                                <InfoItem label="Email" value={studentData.gmail} />
                            </div>
                        </div>
                    </div>
                ) : (
                    renderContent()
                )}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-around items-center h-16">
                        <NavButton 
                            icon={<FaHistory />} 
                            label="History" 
                            active={activeSection === 'history'} 
                            onClick={() => {
                                setShowProfile(false);
                                setActiveSection('history');
                            }} 
                        />
                        <NavButton 
                            icon={<FaCalendarAlt />} 
                            label="Events" 
                            active={activeSection === 'events'} 
                            onClick={() => {
                                setShowProfile(false);
                                setActiveSection('events');
                            }} 
                        />
                        <NavButton 
                            icon={<FaQrcode />} 
                            label="QR Code" 
                            active={activeSection === 'qr'} 
                            onClick={() => {
                                setShowProfile(false);
                                setActiveSection('qr');
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for navigation buttons
const NavButton = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center w-1/3 transition-colors duration-200 ${
            active ? 'text-[#0f8686]' : 'text-gray-600'
        }`}
    >
        <div className="text-xl md:text-2xl">{icon}</div>
        <span className="text-xs mt-1">{label}</span>
    </button>
);

export default StudentDashboard; 