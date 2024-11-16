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
      setCheckInRecords(swapFirstAndLast(response.data));
    } catch (error) {
      toast.error("Error fetching check-in records.");
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative bg-[#0f8686] pt-8 pb-16">
                <div className="relative z-10 text-center px-6">
                  <FaQrcode className="mx-auto text-white/90 text-4xl mb-2" />
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Attendance Scanner
                  </h2>
                  <p className="text-white/80 text-sm">
                    Scan QR codes for attendance
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                    <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                  </svg>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Event
                    </label>
                    <select
                      value={selectedEvent}
                      onChange={handleEventChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f8686] focus:border-transparent transition duration-200"
                    >
                      <option value="" disabled>
                        -- Select an Event --
                      </option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEvent && scannerActive && (
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <QrReader
                        onResult={(result, error) => {
                          if (result) handleScan(result);
                          if (error?.name !== "NotFoundError") console.error(error);
                        }}
                        className="w-full"
                        constraints={{ facingMode: "environment" }}
                      />
                    </div>
                  )}

                  {scanStatus && (
                    <div
                      className={`p-3 rounded-xl text-white text-center font-medium ${
                        scanStatus === "Success!" ? "bg-green-500" : "bg-[#0f8686]"
                      }`}
                    >
                      {scanStatus}
                    </div>
                  )}

                  <button
                    onClick={handleCloseScanner}
                    className="w-full bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition duration-200 flex items-center justify-center space-x-2"
                  >
                    <FaUserCheck className="text-lg" />
                    <span>Close Scanner</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in Records Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative bg-[#0f8686] pt-8 pb-16">
                <div className="relative z-10 text-center px-6">
                  <FaHistory className="mx-auto text-white/90 text-4xl mb-2" />
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Check-in Records
                  </h2>
                  <p className="text-white/80 text-sm">
                    View attendance history
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
                              Student ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check-in
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check-out
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {checkInRecords.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                No check-in records available.
                              </td>
                            </tr>
                          ) : (
                            checkInRecords.map((record, index) => (
                              <tr key={index} className="hover:bg-gray-50">
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
