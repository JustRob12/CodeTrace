import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const AttendanceReport = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/reports");
      setAttendanceRecords(response.data);
    } catch (error) {
      toast.error("Error fetching attendance reports.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-bold mb-4">Attendance Report</h2>

      <div className="w-full mt-6">
        <div className="border border-gray-300 rounded-md p-4 h-64 overflow-y-auto">
          {attendanceRecords.length === 0 ? (
            <p>No attendance records available.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b p-2">Event ID</th>
                  <th className="border-b p-2">Student ID</th>
                  <th className="border-b p-2">Full Name</th> {/* New column for full name */}
                  <th className="border-b p-2">Check-in Time</th>
                  <th className="border-b p-2">Check-out Time</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={index}>
                    <td className="border-b p-2">{record.event_id}</td>
                    <td className="border-b p-2">{record.studentId}</td>
                    <td className="border-b p-2">
                      {record.firstname} {record.middlename ? `${record.middlename} ` : ''}{record.lastname}
                    </td> {/* Display full name */}
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
