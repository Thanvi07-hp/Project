import { BrowserRouter as Router, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AllEmployees from "./pages/AllEmployees";
import AddEmployee from "./pages/AddEmployee";
import Payroll from "./components/Payroll";
import EditEmployee from "./components/EditEmployee";
import EmployeeManagement from "./pages/EmployeeManagement";
import Attendance from "./components/Attendance";
import EmployeeProfileEdit from "./pages/EmployeeProfileEdit";
import EmployeeAttendance from "./components/EmployeeAttendance";
import EmployeePayroll from "./components/EmployeePayroll";
import EmployeeHolidays from "./components/EmployeeHolidays";
import AddAdmin from "./components/AddAdmin"; 
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HolidayPage from "./components/HolidayPage";
import Task from "./pages/Task";
import "react-toastify/dist/ReactToastify.css";
import ThemeToggle from "./components/ui/ThemeToggle";
import EmployeeTask from "./components/EmployeeTask";

function App() {
  return (
    <Router>   
      <MainContent />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

function MainContent() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const hideSidebarRoutes = [
    "/login",
    "/employee-dashboard",
    "/emp-attendance",
    "/emp-payroll",
    "/emp-holidays",
    "/emp-task"
  ];

  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname) ||
    matchPath("/edit-profile/:id", location.pathname) ||
    !token; // Hide sidebar if not authenticated

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!shouldHideSidebar && <Sidebar />}
      <div className="flex-1 p-4">
      
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} />
          <Route path="/all-employees" element={<ProtectedRoute element={<AllEmployees />} allowedRoles={['admin']} />} />
          <Route path="/add-employee" element={<ProtectedRoute element={<AddEmployee />} allowedRoles={['admin']} />} />
          <Route path="/edit-employee/:employeeId" element={<ProtectedRoute element={<EditEmployee />} allowedRoles={['admin']} />} />
          <Route path="/employee-management/:id" element={<ProtectedRoute element={<EmployeeManagement />} allowedRoles={['admin']} />} />
          <Route path="/attendance" element={<ProtectedRoute element={<Attendance />} allowedRoles={['admin']} />} />
          <Route path="/task" element={<ProtectedRoute element={<Task />} allowedRoles={['admin']} />} />
          <Route path="/payroll" element={<ProtectedRoute element={<Payroll />} allowedRoles={['admin']} />} />
          <Route path="/holidays" element={<ProtectedRoute element={<HolidayPage />} allowedRoles={['admin']} />} />
          <Route path="/add-admin" element={<ProtectedRoute element={<AddAdmin />} allowedRoles={['admin']} />} />
          
          {/* Employee Routes */}
          <Route path="/employee-dashboard" element={<ProtectedRoute element={<EmployeeDashboard />} allowedRoles={['employee']} />} />
          <Route path="/edit-profile/:id" element={<ProtectedRoute element={<EmployeeProfileEdit />} allowedRoles={['employee']} />} />
          <Route path="/emp-attendance" element={<ProtectedRoute element={<EmployeeAttendance />} allowedRoles={['employee']} />} />
          <Route path="/emp-payroll" element={<ProtectedRoute element={<EmployeePayroll />} allowedRoles={['employee']} />} />
          <Route path="/emp-holidays" element={<ProtectedRoute element={<EmployeeHolidays />} allowedRoles={['employee']} />} />
          <Route path="/emp-task" element={<ProtectedRoute element={<EmployeeTask />} allowedRoles={['employee']} />} />
        </Routes>
        </div>
      </div>
   
  );
}

export default App;``
