import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar"; 
import AdminDashboard from "./pages/AdminDashboard";
import AllEmployees from "./pages/AllEmployees";
import AddEmployee from "./pages/AddEmployee";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import EditEmployee from "./components/EditEmployee";
import EmployeeManagement from "./pages/EmployeeManagement";
import Attendance from "./components/Attendance";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar /> {/* Sidebar added to all pages */}

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

        </Routes>
        </div>
        </div>



        <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
