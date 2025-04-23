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
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from "react-toastify";
import HolidayPage from "./components/HolidayPage";
import Task from "./pages/Task";
import "react-toastify/dist/ReactToastify.css";
import ThemeToggle from "./components/ui/ThemeToggle";
import EmployeeTask from "./components/EmployeeTask";


function App() {
  return (
    <Router>   
      <MainContent />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

function MainContent() {
  const location = useLocation();

  const hideSidebarRoutes = [
    "/login",
    "/employee-dashboard",
    "/emp-attendance",
    "/emp-payroll",
    "/emp-holidays",
    "/emp-task"
  ];
  
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname) ||
    matchPath("/edit-profile/:id", location.pathname);

  return (
    <div className="flex">
      {!shouldHideSidebar && <Sidebar />}
      <div className="flex-1 p-4">
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} /> {/* No PrivateRoute for login */}
          <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/employee-dashboard" element={<PrivateRoute><EmployeeDashboard /></PrivateRoute>} />
          <Route path="/all-employees" element={<PrivateRoute><AllEmployees /></PrivateRoute>} />
          <Route path="/add-employee" element={<PrivateRoute><AddEmployee /></PrivateRoute>} />
          <Route path="/edit-employee/:employeeId" element={<PrivateRoute><EditEmployee /></PrivateRoute>} />
          <Route path="/employee-management/:id" element={<PrivateRoute><EmployeeManagement /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/task" element={<PrivateRoute><Task /></PrivateRoute>} />
          <Route path="/payroll" element={<PrivateRoute><Payroll /></PrivateRoute>} />
          <Route path="/holidays" element={<PrivateRoute><HolidayPage /></PrivateRoute>} />
          <Route path="/add-admin" element={<PrivateRoute><AddAdmin /></PrivateRoute>} />
          <Route path="/edit-profile/:id" element={<PrivateRoute><EmployeeProfileEdit /></PrivateRoute>} />
          <Route path="/emp-attendance" element={<PrivateRoute><EmployeeAttendance /></PrivateRoute>} /> 
          <Route path="/emp-payroll" element={<PrivateRoute><EmployeePayroll /></PrivateRoute>} />
          <Route path="/emp-holidays" element={<PrivateRoute><EmployeeHolidays /></PrivateRoute>} />
          <Route path="/emp-task" element={<PrivateRoute><EmployeeTask /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
