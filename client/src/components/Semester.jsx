import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaTimes } from 'react-icons/fa';

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
    const startYear = new Date(event.start).getFullYear();
    const academicYear = `${startYear}-${startYear + 1}`;
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

  const setActiveSemester = (year) => {
    setActiveYear(year);
    localStorage.setItem('activeYear', year);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="relative bg-[#0f8686] pt-8 pb-16">
            <div className="relative z-10 text-center px-6">
              <FaCalendarAlt className="mx-auto text-white/90 text-4xl mb-2" />
              <h1 className="text-3xl font-bold text-white mb-1">Academic Years</h1>
              <p className="text-white/80 text-sm">
                Manage and view academic year events
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Academic Years Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAcademicYears.map((year) => (
            <div
              key={year}
              onClick={() => openModal(year)}
              className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="relative bg-[#0f8686] pt-6 pb-12">
                <div className="relative z-10 text-center px-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{year}</h2>
                  <p className="text-white/80 text-sm">
                    {groupedEvents[year].length} Events
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 1440 120" className="w-full h-[40px] fill-white/90">
                    <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                  </svg>
                </div>
              </div>
              <div className="p-4 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSemester(year);
                  }}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeYear === year
                      ? 'bg-[#0f8686] text-white'
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
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl">
            <div className="relative bg-[#0f8686] pt-8 pb-16">
              <div className="relative z-10 text-center px-6">
                <FaClock className="mx-auto text-white/90 text-4xl mb-2" />
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedYear} Events
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                  <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                </svg>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {selectedYear &&
                  groupedEvents[selectedYear].map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-[#0f8686] mb-3">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Start:</p>
                          <p>{new Date(event.start).toLocaleDateString()}</p>
                          <p className="text-gray-500">
                            {new Date(event.start).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">End:</p>
                          <p>{new Date(event.end).toLocaleDateString()}</p>
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