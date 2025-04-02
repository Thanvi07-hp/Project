import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar"; 
import AdminDashboard from "./pages/AdminDashboard";
import AllEmployees from "./pages/AllEmployees";
import AddEmployee from "./pages/AddEmployee";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import Payroll from "./components/Payroll";
import EditEmployee from "./components/EditEmployee";
import EmployeeManagement from "./pages/EmployeeManagement";
import Attendance from "./components/Attendance";
import HolidayPage from "./components/HolidayPage";
import Task from "./pages/Task";
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
  
  // Define pages where Sidebar should be hidden
  const hideSidebarRoutes = ["/", "/forgot-password", "/verify-otp"];

  return (
    <div className="flex">
      {/* Show Sidebar only if current route is NOT in hideSidebarRoutes */}
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}

      {/* Main content section */}
      <div className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/all-employees" element={<AllEmployees />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/edit-employee/:employeeId" element={<EditEmployee />} />
          <Route path="/employee-management/:id" element={<EmployeeManagement />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/task" element={<Task />} /> 
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/holidays" element={<HolidayPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
