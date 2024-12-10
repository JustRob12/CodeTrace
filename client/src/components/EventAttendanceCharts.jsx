import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EventAttendanceChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Attendance Count',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        borderRadius: 5,
        hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'Attendance Percentage',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        borderRadius: 5,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
        yAxisID: 'percentage'
      }
    ]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [eventsResponse, attendanceResponse, studentsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/events"),
        axios.get("http://localhost:5000/api/auth/attendance"),
        axios.get("http://localhost:5000/api/auth/students")
      ]);

      // Get total number of students
      const totalStudentsCount = studentsResponse.data.length;
      setTotalStudents(totalStudentsCount);

      const eventMap = eventsResponse.data.reduce((acc, event) => {
        acc[event.id] = event.title;
        return acc;
      }, {});

      const attendanceCounts = eventsResponse.data.reduce((acc, event) => {
        acc[event.id] = 0;
        return acc;
      }, {});

      // Count attendances
      attendanceResponse.data.forEach(record => {
        if (attendanceCounts[record.event_id] !== undefined) {
          attendanceCounts[record.event_id] += 1;
        }
      });

      const labels = Object.keys(eventMap).map(eventId => eventMap[eventId]);
      const attendanceData = Object.keys(eventMap).map(eventId => attendanceCounts[eventId]);
      const percentageData = attendanceData.map(count => 
        ((count / totalStudentsCount) * 100).toFixed(1)
      );

      setChartData({
        labels,
        datasets: [
          {
            label: 'Attendance Count',
            data: attendanceData,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            borderRadius: 5,
            hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
          },
          {
            label: 'Attendance Percentage',
            data: percentageData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            borderRadius: 5,
            hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
            yAxisID: 'percentage'
          }
        ]
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 14,
          }
        }
      },
      title: {
        display: true,
        text: 'Event Attendance Overview',
        color: '#0f8686',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            if (datasetLabel === 'Attendance Count') {
              return `Students: ${value} out of ${totalStudents}`;
            } else {
              return `Percentage: ${value}%`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        ticks: {
          stepSize: 50,
          color: '#666',
          font: {
            size: 12,
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: true,
          text: 'Number of Students',
          color: '#666',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      percentage: {
        beginAtZero: true,
        position: 'right',
        min: 0,
        max: 100,
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Attendance Percentage',
          color: '#666',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-teal-600">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="h-[400px] p-4 bg-white rounded-lg shadow-lg">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default EventAttendanceChart;