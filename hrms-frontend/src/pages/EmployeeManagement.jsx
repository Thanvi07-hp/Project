import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaCalendarCheck, FaProjectDiagram, FaUmbrellaBeach, FaEdit, FaBriefcase, FaFileAlt } from "react-icons/fa";
import { FiSun, FiMoon } from 'react-icons/fi'; 
import { useNavigate } from 'react-router-dom';

const formatDate = (dob) => {
  if (!dob) return "N/A";
  const date = new Date(dob);
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
};
export default function EmployeeManagement() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [darkMode, setDarkMode] = useState(false); 
  const navigate = useNavigate();


  useEffect(() => {
    fetch(`http://localhost:5000/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => setEmployee(data))
      .catch((error) => console.error("Error fetching employee:", error));
  }, [id]);

  if (!employee) return <p>Loading employee details...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`w-64 p-4 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg flex flex-col justify-between`}>  <div>
      <h2 className="text-2xl font-bold mb-4">HRMS</h2>       
       <nav>
       <ul>
                <li className="py-2 cursor-pointer" onClick={() => navigate("/admin-dashboard")}>
                  Dashboard
                </li>
                <li className="py-2 cursor-pointer bg-blue-500 text-white rounded-md p-2" onClick={() => navigate("/all-employees")}>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{employee.name}</h1>
            <p className="text-gray-500">{employee.designation}</p>
          </div>
          <button className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg">
            <FaEdit className="mr-2" /> Edit Profile
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white p-6 mt-4 shadow-md rounded-lg flex items-center">
          <img
            src={employee.profilePic || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
          <div className="ml-4">
            <h2 className="text-xl font-bold">{employee.name}</h2>
            <p className="text-gray-500">{employee.jobTitle}</p>
            <p className="text-gray-500">{employee.email}</p>
          </div>
        </div>
         {/* Sidebar Navigation */}
         <div className="flex mt-6">
          <div className="w-1/4">
            <ul className="space-y-4">
              <li
                onClick={() => setActiveTab("personal")}
                className={`cursor-pointer p-2 rounded-lg flex items-center ${
                  activeTab === "personal" ? "bg-purple-500 text-white" : "text-gray-700"
                }`}
              >
                <FaUser className="mr-2" /> Profile
              </li>
              <li
                onClick={() => setActiveTab("attendance")}
                className={`cursor-pointer p-2 rounded-lg flex items-center ${
                  activeTab === "attendance" ? "bg-purple-500 text-white" : "text-gray-700"
                }`}
              >
                <FaCalendarCheck className="mr-2" /> Attendance
              </li>
              <li
                onClick={() => setActiveTab("projects")}
                className={`cursor-pointer p-2 rounded-lg flex items-center ${
                  activeTab === "projects" ? "bg-purple-500 text-white" : "text-gray-700"
                }`}
              >
                <FaProjectDiagram className="mr-2" /> Projects
              </li>
              <li
                onClick={() => setActiveTab("leave")}
                className={`cursor-pointer p-2 rounded-lg flex items-center ${
                  activeTab === "leave" ? "bg-purple-500 text-white" : "text-gray-700"
                }`}
              >
                <FaUmbrellaBeach className="mr-2" /> Leave
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200 flex space-x-6 text-gray-600">
          <button onClick={() => setActiveTab("personal")} className={`pb-2 border-b-2 ${activeTab === "personal" ? "border-purple-500 text-purple-600" : "border-transparent"}`}>
            <FaUser className="inline mr-2" /> Personal Information
          </button>
          <button onClick={() => setActiveTab("professional")} className={`pb-2 border-b-2 ${activeTab === "professional" ? "border-purple-500 text-purple-600" : "border-transparent"}`}>
            <FaBriefcase className="inline mr-2" /> Professional Information
          </button>
          <button onClick={() => setActiveTab("documents")} className={`pb-2 border-b-2 ${activeTab === "documents" ? "border-purple-500 text-purple-600" : "border-transparent"}`}>
            <FaFileAlt className="inline mr-2" /> Documents
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="p-4 bg-white shadow-md rounded-lg mt-4">
          {activeTab === "personal" && (
            <div>
              <h2 className="text-lg font-semibold text-purple-500">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <p><strong>First Name:</strong> {employee.firstName}</p>
                <p><strong>Last Name:</strong> {employee.lastName}</p>
                <p><strong>Mobile:</strong> {employee.mobile}</p>
                <p><strong>Email:</strong> {employee.email}</p>
                <p><strong>Date of Birth:</strong> {formatDate(employee.dob)}</p>
                <p><strong>Marital Status:</strong> {employee.maritalStatus}</p>
                <p><strong>Gender:</strong> {employee.gender}</p>
                <p><strong>Nationality:</strong> {employee.nationality}</p>
                <p><strong>Address:</strong> {employee.address}</p>
                <p><strong>City:</strong> {employee.city}</p>
                <p><strong>State:</strong> {employee.state}</p>
                <p><strong>Zip Code:</strong> {employee.zip}</p>
              </div>
            </div>
          )}

          {activeTab === "professional" && (
            <div>
              <h2 className="text-lg font-semibold text-purple-500">Professional Information</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <p><strong>Employee Type:</strong> {employee.type}</p>
                <p><strong>Department:</strong> {employee.department}</p>
                <p><strong>Designation:</strong> {employee.designation}</p>
                <p><strong>Joining Date:</strong> {formatDate(employee.joiningDate)}</p>
              </div>
            </div>
          )}

            {activeTab === "documents" && (
              <div>
                <h2 className="text-lg font-semibold text-purple-500">Documents</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {employee.documents && employee.documents.length > 0 ? (
                    employee.documents.slice(0, 4).map((doc, index) => (
                      <div key={index} className="flex justify-between bg-gray-100 p-2 rounded-lg">
                        <span>{doc.name || `Document ${index + 1}`}</span>
                        <div className="flex space-x-2">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            View
                          </a>
                          <a href={doc.url} download className="text-green-500 hover:underline">
                            Download
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No documents uploaded.</p>
                  )}
                </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}
