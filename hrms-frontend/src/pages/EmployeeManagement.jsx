import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaCalendarCheck, FaProjectDiagram, FaUmbrellaBeach, FaEdit, FaBriefcase, FaFileAlt } from "react-icons/fa";
import { FiSun, FiMoon } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

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
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [darkMode, setDarkMode] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {
    fetch(`http://localhost:5000/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => setEmployee(data))
      .catch((error) => console.error("Error fetching employee:", error));
  }, [id]);
  useEffect(() => {
    fetch(`http://localhost:5000/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data.documents); // Log to check the documents
        setEmployee(data);
      })
      .catch((error) => console.error("Error fetching employee:", error));
  }, [id]);
  

  useEffect(() => {
    fetch("http://localhost:5000/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  useEffect(() => {
    if (activeTab === 'Tasks') {
      fetch(`http://localhost:5000/api/tasks/employee/${id}`)
        .then((res) => res.json())
        .then((data) => setTasks(data))
        .catch((error) => console.error('Error fetching tasks:', error));
    }
  }, [activeTab, id]);
  const handleEdit = (employeeId) => {
    navigate(`/edit-employee/${employeeId}`);
  };


  useEffect(() => {
    // Fetch attendance data only when the "attendance" tab is active
    if (activeTab === 'attendance') {
      console.log("Fetching attendance data...");
      fetch(`http://localhost:5000/api/attendance/${id}`)
        .then((res) => {
          console.log('Response:', res);
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then((data) => {
          console.log('Attendance Data:', data);  // Log the parsed JSON data
          if (Array.isArray(data)) {
            setAttendanceData(data); // If it's an array, set the data
          } else {
            // If it's a single object (like in your case), wrap it in an array
            setAttendanceData([data]);
          }
        })
        .catch((error) => {
          console.error('Error fetching attendance data:', error);
        });
    }
  }, [activeTab, id]);




  if (!employee) return <p>Loading employee details...</p>;

  return (
    <div className="flex min-h-screen dark:bg-gray-900 dark:text-white  ml-[250px]">

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold dark:text-white">{employee.name}</h1>
            <p className="text-gray-500">{employee.designation}</p>
          </div>
          <button
            onClick={(e) => handleEdit(employee.employeeId)}
            className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg"

          >
            <FaEdit className="mr-2" /> Edit Profile
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white p-6 mt-4 shadow-md rounded-lg flex items-center dark:bg-gray-800 dark:text-white">
          <img
            src={employee.profilePic ? employee.profilePic : "/assets/default-avatar.jpg"}
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
          <div className="ml-4">
            <h2 className="text-xl font-bold dark:text-white">{employee.firstName}</h2>
            <p className="text-gray-500 dark:text-white">{employee.designation}</p>
            <p className="text-gray-500 dark:text-white">{employee.email}</p>
          </div>
        </div>
        {/* Sidebar Navigation */}
        <div className="flex mt-6">
          <div className="w-1/4">
            <ul className="space-y-4">
              <li
                onClick={() => setActiveTab("personal")}
                className={`cursor-pointer p-2 rounded-lg flex items-center ${activeTab === "personal" ? "bg-purple-500 text-white" : "text-gray-500"
                  }`}
              >
                <FaUser className="mr-2" /> Profile
              </li>
              <li
                onClick={() => setActiveTab("attendance")}
                className={`cursor-pointer p-2 rounded-lg flex items-center ${activeTab === "attendance" ? "bg-purple-500 text-white" : "text-gray-500"
                  }`}
              >
                <FaCalendarCheck className="mr-2" /> Attendance
              </li>
              <li
                onClick={() => setActiveTab("Tasks")}
                className={`cursor-pointer p-2 rounded-lg flex items-center ${activeTab === "Tasks" ? "bg-purple-500 text-white" : "text-gray-500"
                  }`}
              >
                <FaProjectDiagram className="mr-2" /> Tasks
              </li>
              {/* <li
                onClick={() => setActiveTab("leave")}
                className={`cursor-pointer p-2 rounded-lg flex items-center ${activeTab === "leave" ? "bg-purple-500 text-white" : "text-gray-700"
                  }`}
              >
                <FaUmbrellaBeach className="mr-2" /> Leave
              </li> */}
            </ul>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200 flex space-x-6 text-gray-600 dark:text-gray-500">
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
        <div className="p-4 bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-lg mt-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {/* Check if any document field exists and display it */}
                  {employee.aadharCard && (
                    <div key="aadharCard" className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                      <div className="flex-1">
                        <span className="text-gray-700">Aadhar Card</span>
                      </div>
                      <div className="flex space-x-2">
                        <a href={`http://localhost:5000/${employee.aadharCard}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          View
                        </a>
                        <a href={`http://localhost:5000/${employee.aadharCard}`} download className="text-green-500 hover:underline">
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {employee.appointmentLetter && (
                    <div key="appointmentLetter" className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                      <div className="flex-1">
                        <span className="text-gray-700">Appointment Letter</span>
                      </div>
                      <div className="flex space-x-2">
                        <a href={`http://localhost:5000/${employee.appointmentLetter}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          View
                        </a>
                        <a href={`http://localhost:5000/${employee.appointmentLetter}`} download className="text-green-500 hover:underline">
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {employee.otherDocument1 && (
                    <div key="otherDocument1" className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                      <div className="flex-1">
                        <span className="text-gray-700">Other Document 1</span>
                      </div>
                      <div className="flex space-x-2">
                        <a href={`http://localhost:5000/${employee.otherDocument1}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          View
                        </a>
                        <a href={`http://localhost:5000/${employee.otherDocument1}`} download className="text-green-500 hover:underline">
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {employee.otherDocument2 && (
                    <div key="otherDocument2" className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                      <div className="flex-1">
                        <span className="text-gray-700">Other Document 2</span>
                      </div>
                      <div className="flex space-x-2">
                        <a href={`http://localhost:5000/${employee.otherDocument2}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          View
                        </a>
                        <a href={`http://localhost:5000/${employee.otherDocument2}`} download className="text-green-500 hover:underline">
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {/* If no documents are uploaded */}
                  {!employee.aadharCard && !employee.appointmentLetter && !employee.otherDocument1 && !employee.otherDocument2 && (
                    <p className="text-gray-500">No documents uploaded.</p>
                  )}
                </div>
              </div>
            )}



          {activeTab === "attendance" && (
            <div>
              <h2 className="text-lg font-semibold text-purple-500">Attendance</h2>
              <div className="mt-4">
                {attendanceData.length > 0 ? (
                  <table className="min-w-full table-auto border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left border-b">Date</th>
                        <th className="px-4 py-2 text-left border-b">Check In</th>
                        <th className="px-4 py-2 text-left border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((attendance, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">  {format(new Date(attendance.date), 'MMM dd, yyyy')}</td>
                          <td className="px-4 py-2"> {attendance.status === "Present" ? format(new Date(attendance.check_in_time), 'hh:mm a') : '--'}</td>
                          <td className="px-4 py-2">{attendance.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No attendance records available.</p>
                )}
              </div>
            </div>
          )}

{activeTab === "Tasks" && (
            <div>
              <h2 className="text-lg font-semibold text-purple-500">Tasks</h2>
              <div className="mt-4">
                {tasks.length > 0 ? (
                  <table className="min-w-full table-auto border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left border-b">Task Name</th>
                        <th className="px-4 py-2 text-left border-b">Due Date</th>
                        <th className="px-4 py-2 text-left border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">{task.task_name}</td>
                          <td className="px-4 py-2">{format(new Date(task.due_date), 'MMM dd, yyyy')}</td>
                          <td className="px-4 py-2">{task.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No tasks found for this employee.</p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
