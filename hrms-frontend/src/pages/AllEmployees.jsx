import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiPlus, FiFilter, FiMoon, FiSun } from "react-icons/fi";

export default function AllEmployees() {
  const [employees, setEmployees] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  // Edit Employee
const handleEdit = (employeeId) => {
  navigate(`/edit-employee/${employeeId}`);
};

// Delete Employee
const handleDelete = async (employeeId) => {
  if (window.confirm("Are you sure you want to delete this employee?")) {
    try {
      console.log("Deleting Employee ID:", employeeId);

      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log("Response Data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete employee");
      }

      setEmployees((prevEmployees) => prevEmployees.filter(emp => emp.employeeId !== employeeId));

    } catch (error) {
      console.error("❌ Error deleting employee:", error);
      alert(error.message);
    }
  }
};


  // Pagination logic
  const totalPages = Math.ceil(employees.length / employeesPerPage);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  
  // Function to handle row click for employee details
  const onSelectEmployee = (employee) => {
    navigate(`/employee-details/${employee.id}`);
  };

  return (
    <div className={darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`w-64 p-4 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg flex flex-col justify-between`}>
          <div>
            <h2 className="text-2xl font-bold mb-4">HRMS</h2>
            <nav>
              <ul>
                <li className="py-2 cursor-pointer" onClick={() => navigate("/admin-dashboard")}>
                  Dashboard
                </li>
                <li className="py-2 cursor-pointer bg-blue-500 text-white rounded-md p-2">
                  All Employees
                </li>
                <li className="py-2 cursor-pointer">Attendance</li>
                <li className="py-2 cursor-pointer">Payroll</li>
                <li className="py-2 cursor-pointer">Leaves</li>
              </ul>
            </nav>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <button onClick={() => setDarkMode(false)} className="p-2 bg-gray-300 text-black rounded-md">
                <FiSun /> Light
              </button>
              <button onClick={() => setDarkMode(true)} className="p-2 bg-gray-700 text-white rounded-md">
                <FiMoon /> Dark
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Employees</h1>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="border p-2 pl-8 rounded-md text-black w-64"
                />
                <FiSearch className="absolute left-2 top-3 text-gray-500" />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center" onClick={() => navigate("/add-employee")}>
                <FiPlus className="mr-2" /> Add New Employee
              </button>
              <button className="bg-gray-300 px-4 py-2 rounded-md flex items-center">
                <FiFilter className="mr-2" /> Filter
              </button>
            </div>
          </div>

          {/* Employee Table */}
          <div className={darkMode ? "bg-gray-800 text-white p-6 rounded-lg shadow-lg" : "bg-white p-6 rounded-lg shadow-lg"}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Employee Name</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                  {currentEmployees.map((emp) => (
                    <tr
                      key={emp.employeeId}
                      className="border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => navigate(`/employee-management/${emp.employeeId}`)}
                    >
                      <td className="py-2 flex items-center space-x-2">
                        <img src={emp.profilePic || "/default-avatar.png"} alt="profile" className="w-8 h-8 rounded-full" />
                        <span>{`${emp.firstName} ${emp.lastName}`}</span>
                      </td>
                      <td>{emp.employeeId}</td>
                      <td>{emp.department || "N/A"}</td>
                      <td>{emp.designation || "N/A"}</td>
                      <td>{emp.type}</td>
                      <td className="text-blue-600 cursor-pointer">{emp.status}</td>
                      <td>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(emp.employeeId); }} 
                          className="text-blue-500 mr-2"
                        >
                          ✏
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(emp.employeeId); }} 
                          className="text-red-500"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>
                Showing {indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, employees.length)} out of {employees.length} records
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  className={`px-2 py-1 border rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => goToPage(index + 1)}
                    className={`px-2 py-1 border rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : ""}`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  className={`px-2 py-1 border rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}