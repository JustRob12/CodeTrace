import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Semester = () => {
  const [events, setEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeYear, setActiveYear] = useState(localStorage.getItem('activeYear') || null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const groupedEvents = events.reduce((acc, event) => {
    const eventDate = new Date(event.start);
    const eventMonth = eventDate.getMonth(); // 0-11 where 0 is January
    const eventYear = eventDate.getFullYear();
    
    // If month is August (7) or later, use current year as start of academic year
    // If month is before August, use previous year as start of academic year
    const academicStartYear = eventMonth >= 7 ? eventYear : eventYear - 1;
    const academicYear = `${academicStartYear}-${academicStartYear + 1}`;
    
    if (!acc[academicYear]) {
      acc[academicYear] = [];
    }
    acc[academicYear].push(event);
    return acc;
  }, {});

  const sortedAcademicYears = Object.keys(groupedEvents).sort((a, b) => {
    const yearA = parseInt(a.split('-')[0], 10);
    const yearB = parseInt(b.split('-')[0], 10);
    return yearB - yearA;
  });

  const openModal = (year) => {
    setSelectedYear(year);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedYear(null);
  };

  const setActiveSemester = async (year) => {
    const result = await Swal.fire({
      title: 'Activate Semester?',
      text: `Are you sure you want to set ${year} as the active semester?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f8686',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, activate it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setActiveYear(year);
      localStorage.setItem('activeYear', year);
      
      await Swal.fire({
        title: 'Activated!',
        text: `${year} has been set as the active semester.`,
        icon: 'success',
        confirmButtonColor: '#0f8686'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
            <div className="text-center">
              <FaCalendarAlt className="mx-auto text-white/90 text-3xl mb-2" />
              <h1 className="text-2xl font-bold text-white mb-1">Academic Years</h1>
              <p className="text-white/80 text-sm">
                Manage and view academic year events
              </p>
            </div>
          </div>
        </div>

        {/* Academic Years Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAcademicYears.map((year) => (
            <div
              key={year}
              onClick={() => openModal(year)}
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-1">{year}</h2>
                  <p className="text-white/80 text-sm">
                    {groupedEvents[year].length} Events
                  </p>
                </div>
              </div>
              <div className="p-4 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSemester(year);
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeYear === year
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {activeYear === year ? 'Active Semester' : 'Set as Active'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Events Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="modal"
          overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
              <div className="text-center relative">
                <FaClock className="mx-auto text-white/90 text-3xl mb-2" />
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedYear} Events
                </h2>
                <button
                  onClick={closeModal}
                  className="absolute top-0 right-0 text-white/80 hover:text-white transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {selectedYear &&
                  groupedEvents[selectedYear].map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-lg shadow-md border border-teal-100 p-4 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-teal-700 mb-3">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-teal-600 font-medium">Start:</p>
                          <p className="text-gray-700">{new Date(event.start).toLocaleDateString()}</p>
                          <p className="text-gray-500">
                            {new Date(event.start).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-teal-600 font-medium">End:</p>
                          <p className="text-gray-700">{new Date(event.end).toLocaleDateString()}</p>
                          <p className="text-gray-500">
                            {new Date(event.end).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Semester; 