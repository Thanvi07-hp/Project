import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AllEmployees from "./pages/AllEmployees";
import AddEmployee from "./pages/AddEmployee";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import EditEmployee from "./components/EditEmployee";
import EmployeeManagement from "./pages/EmployeeManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/all-employees" element={<AllEmployees />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/edit-employee/:employeeId" element={<EditEmployee />} />
        <Route path="/employee-management/:id" element={<EmployeeManagement />} />


        </Routes>
    </Router>
  );
}

export default App;
