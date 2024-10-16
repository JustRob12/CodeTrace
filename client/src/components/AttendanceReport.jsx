import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const AttendanceReport = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [events, setEvents] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    fetchAttendanceRecords();
    fetchEvents();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/reports");
      setAttendanceRecords(response.data);
      setFilteredRecords(response.data); // Initialize filtered records
      extractUniqueYears(response.data);
    } catch (error) {
      toast.error("Error fetching attendance reports.");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/events");
      setEvents(response.data);
    } catch (error) {
      toast.error("Error fetching events.");
    }
  };

  const extractUniqueYears = (records) => {
    const uniqueYears = [...new Set(records.map((record) => record.year))];
    setYears(uniqueYears);
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    applyFilters(eventId, selectedYear, searchId);
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    applyFilters(selectedEvent, year, searchId);
  };

  const handleSearchChange = (e) => {
    const id = e.target.value;
    setSearchId(id);
    applyFilters(selectedEvent, selectedYear, id);
  };

  const applyFilters = (eventId, year, studentId) => {
    const filtered = attendanceRecords.filter((record) => {
      const matchesEvent = eventId ? record.event_id === parseInt(eventId) : true;
      const matchesYear = year ? record.year === parseInt(year) : true;
      const matchesStudentId = studentId ? record.studentId.includes(studentId) : true; // Use includes for partial match
      return matchesEvent && matchesYear && matchesStudentId;
    });
    setFilteredRecords(filtered);
  };

  const getEventTitle = (eventId) => {
    const event = events.find((event) => event.id === parseInt(eventId));
    return event ? event.title : "Unknown Event";
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const eventTitle = getEventTitle(selectedEvent);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>${eventTitle} - Attendance Report</h2>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Year</th>
                <th>Check-in Time</th>
                <th>Check-out Time</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(record => `
                <tr>
                  <td>${eventTitle}</td>
                  <td>${record.studentId}</td>
                  <td>${record.firstname} ${record.middlename || ''} ${record.lastname}</td>
                  <td>${record.year}</td>
                  <td>${new Date(record.checkInTime).toLocaleString("en-US")}</td>
                  <td>${record.checkOutTime ? new Date(record.checkOutTime).toLocaleString("en-US") : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="flex flex-col items-center p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-bold mb-4">Attendance Report</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-4 w-full">
        {/* Student ID Search */}
        <div className="flex-1">
          <label className="block mb-2 text-lg font-medium">Search Student ID</label>
          <input
            type="text"
            value={searchId}
            onChange={handleSearchChange}
            placeholder="Enter Student ID"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Event Filter */}
        <div className="flex-1">
          <label className="block mb-2 text-lg font-medium">Select Event</label>
          <select
            value={selectedEvent}
            onChange={handleEventChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex-1">
          <label className="block mb-2 text-lg font-medium">Select Year</label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Years</option>
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Print Button */}
      <div className="mb-4">
        <button 
          onClick={handlePrint} 
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          disabled={!selectedEvent}
        >
          Print Attendance Report
        </button>
      </div>

      {/* Attendance Records Table */}
      <div className="w-full mt-6">
        <div className="border border-gray-300 rounded-md p-4 h-64 overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <p>No attendance records available.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b p-2">Event</th>
                  <th className="border-b p-2">Student ID</th>
                  <th className="border-b p-2">Full Name</th>
                  <th className="border-b p-2">Year</th>
                  <th className="border-b p-2">Check-in</th>
                  <th className="border-b p-2">Check-out</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={index}>
                    <td className="border-b p-2">{getEventTitle(record.event_id)}</td>
                    <td className="border-b p-2">{record.studentId}</td>
                    <td className="border-b p-2">
                      {record.firstname}{" "}
                      {record.middlename ? `${record.middlename} ` : ""}
                      {record.lastname}
                    </td>
                    <td className="border-b p-2">{record.year}</td>
                    <td className="border-b p-2">
                      {new Date(record.checkInTime).toLocaleString("en-US")}
                    </td>
                    <td className="border-b p-2">
                      {record.checkOutTime
                        ? new Date(record.checkOutTime).toLocaleString("en-US")
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
