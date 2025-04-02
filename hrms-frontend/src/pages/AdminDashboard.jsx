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
  const [mergedData, setMergedData] = useState([]); // To store combined employee + attendance data
  const [tasks, setTasks] = useState([]);
  

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



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hello Admin 👋</h1>
          <p className="text-gray-600">Good Morning</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search"
            className="p-2 border rounded-md"
          />
          <div className="flex items-center space-x-2">
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <span></span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-4 gap-4 mb-6">
        {[
          { title: "Total Employee", value: employees.length},
          { title: "Today Attendance", value: attendance.length }, // Only present employees will be shown here
          { title: "Total Tasks", value: tasks.length },
          { title: "Completed Tasks", value: tasks.filter(task => task.status === "Completed").length },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col"
          >
            <h3 className="text-gray-600">{stat.title}</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xl font-bold">{stat.value}</span>
              <span
                className={`text-sm ${
                  stat.change && stat.change.startsWith("+")
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
          {/* Placeholder for the chart */}
          <div className="w-full h-[340px] bg-gray-200 rounded-md"></div>
        </div>

        {/* Schedule */}
        <div >
      <Schedule  currentDate={new Date()} />
    </div>
        {/* Attendance Table */}
        <div className="col-span-full bg-white p-4 rounded-lg shadow-md mt-6">
          <h3 className="font-bold mb-4">Attendance Overview</h3>
          {/* Table */}
          <table className="w-full border-collapse border border-gray-300 text-left text-sm">
            <thead>
              <tr>
                {["Employee Name", "Designation", "Type", "Check In Time", "Status"].map(
                  (header) => (
                    <th
                      key={header}
                      className="border border-gray-300 px-4 py-2 bg-gray-100"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {attendance.map((emp, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{`${emp.firstName} ${emp.lastName}`}</td>
                  <td className="border border-gray-300 px-4 py-2">{`${emp.designation}`}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.type}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.check_in_time}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 ${
                      emp.status === "Late" ? "text-red-500" : "text-green-500"
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
        <div className="bg-white p-4 rounded-lg shadow-md">
          {tasks.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300 text-left text-sm">
              <thead>
                <tr>
                  {["Task", "Description", "Due Date", "Assigned Employee", "Status"].map((header) => (
                    <th key={header} className="border border-gray-300 px-4 py-2 bg-gray-100">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{task.title}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.description}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.dueDate}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.employee}</td>
                    <td
                      className={`border border-gray-300 px-4 py-2 ${
                        task.status === "Completed" ? "text-green-500" : "text-yellow-500"
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