import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0]; // Converts to YYYY-MM-DD
  };

  // Fetch Employees
  useEffect(() => {
    axios.get("http://localhost:5000/api/employees")
      .then((response) => setEmployees(response.data))
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  // Fetch Payroll Data AFTER Employees are Fetched
  useEffect(() => {
    if (employees.length > 0) {
      axios.get("http://localhost:5000/api/payroll")
        .then((response) => {
          const payrollRecords = response.data;
          const initialPayroll = {};

          employees.forEach(emp => {
            const payrollEntry = payrollRecords.find(entry => entry.employeeId === emp.employeeId);
            initialPayroll[emp.employeeId] = payrollEntry
              ? { id: payrollEntry.id, salary: payrollEntry.salary, TDS: payrollEntry.TDS, Advance: payrollEntry.Advance, status: payrollEntry.status, date: formatDate(payrollEntry.date) }
              : { id: null, salary: "", TDS: "", Advance: "", status: "Pending" };
          });

          setPayrollData(initialPayroll);
        })
        .catch((error) => console.error("Error fetching payroll:", error));
    }
  }, [employees]);

  // Handle input changes
  const handleInputChange = (employeeId, field, value) => {
    setPayrollData((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [field]: value }
    }));
  };

  // Save or Update Payroll Data in Database
  const savePayroll = (employeeId) => {
    const payrollEntry = payrollData[employeeId];

    if (payrollEntry.id) {
      // Update existing payroll
      axios.put(`http://localhost:5000/api/payroll/update/${payrollEntry.id}`, { 
        salary: payrollEntry.salary,
        TDS: payrollEntry.TDS,
        Advance: payrollEntry.Advance,
        status: payrollEntry.status
      })
      .then(() => {
        toast.success("Payroll Updated Successfully!");
      })
      .catch((error) => console.error("Error updating payroll:", error));
    }  else {
      // Create new payroll entry
      axios.post("http://localhost:5000/api/payroll/add", { 
        employeeId,
        salary: payrollEntry.salary,
        TDS: payrollEntry.TDS,
        Advance: payrollEntry.Advance,
        status: payrollEntry.status
      })
      .then(() => {
        toast.success("Payroll Saved Successfully!");
      })
      .catch((error) => console.error("Error saving payroll:", error));
    }
  };

  // Export Payroll to Excel
  const exportPayroll = () => {
    window.location.href = "http://localhost:5000/api/payroll/export";
  };
  
  return (
    <div className="p-6 ml-[250px]">
      <h2 className="text-2xl font-bold mb-4">Payroll Management</h2>
      
      <button
        onClick={exportPayroll}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Export Payroll
      </button>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 ">
          <thead>
            <tr className="dark:bg-gray-900 dark:text-white">
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">CTC</th>
              <th className="p-2 border">Salary Per Month</th>
              <th className="p-2 border">TDS</th>
              <th className="p-2 border">Advance</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId} className="border">
                <td className="p-2 border flex items-center">
                  <img src={emp.profilePic || "/assets/default-avatar.jpg"} alt="Profile" className="w-8 h-8 rounded-full mr-2" />
                  {emp.firstName} {emp.lastName}
                </td>
                <td className="p-2 border">₹{payrollData[emp.employeeId]?.salary ? payrollData[emp.employeeId].salary * 12 : "N/A"}</td>
                <td className="p-2 border">
                  <input 
                    type="number" 
                    value={payrollData[emp.employeeId]?.salary || ""}
                    onChange={(e) => handleInputChange(emp.employeeId, "salary", e.target.value)}
                    className="border px-2 py-1 w-20 dark:bg-gray-900 dark:text-white"
                  />
                </td>
                <td className="p-2 border">
                  <input 
                    type="number" 
                    value={payrollData[emp.employeeId]?.TDS || ""}
                    onChange={(e) => handleInputChange(emp.employeeId, "TDS", e.target.value)}
                    className="border px-2 py-1 w-20 dark:bg-gray-900 dark:text-white"
                  />
                </td>
                <td className="p-2 border">
                  <input 
                    type="number" 
                    value={payrollData[emp.employeeId]?.Advance || ""}
                    onChange={(e) => handleInputChange(emp.employeeId, "Advance", e.target.value)}
                    className="border px-2 py-1 w-20 dark:bg-gray-900 dark:text-white"
                  />
                </td>
                <td className="p-2 border">
                  <select 
                    value={payrollData[emp.employeeId]?.status} 
                    onChange={(e) => handleInputChange(emp.employeeId, "status", e.target.value)}
                    className="border px-2 py-1 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <button 
                    onClick={() => savePayroll(emp.employeeId)} 
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payroll;