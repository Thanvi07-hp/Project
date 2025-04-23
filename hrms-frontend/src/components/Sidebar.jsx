import { FiSun, FiMoon } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route
  const [darkMode, setDarkMode] = useState(false);

  // Function to determine if the link is active
  const isActive = (path) =>
    location.pathname === path ? "bg-blue-500 text-white rounded-md p-2" : "text-black dark:text-white";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className={`flex`}>
      <aside
        className={`w-64 min-h-screen p-4 shadow-lg flex flex-col justify-between`}
      >
        <div>
          <h2 className="text-2xl font-bold mb-4">HRMS</h2>
          <nav>
            <ul>
              <li className={`py-2 cursor-pointer ${isActive("/admin-dashboard")}`} onClick={() => navigate("/admin-dashboard")}>
                Dashboard
              </li>
              <li className={`py-2 cursor-pointer ${isActive("/all-employees")}`} onClick={() => navigate("/all-employees")}>
                All Employees
              </li>
              <li className={`py-2 cursor-pointer ${isActive("/attendance")}`} onClick={() => navigate("/attendance")}>
                Attendance
              </li>
              <li className={`py-2 cursor-pointer ${isActive("/payroll")}`} onClick={() => navigate("/payroll")}>
                Payroll
              </li>
              <li className={`py-2 cursor-pointer ${isActive("/holidays")}`} onClick={() => navigate("/holidays")}>
                Holidays
              </li>
              <li className={`py-2 cursor-pointer ${isActive("/task")}`} onClick={() => navigate("/task")}>
                Tasks
              </li>
              <li className={`py-2 cursor-pointer ${isActive("/add-admin")}`} onClick={() => navigate("/add-admin")}>
                Add Admins
              </li>
              
            </ul>
            <div className="mt-1">
          <button
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
          </nav>
        </div>

       

      </aside>
    </div>
  );
};

export default Sidebar;