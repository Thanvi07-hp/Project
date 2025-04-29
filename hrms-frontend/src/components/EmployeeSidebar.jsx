import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ui/ThemeToggle";
import { useState, useEffect } from "react";

export default function EmployeeSidebar({ employee, onCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed);
    }
  }, [isCollapsed, onCollapse]);

  const isActive = (path) =>
    location.pathname === path ? "bg-purple-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("role");
    localStorage.removeItem("employeeId");
    navigate("/login");
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <aside className="h-full bg-white dark:bg-gray-800 shadow-lg flex flex-col">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {!isCollapsed && <h2 className="text-2xl font-bold text-gray-800 dark:text-white">HRMS</h2>}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <nav className="flex-1">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate("/employee-dashboard")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${isActive("/employee-dashboard")}`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {!isCollapsed && "Dashboard"}
                    </div>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navigate(`/edit-profile/${employee?.employeeId}`)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${isActive(`/edit-profile/${employee?.employeeId}`)}`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {!isCollapsed && "Profile"}
                    </div>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navigate("/emp-task")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${isActive("/emp-task")}`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {!isCollapsed && "Tasks"}
                    </div>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navigate("/emp-attendance")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${isActive("/emp-attendance")}`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {!isCollapsed && "Attendance"}
                    </div>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navigate("/emp-payroll")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${isActive("/emp-payroll")}`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {!isCollapsed && "Payroll"}
                    </div>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => navigate("/emp-holidays")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${isActive("/emp-holidays")}`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {!isCollapsed && "Holidays"}
                    </div>
                  </button>
                </li>
              </ul>
            </nav>

            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 mt-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {!isCollapsed && "Logout"}
              </button>
              
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Content Wrapper */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* This div will contain the main content */}
      </div>
    </>
  );
}
