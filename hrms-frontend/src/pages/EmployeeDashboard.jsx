import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeSidebar from "../components/EmployeeSidebar";
import Schedule from "../components/Schedule";
import Performance from "./Performance";



export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [assignedTodayTasks, setAssignedTodayTasks] = useState([]);
  const [dueTodayTasks, setDueTodayTasks] = useState([]);
  const [completedTaskCounts, setCompletedTaskCounts] = useState([]); // Store task count for the graph
  const [currentAssignedTask, setCurrentAssignedTask] = useState(0);
  const [currentDueTask, setCurrentDueTask] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const employeeId = localStorage.getItem("employeeId");

    if (!token || !employeeId) {
      navigate("/login");
      return;
    }

    const fetchEmployee = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        const employeeData = Array.isArray(data) ? data[0] : data;
        setEmployee(employeeData);
        setProfilePicture(employeeData.profilePic || "/assets/default-avatar.jpg");

        fetchTasks(employeeId, token);
      } catch (error) {
        console.error("Error fetching employee:", error.message);
      }
    };

    const fetchTasks = async (employeeId, token) => {
      try {
        const response = await fetch(`http://localhost:5000/api/tasks/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const tasks = await response.json();
        const today = new Date().toISOString().split('T')[0];

        const assignedToday = tasks.filter(task => task.assigned_date);
        const dueToday = tasks.filter(task => task.due_date?.split('T')[0] === today);

        setAssignedTodayTasks(assignedToday);
        setDueTodayTasks(dueToday);

        // Calculate completed task counts per day
        calculateCompletedTaskCounts(tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
      }
    };

    const calculateCompletedTaskCounts = (tasks) => {
      const taskCountMap = {};
      tasks.forEach(task => {
        const date = task.due_date?.split('T')[0] || task.assigned_date.split('T')[0];

        // Only count tasks that are marked as completed
        if (task.completed) {
          taskCountMap[date] = (taskCountMap[date] || 0) + 1;
        }
      });

      // Format the data for the chart
      const dates = Object.keys(taskCountMap);
      const counts = dates.map(date => taskCountMap[date]);

      setCompletedTaskCounts({ dates, counts });
    };

    fetchEmployee();
  }, [navigate]);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const response = await fetch("http://localhost:5000/api/employees/upload-profile-pic", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setProfilePicture(data.profilePic);
      setEmployee((prev) => ({ ...prev, profilePic: data.profilePic }));
    } catch (err) {
      console.error("Profile picture upload failed:", err.message);
    }
  };

  const handleNextAssignedTask = () => {
    setCurrentAssignedTask((prev) => (prev + 1) % assignedTodayTasks.length);
  };

  const handlePrevAssignedTask = () => {
    setCurrentAssignedTask(
      (prev) => (prev - 1 + assignedTodayTasks.length) % assignedTodayTasks.length
    );
  };

  const handleNextDueTask = () => {
    setCurrentDueTask((prev) => (prev + 1) % dueTodayTasks.length);
  };

  const handlePrevDueTask = () => {
    setCurrentDueTask(
      (prev) => (prev - 1 + dueTodayTasks.length) % dueTodayTasks.length
    );
  };

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Chart data for performance matrix using completed task counts
  

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <EmployeeSidebar employee={employee} />

      <div className="flex-1 p-8 overflow-auto">
        
        <div className="mb-8 flex items-center justify-between">
          {/* Header Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <label htmlFor="profile-upload">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gradient-to-r from-purple-400 via-pink-500 to-red-500 cursor-pointer shadow-lg"
                />
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
                Hello, {employee.firstName} {employee.lastName} 👋
              </h2>
              <p className="text-lg text-gray-600 dark:text-white">We're happy to have you on board! 🚀</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Matrix */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <Performance/>
          </div>

          {/* Schedule Component */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <Schedule />
          </div>
        </div>
         <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white dark:bg-gray-800  p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex text-center dark:text-white">
              Assigned Today
              
            </h3>
            {assignedTodayTasks.length === 0 ? (
              <p className="text-gray-500 etxt-center">No tasks assigned for today.</p>
            ) : (
              <div>
                <div className="space-y-6">
                  <div className="bg-gray-100 border-l-4 border-purple-500 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-semibold text-purple-700">
                        {assignedTodayTasks[currentAssignedTask]?.task_name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {currentAssignedTask + 1}/{assignedTodayTasks.length}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2">{assignedTodayTasks[currentAssignedTask]?.task_description}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={handlePrevAssignedTask}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextAssignedTask}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <h3 className="text-2xl font-semibold text-gray-800  mb-4 flex justify-between dark:text-white">
              Due Today
              <span className="text-gray-500 text-lg">({dueTodayTasks.length} tasks)</span>
            </h3>
            {dueTodayTasks.length === 0 ? (
              <p className="text-gray-500">No tasks due for today.</p>
            ) : (
              <div>
                <div className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-semibold text-purple-700">
                        {dueTodayTasks[currentDueTask]?.task_name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {currentDueTask + 1}/{dueTodayTasks.length}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2">{dueTodayTasks[currentDueTask]?.task_description}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={handlePrevDueTask}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextDueTask}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}


       
         
      
