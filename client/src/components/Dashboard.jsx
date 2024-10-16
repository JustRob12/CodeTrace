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

  useEffect(() => {
    fetchStudentCounts();
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
        backgroundColor: ["#3498db", "#2ecc71", "#f1c40f", "#e74c3c"],
        borderColor: ["#2980b9", "#27ae60", "#f39c12", "#c0392b"],
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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8 bg-white">
        <h1 className="text-3xl font-bold mb-6">Welcome to the Dashboard</h1>
        <p className="text-gray-600 mb-6">
       
        </p>

        <div className="flex gap-8 mt-6">
          {/* Left Section: Total Students Count */}
          <div className="w-1/4">
            <div className="bg-gray-200 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-center mb-2">
                Total Students
              </h2>
              <p className="text-4xl font-bold text-center text-gray-800">
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
              <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center">
                <i className="fas fa-user-graduate text-4xl mr-4"></i>
                <div>
                  <h2 className="text-sm">1st Year Students</h2>
                  <p className="text-3xl font-bold">
                    <CountUp
                      start={0}
                      end={studentCounts.firstYear}
                      duration={1.5}
                    />
                  </p>
                </div>
              </div>
              <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center">
                <i className="fas fa-user-graduate text-4xl mr-4"></i>
                <div>
                  <h2 className="text-sm">2nd Year Students</h2>
                  <p className="text-3xl font-bold">
                    <CountUp
                      start={0}
                      end={studentCounts.secondYear}
                      duration={1.5}
                    />
                  </p>
                </div>
              </div>
              <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg flex items-center">
                <i className="fas fa-user-graduate text-4xl mr-4"></i>
                <div>
                  <h2 className="text-sm">3rd Year Students</h2>
                  <p className="text-3xl font-bold">
                    <CountUp
                      start={0}
                      end={studentCounts.thirdYear}
                      duration={1.5}
                    />
                  </p>
                </div>
              </div>
              <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center">
                <i className="fas fa-user-graduate text-4xl mr-4"></i>
                <div>
                  <h2 className="text-sm">4th Year Students</h2>
                  <p className="text-3xl font-bold">
                    <CountUp
                      start={0}
                      end={studentCounts.fourthYear}
                      duration={1.5}
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* Smaller Pie Chart */}
            <div className="flex justify-center items-center">
              <div style={{ width: "250px", height: "250px" }}>
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Student Distribution by Year
                </h2>
                <Pie data={data} options={options} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
