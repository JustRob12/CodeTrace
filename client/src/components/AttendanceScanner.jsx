import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { QrReader } from "react-qr-reader";
import { FaQrcode, FaUserCheck, FaHistory } from 'react-icons/fa';

const AttendanceScanner = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [checkInRecords, setCheckInRecords] = useState([]);
  const lastScannedId = useRef("");
  const cooldownRef = useRef(false);
  const [scanStatus, setScanStatus] = useState("");
  const [scannerActive, setScannerActive] = useState(true);
  const [activeYear, setActiveYear] = useState(localStorage.getItem('activeYear') || null);

  const swapFirstAndLast = (arr) => {
    if (arr.length < 2) return arr;
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    return arr;
  };

  useEffect(() => {
    fetchEvents();
    fetchCheckInRecords();
  }, []);

  const fetchCheckInRecords = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/attendance");
      const sortedRecords = response.data.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
      setCheckInRecords(sortedRecords);
    } catch (error) {
      toast.error("Error fetching check-in records.");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/events");
      const filteredEvents = response.data.filter(event => {
        const startYear = new Date(event.start).getFullYear();
        const academicYear = `${startYear}-${startYear + 1}`;
        return academicYear === activeYear;
      });
      setEvents(filteredEvents);
    } catch (error) {
      toast.error("Error fetching events.");
    }
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
    lastScannedId.current = "";
    setScanStatus("");
  };

  const handleScan = async (data) => {
    if (!data || !selectedEvent || cooldownRef.current) return;

    const studentId = data.text;
    cooldownRef.current = true;
    setScanStatus("Scanning...");

    try {
      if (studentId === lastScannedId.current) {
        await handleCheckOut(studentId);
      } else {
        const hasCheckedIn = checkInRecords.some(
          (record) => record.studentId === studentId && record.eventId === selectedEvent
        );

        if (!hasCheckedIn) {
          await handleCheckIn(studentId);
        } else {
          toast.error("Student is already checked in for this event.");
        }
      }

      lastScannedId.current = studentId;
      setScanStatus("Success!");
      setTimeout(() => setScanStatus(""), 2000);
    } finally {
      setTimeout(() => {
        cooldownRef.current = false;
      }, 3000);
    }
  };

  const handleCheckIn = async (studentId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/attendance/checkin", {
        studentId,
        eventId: selectedEvent,
      });

      if (response.status === 201) {
        fetchCheckInRecords();
        toast.success("Check-in successful!");
      } else {
        toast.error("Student not found.");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("You are already Attendance in this event");
    }
  };

  const handleCheckOut = async (studentId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/attendance/checkout", {
        studentId,
        eventId: selectedEvent,
      });

      if (response.status === 200) {
        fetchCheckInRecords();
        toast.success("Check-out successful!");
      } else {
        toast.error("Check-out failed. Ensure you have checked in first.");
      }
    } catch (error) {
      toast.error("You are already Attendance in this event");
    }
  };

  const handleCloseScanner = () => {
    setScannerActive(false);  // Stop the scanner
    setTimeout(() => window.location.reload(), 1000); // Refresh the page after a short delay
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
                <div className="text-center">
                  <FaQrcode className="mx-auto text-white/90 text-3xl mb-2" />
                  <h2 className="text-2xl font-bold text-white mb-1">
                    QR Scanner
                  </h2>
                  <p className="text-white/80 text-sm">
                    Scan student QR codes for attendance
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event
                  </label>
                  <select
                    value={selectedEvent}
                    onChange={handleEventChange}
                    className="w-full p-3 border border-teal-100 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  >
                    {!activeYear ? (
                      <option value="">Please activate a semester first</option>
                    ) : events.length === 0 ? (
                      <option value="">No events in active semester</option>
                    ) : (
                      <>
                        <option value="">Select an event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {selectedEvent && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <QrReader
                        onResult={handleScan}
                        constraints={{ facingMode: "environment" }}
                        className="w-full"
                      />
                    </div>

                    {scanStatus && (
                      <div
                        className={`p-3 rounded-lg text-white text-center font-medium ${
                          scanStatus === "Success!" 
                            ? "bg-gradient-to-r from-green-500 to-green-600" 
                            : "bg-gradient-to-r from-teal-600 to-cyan-600"
                        }`}
                      >
                        {scanStatus}
                      </div>
                    )}

                    <button
                      onClick={handleCloseScanner}
                      className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition duration-200 flex items-center justify-center space-x-2"
                    >
                      <FaUserCheck className="text-lg" />
                      <span>Close Scanner</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Check-in Records Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
                <div className="text-center">
                  <FaHistory className="mx-auto text-white/90 text-3xl mb-2" />
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Check-in Records
                  </h2>
                  <p className="text-white/80 text-sm">
                    View attendance history
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden rounded-lg border border-teal-100">
                      <table className="min-w-full divide-y divide-teal-100">
                        <thead className="bg-teal-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                              Student ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                              Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                              Check-in
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                              Check-out
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-teal-100">
                          {checkInRecords.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                No check-in records available.
                              </td>
                            </tr>
                          ) : (
                            checkInRecords.map((record, index) => (
                              <tr key={index} className="hover:bg-teal-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {record.studentId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {`${record.firstName} ${record.middleName || ''} ${record.lastName}`}
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
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default AttendanceScanner;
