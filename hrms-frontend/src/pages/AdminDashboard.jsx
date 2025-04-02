import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMoon, FiSun, FiUserPlus, FiUsers } from "react-icons/fi";
import Schedule from "../components/Schedule";

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/employees")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setEmployees(data);
          updateAttendanceGraph(data);
        }
      })
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  const updateAttendanceGraph = (employees) => {
    const attendanceSummary = [
      { day: "Mon", attendance: 0 },
      { day: "Tue", attendance: 0 },
      { day: "Wed", attendance: 0 },
      { day: "Thu", attendance: 0 },
      { day: "Fri", attendance: 0 },
    ];

    employees.forEach((emp) => {
      if (emp.attendance && Array.isArray(emp.attendance)) {
        emp.attendance.forEach((day, index) => {
          if (attendanceSummary[index]) {
            attendanceSummary[index].attendance += day;
          }
        });
      }
    });

    setAttendanceData(attendanceSummary);
  };

  return (
    <div className={darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}>
      <div className="flex min-h-screen">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-between items-center relative">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <input type="text" placeholder="Search" className="border p-2 rounded-md text-black" />
              <div className="relative">
                <img
                  src="/admin-profile.jpg"
                  alt="Admin Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                />
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg text-black">
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-200" onClick={() => navigate("/admin-profile")}>
                      Edit Profile
                    </button>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-200" onClick={() => navigate("/logout")}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Sections */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {/* Attendance Overview */}
            <div className={darkMode ? "col-span-2 bg-gray-800 text-white p-6 shadow rounded-lg" : "col-span-2 bg-white p-6 shadow rounded-lg"}>
              <h3 className="text-lg font-bold">Attendance Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={attendanceData}>
                  <XAxis dataKey="day" stroke={darkMode ? "white" : "black"} />
                  <YAxis stroke={darkMode ? "white" : "black"} />
                  <Tooltip />
                  <Bar dataKey="attendance" fill={darkMode ? "#ffffff" : "#8884d8"} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={darkMode ? "bg-gray-800 text-white p-6 shadow rounded-lg" : "bg-white p-6 shadow rounded-lg"}>
              <Schedule darkMode={darkMode} currentDate={new Date()} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
