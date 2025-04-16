import { useEffect, useState } from "react";
import EmployeeSidebar from "./EmployeeSidebar";
import { useNavigate } from "react-router-dom";

export default function EmployeePayroll() {
  const [employee, setEmployee] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const employeeId = localStorage.getItem("employeeId");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}:${month}:${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId) {
        console.warn("⚠ No employeeId found. Redirecting to login.");
        navigate("/login");
        return;
      }

      try {
        // Fetch employee info for sidebar context
        const empRes = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
        if (!empRes.ok) throw new Error("❌ Failed to fetch employee.");
        const empData = await empRes.json();
        setEmployee(empData);

        // Fetch payroll data from working endpoint
        const payrollRes = await fetch(`http://localhost:5000/api/employees/payroll/${employeeId}`);
        if (!payrollRes.ok) throw new Error("❌ Failed to fetch payroll.");
        const payrollData = await payrollRes.json();
        setPayroll(payrollData);
      } catch (err) {
        console.error("🚨 Error fetching payroll/employee:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, navigate]);

  if (loading) return <div className="p-6">Loading payroll...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <EmployeeSidebar employee={employee} />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">My Payroll</h2>

        <div className="bg-white shadow rounded p-6 dark:bg-gray-900">
          <h3 className="text-lg font-medium mb-4">💰 Payroll Details</h3>

          {payroll ? (
            <table className="w-full border border-gray-200 text-left">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2">Date</th>
                  <th className="p-2">Salary</th>
                  <th className="p-2">TDS</th>
                  <th className="p-2">Advance</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">{formatDate(payroll.updated_at)}</td>
                  <td className="p-2">₹{payroll.salary}</td>
                  <td className="p-2">₹{payroll.TDS}</td>
                  <td className="p-2">₹{payroll.Advance}</td>
                  <td className="p-2">{payroll.status}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No payroll data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}