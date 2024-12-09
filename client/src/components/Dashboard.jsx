import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import CountUp from "react-countup";
import { FaUser, FaChartPie, FaCalendarCheck, FaBell } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [studentCounts, setStudentCounts] = useState({
    firstYear: 0,
    secondYear: 0,
    thirdYear: 0,
    fourthYear: 0,
  });
  const [totalStudents, setTotalStudents] = useState(0);
  const [events, setEvents] = useState([]);
  const activeYear = localStorage.getItem('activeYear');

  useEffect(() => {
    fetchStudentCounts();
    fetchEvents();
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

  // Update chart colors
  const data = {
    labels: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    datasets: [{
      label: "Student Counts",
      data: [
        studentCounts.firstYear,
        studentCounts.secondYear,
        studentCounts.thirdYear,
        studentCounts.fourthYear,
      ],
      backgroundColor: [
        "#FCD34D", // yellow-400 for 1st year
        "#34D399", // green-400 for 2nd year
        "#60A5FA", // blue-400 for 3rd year
        "#F87171", // red-400 for 4th year
      ],
      borderColor: ["white"],
      borderWidth: 2,
    }],
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

  // Add this helper function to check if an event is today
  const isEventToday = (eventDate) => {
    const today = new Date();
    const eventDay = new Date(eventDate);
    return eventDay.toDateString() === today.toDateString();
  };

  // Modify the Events Section to sort today's events first
  const sortEventsByToday = (events) => {
    if (!events) return [];
    
    return [...events].sort((a, b) => {
      const isEventTodayA = isEventToday(a.start);
      const isEventTodayB = isEventToday(b.start);
      
      if (isEventTodayA && !isEventTodayB) return -1;
      if (!isEventTodayA && isEventTodayB) return 1;
      
      // If both events are today or both are not today, sort by start time
      return new Date(a.start) - new Date(b.start);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-teal-700">CodeTrace Dashboard</h1>
              <p className="text-gray-600">Manage student data and events efficiently</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
              <div className="flex items-center gap-4">
                <FaUser className="text-teal-600 text-3xl" />
                <div>
                  <p className="text-sm text-teal-600">Total Students</p>
                  <span className="text-2xl font-bold text-teal-700">
                    <CountUp start={0} end={totalStudents} duration={2} separator="," />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Year-wise Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(studentCounts).map(([key, value]) => {
              const yearLabels = {
                firstYear: "1st Year",
                secondYear: "2nd Year",
                thirdYear: "3rd Year",
                fourthYear: "4th Year"
              };
              return (
                <div key={key} 
                     className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 p-4 rounded-lg border border-teal-100">
                  <p className="text-teal-600 text-sm font-medium">{yearLabels[key]}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xl font-bold text-teal-700">
                      <CountUp start={0} end={value} duration={1.5} />
                    </span>
                    <FaUser className="text-teal-500 text-xl" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts and Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-teal-100">
              <FaChartPie className="text-teal-600" />
              <h2 className="text-xl font-bold text-teal-700">Student Distribution</h2>
            </div>
            <div className="h-[300px]">
              <Pie data={data} options={options} />
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-teal-100">
              <FaCalendarCheck className="text-teal-600" />
              <h2 className="text-xl font-bold text-teal-700">
                {activeYear ? `${activeYear} Events` : 'No Active Semester Selected'}
              </h2>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {activeYear && sortEventsByToday(groupedEvents[activeYear])?.map((event) => {
                const isToday = isEventToday(event.start);
                
                return (
                  <div 
                    key={event.id} 
                    className={`bg-gradient-to-r ${
                      isToday 
                        ? 'from-teal-100 to-cyan-100 border-l-4 border-l-yellow-400' 
                        : 'from-teal-50 to-cyan-50'
                    } p-4 rounded-lg border border-teal-100 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${isToday ? 'text-black' : 'text-teal-700'}`}>
                        {event.title}
                      </h3>
                      {isToday && (
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                          <FaBell className="text-yellow-500 animate-pulse" size={12} />
                          <span className="text-xs font-medium text-yellow-700">Today</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={`font-medium ${isToday ? 'text-black' : 'text-teal-600'}`}>Start:</p>
                        <p className={isToday ? 'text-black' : 'text-gray-700'}>
                          {new Date(event.start).toLocaleDateString()}
                        </p>
                        <p className={isToday ? 'text-black' : 'text-gray-500'}>
                          {new Date(event.start).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className={`font-medium ${isToday ? 'text-black' : 'text-teal-600'}`}>End:</p>
                        <p className={isToday ? 'text-black' : 'text-gray-700'}>
                          {new Date(event.end).toLocaleDateString()}
                        </p>
                        <p className={isToday ? 'text-black' : 'text-gray-500'}>
                          {new Date(event.end).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!activeYear || !groupedEvents[activeYear]) && (
                <div className="text-center text-gray-500 py-4">
                  {activeYear ? 'No events found for this semester.' : 'Please select an active semester to view events.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
