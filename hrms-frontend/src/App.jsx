import { BrowserRouter as Router, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/Sidebar"; 
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AllEmployees from "./pages/AllEmployees";
import AddEmployee from "./pages/AddEmployee";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import Payroll from "./components/Payroll";
import EditEmployee from "./components/EditEmployee";
import EmployeeManagement from "./pages/EmployeeManagement";
import Attendance from "./components/Attendance";
import HolidayPage from "./components/HolidayPage";
import EmployeeProfileEdit from "./pages/EmployeeProfileEdit";
import EmployeeAttendance from "./components/EmployeeAttendance";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    "/register", 
    "/forgot-password", 
    "/verify-otp", 
    "/employee-dashboard",
    "/emp-attendance"
    
  ];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname) || 
                            matchPath("/edit-profile/:id", location.pathname);

  return (
    <div className="flex">
    {!shouldHideSidebar && <Sidebar />} 
      <div className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/all-employees" element={<AllEmployees />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/edit-employee/:employeeId" element={<EditEmployee />} />
          <Route path="/employee-management/:id" element={<EmployeeManagement />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/holidays" element={<HolidayPage />} />
          <Route path="/edit-profile/:id" element={<EmployeeProfileEdit />} />
          <Route path="/emp-attendance" element={<EmployeeAttendance />} />          </Routes>
      </div>
    </div>
  );
}

export default App;
