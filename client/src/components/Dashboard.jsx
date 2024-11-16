import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import CountUp from "react-countup";
import { FaUserGraduate, FaChartPie, FaCalendarCheck } from 'react-icons/fa';

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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section with Total Students */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative bg-[#0f8686] pt-8 pb-16">
            <div className="relative z-10 px-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome to CodeTrace Dashboard
              </h1>
              <p className="text-white/80">
                Manage student data and events efficiently
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              </svg>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-[#064444] to-[#0f8686] rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-lg mb-2">Total Students</p>
                  <h2 className="text-4xl font-bold text-white">
                    <CountUp start={0} end={totalStudents} duration={2} separator="," />
                  </h2>
                </div>
                <FaUserGraduate className="text-white/80 text-5xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Year-wise Statistics Section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative bg-[#0f8686] pt-8 pb-16">
            <div className="relative z-10 px-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Year-wise Distribution
              </h2>
              <p className="text-white/80">
                Student count by academic year
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              </svg>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(studentCounts).map(([key, value], index) => {
                const colors = [
                  "from-[#18e1e7] to-[#15b8bc]",
                  "from-[#15b8bc] to-[#129fa0]",
                  "from-[#129fa0] to-[#0f8686]",
                  "from-[#0f8686] to-[#064444]",
                ];
                const yearLabels = {
                  firstYear: "1st Year",
                  secondYear: "2nd Year",
                  thirdYear: "3rd Year",
                  fourthYear: "4th Year"
                };
                return (
                  <div key={key} className={`bg-gradient-to-br ${colors[index]} p-6 rounded-2xl shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm mb-1">
                          {yearLabels[key]} Students
                        </p>
                        <h2 className="text-3xl font-bold text-white">
                          <CountUp start={0} end={value} duration={1.5} />
                        </h2>
                      </div>
                      <FaUserGraduate className="text-white/80 text-3xl" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart and Events Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative bg-[#0f8686] pt-8 pb-16">
              <div className="relative z-10 text-center">
                <FaChartPie className="mx-auto text-white/90 text-3xl mb-2" />
                <h2 className="text-2xl font-bold text-white">Student Distribution</h2>
              </div>
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                  <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                </svg>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[300px] flex items-center justify-center">
                <Pie data={data} options={options} />
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative bg-[#0f8686] pt-8 pb-16">
              <div className="relative z-10 text-center">
                <FaCalendarCheck className="mx-auto text-white/90 text-3xl mb-2" />
                <h2 className="text-2xl font-bold text-white">
                  {activeYear ? `${activeYear} Events` : 'No Active Semester Selected'}
                </h2>
              </div>
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white/90">
                  <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                </svg>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {activeYear && groupedEvents[activeYear]?.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/80 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <h3 className="font-bold text-lg text-[#0f8686] mb-2">{event.title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Start:</p>
                        <p>{new Date(event.start).toLocaleDateString()}</p>
                        <p className="text-gray-500">{new Date(event.start).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">End:</p>
                        <p>{new Date(event.end).toLocaleDateString()}</p>
                        <p className="text-gray-500">{new Date(event.end).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
    </div>
  );
};

export default Dashboard;
