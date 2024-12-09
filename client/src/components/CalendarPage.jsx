import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaCalendarAlt, FaPlus, FaClock, FaTrash, FaBell } from 'react-icons/fa';
import "./CalendarPage.css";
import Swal from "sweetalert2";

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
        event_description: null,
        event_start: eventStart,
        event_end: eventEnd,
      };

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/event",
          newEvent
        );
        const addedEvent = {
          id: response.data.id,
          title: response.data.event_name,
          start: response.data.event_start,
          end: response.data.event_end,
        };
        setEvents((prevEvents) => [...prevEvents, addedEvent]);
        clearForm();

        // Show success message and wait for it to close
        await Swal.fire({
          title: 'Success!',
          text: 'Event has been added successfully!',
          icon: 'success',
          confirmButtonColor: '#0f8686'
        });

        // Reload page after alert is closed
        window.location.reload();
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to add event.',
          icon: 'error',
          confirmButtonColor: '#0f8686'
        });
      }
    } else {
      Swal.fire({
        title: 'Warning!',
        text: 'Please fill in all required fields.',
        icon: 'warning',
        confirmButtonColor: '#0f8686'
      });
    }
  };

  // Handle event deletion with confirmation
  const handleDeleteEvent = async (id) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f8686',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    // If user confirms deletion
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/event/${id}`);
        setEvents(events.filter((event) => event.id !== id));
        closeModal();

        // Show success message
        await Swal.fire({
          title: 'Deleted!',
          text: 'Your event has been deleted.',
          icon: 'success',
          confirmButtonColor: '#0f8686'
        });

        // Reload the page after deletion
        window.location.reload();
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the event.',
          icon: 'error',
          confirmButtonColor: '#0f8686'
        });
      }
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

  // Add this function to customize event rendering
  const renderEventContent = (eventInfo) => {
    const isToday = new Date(eventInfo.event.start).toDateString() === new Date().toDateString();
    const now = new Date();
    const isOngoing = new Date(eventInfo.event.start) <= now && now <= new Date(eventInfo.event.end);

    return (
      <div className={`event-content ${isToday || isOngoing ? 'highlight-event' : ''}`}>
        <div className="flex items-center gap-2">
          {(isToday || isOngoing) && <FaBell className="text-yellow-500 animate-pulse" />}
          <FaCalendarAlt className={isToday || isOngoing ? "text-white" : "text-teal-600"} />
          <span className={isToday || isOngoing ? "text-white font-semibold" : ""}>{eventInfo.event.title}</span>
        </div>
        {(isToday || isOngoing) && (
          <div className="text-xs text-white font-medium">
            {isToday ? 'Today' : 'Ongoing'} at {new Date(eventInfo.event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
                <div className="text-center">
                  <FaCalendarAlt className="mx-auto text-white/90 text-3xl mb-2" />
                  <h2 className="text-2xl font-bold text-white mb-1">Add New Event</h2>
                  <p className="text-white/80 text-sm">Schedule your events here</p>
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
                      className="w-full px-4 py-2.5 border border-teal-100 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      value={eventStart}
                      onChange={(e) => setEventStart(e.target.value)}
                      className="w-full px-4 py-2.5 border border-teal-100 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={eventEnd}
                      onChange={(e) => setEventEnd(e.target.value)}
                      className="w-full px-4 py-2.5 border border-teal-100 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                  <button
                    onClick={handleSaveEvent}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-2.5 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition duration-200 flex items-center justify-center space-x-2"
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  className="rounded-lg overflow-hidden"
                  eventContent={renderEventContent}
                  eventClassNames={(arg) => {
                    const isToday = new Date(arg.event.start).toDateString() === new Date().toDateString();
                    return isToday ? 'today-event-highlight' : '';
                  }}
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
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full mx-auto">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
              <div className="text-center">
                <FaClock className="mx-auto text-white/90 text-3xl mb-2" />
                <h2 className="text-2xl font-bold text-white mb-1">Event Details</h2>
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
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition duration-200 flex items-center justify-center space-x-2"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition duration-200"
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
