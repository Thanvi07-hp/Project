import React, { useEffect, useState } from "react";
import axios from "axios";
import Schedule from "../components/Schedule";
import { Bar } from "react-chartjs-2";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendances, setAttendances] = useState([]);

  const [mergedData, setMergedData] = useState([]); // To store combined employee + attendance data
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchingAttendance = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/attendance");
        setAttendances(response.data); // Fetch all attendance data
      } catch (error) {
        console.error("Error fetching attendance", error);
      }
    };

    fetchingAttendance();
  }, []);

  // Fetch Employees, Attendance, and Tasks on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees", error);
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/get-attendance");
        // Filter attendance data to show only "Present" employees
        const presentEmployees = response.data.filter(emp => emp.status === "Present");
        setAttendance(presentEmployees);
      } catch (error) {
        console.error("Error fetching attendance", error);
      }
    };
    

    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks", error);
      }
    };

    fetchEmployees();
    fetchAttendance();
    fetchTasks();
  }, []);

  useEffect(() => {
    // Merge employee and attendance data when both are available
    if (employees.length > 0 && attendance.length > 0) {
      const merged = attendance.map((att) => {
        const employee = employees.find((emp) => emp.employeeId === att.employeeId);
        if (employee) {
          return { ...att, ...employee }; // Merge employee and attendance data
        }
        return null;
      }).filter(item => item !== null);

      setMergedData(merged);
    }
  }, [employees, attendance]);


  // Function to format the check-in time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };
  const formattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
     
    });
  };

  const prepareAttendanceData = () => {
    // Group attendance by date and count "Present" employees
    const attendanceDates = {};
    attendances.forEach((emp) => {
      const date = new Date(emp.check_in_time).toLocaleDateString(); // Get the date part of the check-in time
      if (!attendanceDates[date]) {
        attendanceDates[date] = 0;
      }
      attendanceDates[date] += 1; // Increment the count for each "Present" employee on that date
    });

    // Sort dates
    const sortedDates = Object.keys(attendanceDates).sort((a, b) => new Date(a) - new Date(b));
    const last5Dates = sortedDates.slice(-5);

    // Convert the attendanceDates object to arrays for the chart
    const labels = last5Dates;
    const data = last5Dates.map(date => attendanceDates[date]);

    return { labels, data };
  };

  const { labels, data } = prepareAttendanceData();

  // Chart Data and Options
  const chartData = {
    labels: labels, // Dates
    datasets: [
      {
        label: "Attendance Count",
        data: data,
        backgroundColor: "rgb(87, 95, 248)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: false,
        text: "Attendance Overview",
      },
      tooltip: {
        enabled: true,
      },
    },
    
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
        grid: {
          display: false, // Remove grid from x-axis
        },
      },
      y: {
        title: {
          display: true,
          text: "Attendance Count",
        },
        
        beginAtZero: true,
      },
    },
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hello Admin 👋</h1>
          <p className="text-gray-600">Good Morning</p>
        </div>
        <div className="flex items-center space-x-4">
          
          <div className="flex items-center space-x-2">
            <img
              src="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/man-vector-design-template-1ba90da9b45ecf00ceb3b8ae442ad32c_screen.jpg?ts=1601484738"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <span>Admin</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-4 gap-4 mb-6">
        {[
          { title: "Total Employee", value: employees.length },
          { title: "Today Attendance", value: attendance.length }, // Only present employees will be shown here
          { title: "Total Tasks", value: tasks.length },
          { title: "Completed Tasks", value: tasks.filter(task => task.status === "Completed").length },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col "
          >
            <h3 className="text-gray-600">{stat.title}</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xl font-bold text-black">{stat.value}</span>
              <span
                className={`text-sm ${stat.change && stat.change.startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                  }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Main Section */}
      <section className="grid grid-cols-3 gap-4">
        {/* Attendance Overview Chart */}
        <div className="col-span-2 bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold mb-4">Attendance Overview</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Schedule */}
        <div>
          <Schedule currentDate={new Date()} />
        </div>

        {/* Attendance Table */}
        {/* Attendance Table */}
        <div className="col-span-full bg-white p-4 rounded-lg shadow-md mt-6 dark:bg-gray-900 dark:text-white">
          <h3 className="font-bold mb-4">Attendance Overview</h3>
          {/* Table */}
          <table className="w-full border-collapse border border-gray-300 dark:bg-gray-900 dark:text-white text-left text-sm">
            <thead>
              <tr>
                {["Employee Name", "Designation", "Type", "Check In Time", "Status"].map(
                  (header) => (
                    <th
                      key={header}
                      className="border border-gray-300 px-4 py-2 dark:bg-gray-700 dark:text-white"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {mergedData.map((emp, index) => (
                <tr key={index} cla>
                  <td className="border border-gray-300 px-4 py-2">{`${emp.firstName} ${emp.lastName}`}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.designation ? emp.designation : 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.type ? emp.type : 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(emp.check_in_time)}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 ${emp.status === "Late" ? "text-red-500" : "text-green-500"
                      }`}
                  >
                    {emp.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

      {/* Tasks Section */}
      <section className="mt-6">
        <h3 className="font-bold mb-4">Tasks</h3>
        <div className="dark:bg-gray-900 dark:text-white p-4 rounded-lg shadow-md">
          {tasks.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300 text-left text-sm">
              <thead>
                <tr>
                  {["Task", "Description", "Due Date", "Assigned Employee", "Status"].map((header) => (
                    <th key={header} className="border border-gray-300 px-4 py-2 dark:bg-gray-700 dark:text-white">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{task.task_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.task_description}</td>
                    {/* Format Due Date */}
                    <td className="border border-gray-300 px-4 py-2">{formattedDate(task.due_date)}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.employee_name}</td>
                    <td
                      className={`border border-gray-300 px-4 py-2 ${task.status === "Completed" ? "text-green-500" : "text-yellow-500"
                        }`}
                    >
                      {task.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No tasks available</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;