import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ui/ThemeToggle";


export default function EmployeeSidebar({ employee }) {
  const navigate = useNavigate();
  const location = useLocation();


  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "bg-blue-500 text-white rounded-md p-2"
      : "text-black dark:text-white";

      const handleLogout = () => {
        localStorage.removeItem("token"); 
        localStorage.removeItem("role");
        localStorage.removeItem("employeeId");
        navigate("/login");
      };

  return (
    <aside className="w-64 min-h-screen p-4 bg-white text-black shadow-lg flex flex-col dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">EMS</h2>
      <nav>
        <ul>
          <li className={`py-2 cursor-pointer ${isActive("/employee-dashboard")}`} onClick={() => navigate("/employee-dashboard")}>
            Dashboard
          </li>
          <li
            className={`py-2 cursor-pointer ${isActive("/edit-profile")}`}
            onClick={() => navigate(`/edit-profile/${employee?.employeeId}`)}
          >
            Profile
          </li>
          <li className={`py-2 cursor-pointer ${isActive("/emp-task")}`} onClick={() => navigate("/emp-task")}>
            Tasks
          </li>
          <li className={`py-2 cursor-pointer ${isActive("/emp-attendance")}`} onClick={() => navigate("/emp-attendance")}>
            Attendance
          </li>
          <li className={`py-2 cursor-pointer ${isActive("/emp-payroll")}`} onClick={() => navigate("/emp-payroll")}>
            Payroll
          </li>
          <li className={`py-2 cursor-pointer ${isActive("/emp-holidays")}`} onClick={() => navigate("/emp-holidays")}>
            Holidays
          </li>
        </ul>
        <div className="mt-1">
          <button
            onClick={handleLogout}
          >
            Logout
          </button>
          
        </div>
        <div className="flex justify-start items-end h-[400px]">
          <ThemeToggle />
        </div>

        
      </nav>
      
    </aside>
  );
}
