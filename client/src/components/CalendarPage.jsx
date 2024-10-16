import dayGridPlugin from "@fullcalendar/daygrid"; // Import the DayGrid plugin
import interactionPlugin from "@fullcalendar/interaction"; // Import the Interaction plugin
import FullCalendar from "@fullcalendar/react"; // Import the FullCalendar component
import timeGridPlugin from "@fullcalendar/timegrid"; // Import the TimeGrid plugin for week/day views
import axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "react-modal"; // Import the Modal component
import "./CalendarPage.css"; // Import the CSS for custom styles

// Set app element for accessibility
Modal.setAppElement("#root"); // Change '#root' to your main app element if necessary

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to control modal visibility
  const [selectedEvent, setSelectedEvent] = useState(null); // State for the selected event

  // Fetch events on component mount
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

  // Render form inputs
  const renderEventForm = () => (
    <div className="flex flex-col items-start space-y-4 bg-white p-6 rounded-lg shadow-md">
      <input
        type="text"
        placeholder="Event Title"
        value={eventTitle}
        onChange={(e) => setEventTitle(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="datetime-local"
        value={eventStart}
        onChange={(e) => setEventStart(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="datetime-local"
        value={eventEnd}
        onChange={(e) => setEventEnd(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleSaveEvent}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Save Event
      </button>
    </div>
  );

  return (
    <div className="flex">
      <div className="w-1/3 p-4">
        <h2 className="text-2xl font-bold mb-4">Event Calendar</h2>
        {renderEventForm()}
      </div>
      <div className="flex-1 p-4">
        {/* FullCalendar Component */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Register plugins
          initialView="dayGridMonth" // Set initial view to month
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay", // Add buttons for different views
          }}
          events={events} // Pass events to the calendar
          eventClick={(info) => openModal(info.event)} // Open modal on click
          eventContent={(eventInfo) => (
            <div>
              <strong>{eventInfo.event.title}</strong> {/* Show only title */}
            </div>
          )}
        />
      </div>

      {/* Modal for event details */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modal-content p-4">
          <h2 className="text-xl font-semibold mb-2">Event Details</h2>
          {selectedEvent ? (
            <div className="event-details">
              <p>
                <strong>Title:</strong> {selectedEvent.title}
              </p>
              <p>
                <strong>Start:</strong> {selectedEvent.start.toISOString()}
              </p>
              <p>
                <strong>End:</strong> {selectedEvent.end.toISOString()}
              </p>
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="mt-4 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-300"
              >
                Delete Event
              </button>
            </div>
          ) : (
            <p>Loading...</p>
          )}
          <button
            onClick={closeModal}
            className="mt-4 bg-gray-300 text-black p-2 rounded-md hover:bg-gray-400 transition duration-300"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarPage;
