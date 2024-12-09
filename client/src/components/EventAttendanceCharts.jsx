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
    datasets: [{
      label: 'Number of Students',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      borderRadius: 5,
      hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
    }]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [eventsResponse, attendanceResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/events"),
        axios.get("http://localhost:5000/api/auth/attendance")
      ]);

      const eventMap = eventsResponse.data.reduce((acc, event) => {
        acc[event.id] = event.title;
        return acc;
      }, {});

      const attendanceCounts = eventsResponse.data.reduce((acc, event) => {
        acc[event.id] = 0;
        return acc;
      }, {});

      attendanceResponse.data.forEach(record => {
        if (attendanceCounts[record.event_id] !== undefined) {
          attendanceCounts[record.event_id] += 1;
        }
      });

      const labels = Object.keys(eventMap).map(eventId => eventMap[eventId]);
      const data = Object.keys(eventMap).map(eventId => attendanceCounts[eventId]);

      setChartData({
        labels,
        datasets: [{
          label: 'Number of Students',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          borderRadius: 5,
          hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
        }]
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
            return `Students: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
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