import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FaFileDownload, FaSearch, FaCalendarAlt, FaUserGraduate, FaFilter, FaGraduationCap } from 'react-icons/fa';

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
    const printWindow = window.open("", "_blank");
    const eventTitle = getEventTitle(selectedEvent);
  
    const printContent = `
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
              ${filteredRecords
                .map(
                  (record) => `
                    <tr>
                      <td>${eventTitle}</td>
                      <td>${record.studentId}</td>
                      <td>${record.firstname} ${record.middlename || ""} ${record.lastname}</td>
                      <td>${record.year}</td>
                      <td>${new Date(record.checkInTime).toLocaleString("en-US")}</td>
                      <td>${record.checkOutTime ? new Date(record.checkOutTime).toLocaleString("en-US") : "N/A"}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
  
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  
    printWindow.onload = () => {
      printWindow.focus(); // Ensure the window is focused before printing
      printWindow.print();
      printWindow.close();
    };
  };
  

  // Function to handle PDF export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const eventTitle = getEventTitle(selectedEvent);
    
    doc.setFontSize(18);
    doc.text(`${eventTitle} - Attendance Report`, 14, 22);
    
    // Add a table
    doc.autoTable({
      head: [['Event', 'Student ID', 'Full Name', 'Year', 'Check-in Time', 'Check-out Time']],
      body: filteredRecords.map((record) => [
        eventTitle,
        record.studentId,
        `${record.firstname} ${record.middlename || ""} ${record.lastname}`,
        record.year,
        new Date(record.checkInTime).toLocaleString("en-US"),
        record.checkOutTime ? new Date(record.checkOutTime).toLocaleString("en-US") : "N/A",
      ]),
      startY: 30,
    });

    // Save the PDF
    doc.save('attendance_report.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
            <div className="text-center">
              <FaFilter className="mx-auto text-white/90 text-3xl mb-2" />
              <h2 className="text-2xl font-bold text-white mb-1">
                Attendance Report
              </h2>
              <p className="text-white/80 text-sm">
                Filter and download attendance records
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline-block mr-2 text-teal-600" />
                  Select Event
                </label>
                <select
                  value={selectedEvent}
                  onChange={handleEventChange}
                  className="w-full p-3 border border-teal-100 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaGraduationCap className="inline-block mr-2 text-teal-600" />
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full p-3 border border-teal-100 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student ID Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaSearch className="inline-block mr-2 text-teal-600" />
                  Search Student ID
                </label>
                <input
                  type="text"
                  value={searchId}
                  onChange={handleSearchChange}
                  placeholder="Enter Student ID"
                  className="w-full p-3 border border-teal-100 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                />
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-6">
              <button
                onClick={handleExportPDF}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition duration-200 flex items-center justify-center space-x-2"
              >
                <FaFileDownload className="text-lg" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-lg border border-teal-100">
                  <table className="min-w-full divide-y divide-teal-100">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                          Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                          Check-in Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                          Check-out Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-teal-100">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            No attendance records found.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((record, index) => (
                          <tr key={index} className="hover:bg-teal-50 transition duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getEventTitle(record.event_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.studentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {`${record.firstname} ${record.middlename || ""} ${record.lastname}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.checkInTime).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.checkOutTime
                                ? new Date(record.checkOutTime).toLocaleString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default AttendanceReport;
