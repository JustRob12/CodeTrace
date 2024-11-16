import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaCalendarAlt, FaPlus, FaClock, FaTrash } from 'react-icons/fa';
import "./CalendarPage.css";

Modal.setAppElement("#root");

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch all events from the API
  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/events");
      console.log("API Response:", response.data); // Log the API response
      const formattedEvents = response.data.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error(
        "Error fetching events:",
        error.response?.data || error.message
      );
    }
  };

  // Handle event creation
  const handleSaveEvent = async () => {
    if (eventTitle && eventStart && eventEnd) {
      const newEvent = {
        event_name: eventTitle,
        event_description: null, // Set description to null
        event_start: eventStart,
        event_end: eventEnd,
      };

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/event",
          newEvent
        );
        const addedEvent = {
          id: response.data.id, // Ensure your backend returns the event ID
          title: response.data.event_name,
          start: response.data.event_start,
          end: response.data.event_end,
        };
        setEvents((prevEvents) => [...prevEvents, addedEvent]); // Append new event
        clearForm(); // Clear input fields after saving
      } catch (error) {
        console.error(
          "Error saving event:",
          error.response?.data || error.message
        );
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/event/${id}`);
      setEvents(events.filter((event) => event.id !== id)); // Remove event from the list
      closeModal(); // Close the modal after deletion
    } catch (error) {
      console.error(
        "Error deleting event:",
        error.response?.data || error.message
      );
    }
  };

  // Open modal with event details
  const openModal = (event) => {
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  // Clear form after adding an event
  const clearForm = () => {
    setEventTitle("");
    setEventStart("");
    setEventEnd("");
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative bg-[#0f8686] pt-8 pb-16">
                <div className="relative z-10 text-center px-6">
                  <FaCalendarAlt className="mx-auto text-white/90 text-3xl mb-2" />
                  <h2 className="text-2xl font-bold text-white mb-1">Add New Event</h2>
                  <p className="text-white/80 text-sm">Schedule your events here</p>
                </div>
                {/* Wave effect */}
                <div className="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                    <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                  </svg>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <input
                      type="text"
                      placeholder="Enter event title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      value={eventStart}
                      onChange={(e) => setEventStart(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={eventEnd}
                      onChange={(e) => setEventEnd(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                    />
                  </div>
                  <button
                    onClick={handleSaveEvent}
                    className="w-full bg-[#0f8686] text-white py-2.5 rounded-xl font-medium hover:bg-[#0a6565] transition duration-200 flex items-center justify-center space-x-2"
                  >
                    <FaPlus className="text-lg" />
                    <span>Add Event</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  events={events}
                  eventClick={(info) => openModal(info.event)}
                  height="auto"
                  className="rounded-xl overflow-hidden shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className="modal"
          overlayClassName="overlay"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full mx-auto">
            <div className="relative bg-[#0f8686] pt-8 pb-16">
              <div className="relative z-10 text-center px-6">
                <FaClock className="mx-auto text-white/90 text-3xl mb-2" />
                <h2 className="text-2xl font-bold text-white mb-1">Event Details</h2>
              </div>
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                  <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                </svg>
              </div>
            </div>

            <div className="p-6">
              {selectedEvent && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedEvent.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="text-gray-900">{new Date(selectedEvent.start).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="text-gray-900">{new Date(selectedEvent.end).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition duration-200 flex items-center justify-center space-x-2"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-xl font-medium hover:bg-gray-300 transition duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CalendarPage;
