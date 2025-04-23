import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import { Chart as ChartJS } from 'chart.js/auto';

const Performance = () => {
  const employeeId = localStorage.getItem("employeeId");
  const [taskData, setTaskData] = useState({
    assigned: 0,
    completed: 0,
    failed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      console.error('No employeeId available');
      return; // Don't fetch if employeeId is not available
    }

    console.log('Fetching task data for employeeId:', employeeId); // Check employeeId

    const fetchTaskData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tasks/employee/${employeeId}/counts`);
        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorDetails}`);
        }
    
        const data = await response.json();
        console.log("Fetched Task Data:", data);
    
        // Check if the data is in the expected format
        if (data && data.assigned !== undefined && data.completed !== undefined && data.failed !== undefined) {
          setTaskData(data);
        } else {
          console.error("Unexpected data structure:", data);
          setError('Unexpected data structure from the API.');
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
        setError('There was an issue fetching the task data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    

    fetchTaskData();
  }, [employeeId]);

  const { assigned, completed, failed } = taskData;

  // Calculate performance based on completed tasks
  const calculatePerformance = () => {
    const total = assigned+completed+failed;         // Total tasks assigned
    const completedTasks = completed; // Total tasks completed
  
    if (total === 0) return 0;      // Avoid division by zero
  
    const successRate = (completedTasks / total) * 100; // Percentage of successful tasks
    return successRate;
  };
  

  const performance = calculatePerformance();

  // Data for the Doughnut chart (Performance percentage for assigned, completed, and failed tasks)
  const doughnutData = {
    labels: ['Completed', 'Failed', 'Assigned'],
    datasets: [
      {
        data: [completed, failed, assigned],
        backgroundColor: ['rgba(92, 5, 114, 0.7)', 'rgb(140, 0, 30)', 'rgba(54, 162, 235, 0.7)'],
        hoverBackgroundColor: ['rgb(35, 1, 43)', 'rgb(220, 38, 38)', 'rgb(13, 110, 253)'],
        borderWidth: 1,
      },
    ],
  };

  // Options for interactive elements
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            let label = tooltipItem.dataset.label || '';
            label += ': ' + tooltipItem.raw;
            return label;
          },
        },
        
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
  };

  // Loading and error handling
  if (loading) return <p className="text-gray-600 text-lg dark:text-white">Loading task data...</p>;
  if (error) return <p className="text-red-600 text-lg">{error}</p>;

  // If no task data (assigned, completed, failed) exists
  if (assigned === 0 && completed === 0 && failed === 0) {
    return (
      <div className="container mx-auto p-6 space-y-8 ">
        <h3 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">Employee Performance</h3>
        <p className="text-center text-gray-600 dark:text-white">No performance data for this employee</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 ">
      <h3 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">Employee Performance</h3>

      
        <div className=" h-[350px] rounded-xl overflow-hidden">
          <Doughnut data={doughnutData} options={options} />
        </div>
     

      <div className="text-center text-gray-900 mt-14 ml-4">
        <p className=" text-2xl text-purple-700 font-bold ">
          Performance: {performance.toFixed(2)}%
        </p>

        {/* Render performance message */}
        {performance < 50 ? (
          <p className="text-red-600 text-xl font-semibold mt-1">Needs Improvement</p>
        ) : performance < 75 ? (
          <p className="text-orange-500 text-xl font-semibold mt-1">Satisfactory</p>
        ) : (
          <p className="text-green-600 text-xl font-semibold mt-1">Excellent</p>
        )}
      </div>
    </div>
  );
};

export default Performance;
