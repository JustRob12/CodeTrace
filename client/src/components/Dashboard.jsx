import "@fortawesome/fontawesome-free/css/all.min.css"; // FontAwesome icons
import axios from "axios";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import CountUp from "react-countup"; // Import CountUp

// Register required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [studentCounts, setStudentCounts] = useState({
    firstYear: 0,
    secondYear: 0,
    thirdYear: 0,
    fourthYear: 0,
  });

  const [totalStudents, setTotalStudents] = useState(0); // For total count animation
  const [events, setEvents] = useState([]); // State for events

  const activeYear = localStorage.getItem('activeYear');

  useEffect(() => {
    fetchStudentCounts();
    fetchEvents(); // Fetch events on component mount
  }, []);

  const fetchStudentCounts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/counts");
      const counts = {
        firstYear: 0,
        secondYear: 0,
        thirdYear: 0,
        fourthYear: 0,
      };

      response.data.forEach((item) => {
        if (item.year === 1) counts.firstYear = item.count;
        if (item.year === 2) counts.secondYear = item.count;
        if (item.year === 3) counts.thirdYear = item.count;
        if (item.year === 4) counts.fourthYear = item.count;
      });

      setStudentCounts(counts);
      const total =
        counts.firstYear +
        counts.secondYear +
        counts.thirdYear +
        counts.fourthYear;
      setTotalStudents(total); // Set total for animated counter
    } catch (error) {
      console.error("Error fetching student counts:", error);
    }
  };

  // New function to fetch events
  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/events"); // Adjust this URL as needed
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const data = {
    labels: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    datasets: [
      {
        label: "Student Counts",
        data: [
          studentCounts.firstYear,
          studentCounts.secondYear,
          studentCounts.thirdYear,
          studentCounts.fourthYear,
        ],
        backgroundColor: ["#18e1e7", "#15b8bc", "#129fa0", "#0f8686"], // Shades of teal
        borderColor: ["#0f8686", "#0c7575", "#0a6464", "#084c4c"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  // Group events by academic year
  const groupedEvents = events.reduce((acc, event) => {
    const startYear = new Date(event.start).getFullYear();
    const academicYear = `${startYear}-${startYear + 1}`;
    if (!acc[academicYear]) {
      acc[academicYear] = [];
    }
    acc[academicYear].push(event);
    return acc;
  }, {});

  // Sort academic years in descending order
  const sortedAcademicYears = Object.keys(groupedEvents).sort((a, b) => {
    const yearA = parseInt(a.split('-')[0], 10);
    const yearB = parseInt(b.split('-')[0], 10);
    return yearB - yearA;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-4xl font-bold mb-6 text-black">Welcome to the Dashboard</h1>
        <p className="text-gray-600 mb-6">Manage student data and events efficiently.</p>

        <div className="flex gap-8 mt-6">
          {/* Left Section: Total Students Count */}
          <div className="w-1/4">
            <div className="bg-[#18e1e7] p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-center mb-2 text-black">
                Total Students
              </h2>
              <p className="text-5xl font-bold text-center text-black">
                <CountUp
                  start={0}
                  end={totalStudents}
                  duration={2}
                  separator=","
                />
              </p>
            </div>
          </div>

          {/* Student Count Boxes and Pie Chart Section */}
          <div className="flex-1 flex gap-8">
            {/* Student Count Boxes */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {Object.entries(studentCounts).map(([key, value], index) => {
                const colors = [
                  "bg-[#18e1e7]",
                  "bg-[#15b8bc]",
                  "bg-[#129fa0]",
                  "bg-[#0f8686]",
                ];
                return (
                  <div key={key} className={`${colors[index]} text-white p-4 rounded-lg shadow-lg flex items-center`}>
                    <i className="fas fa-user-graduate text-4xl mr-4"></i>
                    <div>
                      <h2 className="text-sm capitalize">{`${key.charAt(0).toUpperCase() + key.slice(1)} Students`}</h2>
                      <p className="text-3xl font-bold">
                        <CountUp
                          start={0}
                          end={value}
                          duration={1.5}
                        />
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pie Chart */}
            <div className="flex justify-center items-center">
              <div style={{ width: "250px", height: "250px" }}>
                <h2 className="text-xl font-semibold mb-4 text-center text-black">
                  Student Distribution by Year
                </h2>
                <Pie data={data} options={options} />
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-6 text-black text-center">
            {activeYear ? `${activeYear} Events` : 'No Active Semester Selected'}
          </h2>

          {activeYear && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedEvents[activeYear]?.map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-start transition-transform transform hover:scale-105 cursor-pointer"
                >
                  <h3 className="font-bold text-xl text-[#0f8686] mb-2">{event.title}</h3>
                  <div className="text-sm mb-3 text-gray-700">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold mr-2">Start:</span>
                      <div className="flex flex-col">
                        <span className="text-lg font-medium">{new Date(event.start).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500">{new Date(event.start).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">End:</span>
                      <div className="flex flex-col">
                        <span className="text-lg font-medium">{new Date(event.end).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500">{new Date(event.end).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
