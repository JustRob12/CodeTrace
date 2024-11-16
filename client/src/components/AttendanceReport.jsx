import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FaFileDownload, FaSearch, FaCalendarAlt, FaUserGraduate, FaFilter } from 'react-icons/fa';

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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative bg-[#0f8686] pt-8 pb-16">
            <div className="relative z-10 text-center px-6">
              <FaFileDownload className="mx-auto text-white/90 text-4xl mb-2" />
              <h2 className="text-2xl font-bold text-white mb-1">
                Attendance Report
              </h2>
              <p className="text-white/80 text-sm">
                Generate and export attendance reports
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              </svg>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Search Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Student ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchId}
                    onChange={handleSearchChange}
                    placeholder="Enter Student ID"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Event Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event
                </label>
                <div className="relative">
                  <select
                    value={selectedEvent}
                    onChange={handleEventChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200 appearance-none"
                  >
                    <option value="">All Events</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Year
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200 appearance-none"
                  >
                    <option value="">All Years</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <FaUserGraduate className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExportPDF}
                disabled={filteredRecords.length === 0}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-medium transition duration-200 ${
                  filteredRecords.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#0f8686] text-white hover:bg-[#0a6565]'
                }`}
              >
                <FaFileDownload className="text-lg" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative bg-[#0f8686] pt-8 pb-16">
            <div className="relative z-10 text-center px-6">
              <FaFilter className="mx-auto text-white/90 text-4xl mb-2" />
              <h2 className="text-2xl font-bold text-white mb-1">
                Filtered Results
              </h2>
              <p className="text-white/80 text-sm">
                {filteredRecords.length} records found
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              </svg>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-xl shadow-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No attendance records found.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((record, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
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
