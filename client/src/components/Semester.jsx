import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

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
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-black">Semester Page</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedAcademicYears.map((year) => (
          <div
            key={year}
            className={`bg-white p-6 rounded-lg shadow-lg flex flex-col items-center transition-transform transform hover:scale-105 cursor-pointer ${activeYear === year ? 'border-2 border-blue-500' : ''}`}
            onClick={() => openModal(year)}
          >
            <h2 className="text-2xl font-bold text-[#0f8686]">{year}</h2>
            <button
              className={`mt-4 px-4 py-2 rounded ${activeYear === year ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSemester(year);
              }}
            >
              {activeYear === year ? 'Active' : 'Set Active'}
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Events Modal"
        className="modal"
        overlayClassName="overlay"
        style={{
          content: {
            maxHeight: '80vh',
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'row',
          },
        }}
      >
        <div className="flex flex-col w-full">
          <h2 className="text-3xl font-bold mb-4 text-black">{selectedYear} Events</h2>
          <button onClick={closeModal} className="text-red-500 mb-4">Close</button>
          <div className="flex space-x-4 overflow-x-auto">
            {selectedYear && groupedEvents[selectedYear].map((event) => (
              <div key={event.id} className="min-w-[200px] bg-gray-100 p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-xl text-[#0f8686]">{event.title}</h3>
                <p>Start: {new Date(event.start).toLocaleString()}</p>
                <p>End: {new Date(event.end).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Semester; 