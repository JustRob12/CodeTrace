import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { QrReader } from "react-qr-reader";

const AttendanceScanner = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [checkInRecords, setCheckInRecords] = useState([]);
  const lastScannedId = useRef("");
  const cooldownRef = useRef(false);
  const [scanStatus, setScanStatus] = useState("");

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

  return (
    <div className="flex flex-row gap-6 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Left Side: Scanner */}
      <div className="w-1/3 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Attendance Scanner</h2>

        <div className="w-full max-w-sm mb-4">
          <label className="block mb-2 text-lg font-medium">Select Event</label>
          <select
            value={selectedEvent}
            onChange={handleEventChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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

        {selectedEvent && (
          <div className="w-full">
            <QrReader
              onResult={(result, error) => {
                if (result) handleScan(result);
                if (error?.name !== "NotFoundError") console.error(error);
              }}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {scanStatus && (
          <div
            className={`mt-4 p-2 rounded-md text-white ${
              scanStatus === "Scan Success!" ? "bg-green-500" : "bg-blue-500"
            }`}
          >
            {scanStatus}
          </div>
        )}
      </div>

      {/* Right Side: Check-in Records */}
      <div className="w-2/3">
        <h3 className="text-lg font-semibold mb-2">Check-in Records</h3>
        <div className="border border-gray-300 rounded-md p-4 h-96 overflow-y-auto">
          {checkInRecords.length === 0 ? (
            <p>No check-in records available.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b p-2">Student ID</th>
                  <th className="border-b p-2">First Name</th>
                  <th className="border-b p-2">Middle Name</th>
                  <th className="border-b p-2">Last Name</th>
                  <th className="border-b p-2">Year</th>
                  <th className="border-b p-2">Check-in</th>
                  <th className="border-b p-2">Check-out</th>
                </tr>
              </thead>
              <tbody>
                {checkInRecords.map((record, index) => (
                  <tr key={index}>
                    <td className="border-b p-2">{record.studentId}</td>
                    <td className="border-b p-2">{record.firstName}</td>
                    <td className="border-b p-2">{record.middleName || "N/A"}</td>
                    <td className="border-b p-2">{record.lastName}</td>
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

export default AttendanceScanner;
