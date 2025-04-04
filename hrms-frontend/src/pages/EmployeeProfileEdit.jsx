import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { FaEdit, FaUser, FaBriefcase, FaFileAlt } from "react-icons/fa";

export default function EmployeeProfileEdit() {
    const { id } = useParams();
    console.log("Employee ID from useParams:", id);
    const [employee, setEmployee] = useState(null);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");
    const [error, setError] = useState(null);
  
    const formatDateOnly = (isoDate) => {
        if (!isoDate) return null;
        return isoDate.split("T")[0]; 
      };
      
    
    useEffect(() => {
        fetch(`http://localhost:5000/api/employees/${id}`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
          })
          .then((data) => {
            if (!data || Object.keys(data).length === 0) {
              console.error("Empty employee data received.");
            } else {
              setEmployee(data);
              setFormData(data);
            }
          })
          .catch((error) => {
            console.error("Error fetching employee:", error);
            setError("Failed to load employee details.");
          });
      }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
  
      const handleSave = () => {
        console.log("Trying to update employee with ID:", id);
        const updatedData = {
            ...formData,
            dob: formatDateOnly(formData.dob),
            joiningDate: formatDateOnly(formData.joiningDate),
          };
        
          console.log("Sending this payload:", updatedData);
          
        fetch(`http://localhost:5000/api/employees/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        })
          .then((res) => {
            console.log("Response status:", res.status);
            return res.json();
          })
          .then((data) => {
            console.log("Response data:", data);
            if (data.message) {
              alert("Profile updated successfully!");
              setEmployee(formData);
              setIsEditing(false);
            } else {
              alert("Something went wrong while updating.");
            }
          })
          .catch((error) => {
            console.error("Error updating employee:", error);
            alert("Error updating profile. Please try again.");
          });
      };
      
      if (!employee) return <p>Loading employee details...</p>;
        
      return (
        <div className="flex min-h-screen bg-gray-100">
          <EmployeeSidebar employee={employee} />
          <div className="flex-1 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">{`${employee.firstName} ${employee.lastName}`}</h1>
                <p className="text-gray-500">{employee.designation}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg"
              >
                <FaEdit className="mr-2" /> {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
    
            <div className="bg-white p-6 mt-4 shadow-md rounded-lg flex items-center">
              <img
                src={employee.profilePic || "/default-avatar.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full"
              />
              <div className="ml-4">
                <h2 className="text-xl font-bold">{`${employee.firstName} ${employee.lastName}`}</h2>
                <p className="text-gray-500">{employee.email}</p>
              </div>
            </div>
    
            <div className="mt-6 border-b border-gray-200 flex space-x-6 text-gray-600">
              <button
                onClick={() => setActiveTab("personal")}
                className={`pb-2 border-b-2 ${
                  activeTab === "personal"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent"
                }`}
              >
                <FaUser className="inline mr-2" /> Personal Information
              </button>
              <button
                onClick={() => setActiveTab("professional")}
                className={`pb-2 border-b-2 ${
                  activeTab === "professional"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent"
                }`}
              >
                <FaBriefcase className="inline mr-2" /> Professional Information
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`pb-2 border-b-2 ${
                  activeTab === "documents"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent"
                }`}
              >
                <FaFileAlt className="inline mr-2" /> Documents
              </button>
            </div>
    
            <div className="p-4 bg-white shadow-md rounded-lg mt-4">
              {activeTab === "personal" && (
                <div>
                  <h2 className="text-lg font-semibold text-purple-500">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {[
                      "firstName",
                      "lastName",
                      "mobile",
                      "email",
                      "dob",
                      "maritalStatus",
                      "gender",
                      "nationality",
                      "address",
                      "city",
                      "state",
                      "zip",
                    ].map((field) => (
                      <div key={field}>
                        <label className="font-semibold capitalize">
                          {field === "dob" ? "Date of Birth" : field}
                        </label>
                        {isEditing ? (
                            field === "dob" ? (
                                <input
                                type="date"
                                name={field}
                                value={formData[field] ? formatDateOnly(formData[field]) : ""}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                            ) : (
                                <input
                                type="text"
                                name={field}
                                value={formData[field] || ""}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                            )
                            ) : (
                            <p>{field === "dob" ? formatDateOnly(employee.dob) : employee[field]}</p>
                            )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
    
              {activeTab === "professional" && (
                <div>
                  <h2 className="text-lg font-semibold text-purple-500">
                    Professional Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {["type", "department", "designation", "joiningDate"].map(
                      (field) => (
                        <div key={field}>
                          <label className="font-semibold capitalize">
                            {field === "joiningDate"
                              ? "Joining Date"
                              : field}
                          </label>
                          {isEditing ? (
                            field === "joiningDate" ? (
                                <input
                                type="date"
                                name={field}
                                value={formData[field] ? formatDateOnly(formData[field]) : ""}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                            ) : (
                                <input
                                type="text"
                                name={field}
                                value={formData[field] || ""}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                            )
                            ) : (
                            <p>
                                {field === "joiningDate"
                                ? formatDateOnly(employee.joiningDate)
                                : employee[field]}
                            </p>
                            )}

                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
    
              {activeTab === "documents" && (
                <div>
                  <h2 className="text-lg font-semibold text-purple-500">
                    Documents
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {employee.documents && employee.documents.length > 0 ? (
                      employee.documents.slice(0, 4).map((doc, index) => (
                        <div
                          key={index}
                          className="flex justify-between bg-gray-100 p-2 rounded-lg"
                        >
                          <span>{doc.name || `Document ${index + 1}`}</span>
                          <div className="flex space-x-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View
                            </a>
                            <a
                              href={doc.url}
                              download
                              className="text-green-500 hover:underline"
                            >
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
    
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }    