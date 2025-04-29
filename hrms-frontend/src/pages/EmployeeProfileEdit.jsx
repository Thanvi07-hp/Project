import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { FaEdit, FaUser, FaBriefcase, FaFileAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function EmployeeProfileEdit() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [error, setError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSave = () => {
    console.log("Trying to update employee with ID:", id);
    const updatedData = {
      ...formData,
      dob: formatDateOnly(formData.dob),
      joiningDate: formatDateOnly(formData.joiningDate),
    };

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
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          toast.success("Profile updated successfully!");
          setEmployee(formData);
          setIsEditing(false);
        } else {
          toast.error("Something went wrong while updating.");
        }
      })
      .catch((error) => {
        console.error("Error updating employee:", error);
        toast.error("Error updating profile. Please try again.");
      });
  };

  const handleDocumentReplace = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType); // The field to replace in the database

    try {
      const response = await axios.put(`http://localhost:5000/api/employees/${id}/replace-doc`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert('Document replaced successfully!');
        setEmployee((prev) => ({
          ...prev,
          [documentType]: response.data.newDocUrl, // Update the UI with the new document path
        }));
      } else {
        alert('Failed to replace document.');
      }
    } catch (error) {
      console.error('Replace failed:', error.response?.data || error.message); // Log detailed error information
      if (error.response) {
        console.error('Backend error response:', error.response.data); // Log the backend error response
      }
      alert('Document replacement failed.');
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    const token = localStorage.getItem("token"); // Assuming you store JWT in localStorage

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${id}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Attach token
        },
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Password updated successfully!");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result.error || "Failed to update password.");
      }
    } catch (err) {
      console.error("Password update failed:", err);
      toast.error("Something went wrong.");
    }
  };





  return (
    <>
     
        <div>
          <ToastContainer />
          <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white">
            <EmployeeSidebar employee={employee} />
            <div className="flex-1 p-6">
            {!employee ? (
            <p>Loading employee details...</p>
          ) : (
            <>
              <div className="flex justify-between items-center dark:bg-gray-900 dark:text-white">
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

              <div className="bg-white p-6 mt-4 shadow-md rounded-lg flex items-center dark:bg-gray-800 dark:text-white-800">
                <img
                  src={employee.profilePic || "/assets/default-avatar.jpg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full"
                />
                <div className="ml-4 flex justify-between items-end w-full">

                  <div className="mr-14">

                    <h2 className="text-xl font-bold">{`${employee.firstName} ${employee.lastName}`}</h2>
                    <p className="text-gray-500">{employee.email}</p>
                  </div>
                  

                    <button
                      onClick={() => setActiveTab("changePassword")}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg mt-3 ml-14 "
                    >
                      🔒 Change Password
                    </button>
                  
                </div>
              </div>

              <div className="mt-6 border-b border-gray-200 flex space-x-6 text-gray-600 dark:bg-gray-900 dark:text-white">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`pb-2 border-b-2 ${activeTab === "personal"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent"
                    }`}
                >
                  <FaUser className="inline mr-2" /> Personal Information
                </button>
                <button
                  onClick={() => setActiveTab("professional")}
                  className={`pb-2 border-b-2 ${activeTab === "professional"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent"
                    }`}
                >
                  <FaBriefcase className="inline mr-2" /> Professional Information
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`pb-2 border-b-2 ${activeTab === "documents"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent"
                    }`}
                >
                  <FaFileAlt className="inline mr-2" /> Documents
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-lg mt-4">
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
                            <input
                              type="file"
                              onChange={(e) => handleDocumentReplace(e, "aadharCard")}
                              className="text-green-500 hover:underline"
                              style={{ display: 'none' }}
                              id="aadharCardReplace"
                            />
                            <label
                              htmlFor="aadharCardReplace"
                              className="cursor-pointer text-orange-500 hover:underline"
                            >
                              Replace
                            </label>
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
                            <input
                              type="file"
                              onChange={(e) => handleDocumentReplace(e, "appointmentLetter")}
                              className="text-green-500 hover:underline"
                              style={{ display: 'none' }}
                              id="appointmentLetterReplace"
                            />
                            <label
                              htmlFor="appointmentLetterReplace"
                              className="cursor-pointer text-orange-500 hover:underline"
                            >
                              Replace
                            </label>
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
                            <input
                              type="file"
                              onChange={(e) => handleDocumentReplace(e, "otherDocument1")}
                              className="text-green-500 hover:underline"
                              style={{ display: 'none' }}
                              id="otherDocument1Replace"
                            />
                            <label
                              htmlFor="otherDocument1Replace"
                              className="cursor-pointer text-orange-500 hover:underline"
                            >
                              Replace
                            </label>
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
                            <input
                              type="file"
                              onChange={(e) => handleDocumentReplace(e, "otherDocument2")}
                              className="text-green-500 hover:underline"
                              style={{ display: 'none' }}
                              id="otherDocument2Replace"
                            />
                            <label
                              htmlFor="otherDocument2Replace"
                              className="cursor-pointer text-orange-500 hover:underline"
                            >
                              Replace
                            </label>
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

                {activeTab === "changePassword" && (
                  <div>
                    <h2 className="text-lg font-semibold text-purple-500 mb-4">Change Password</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Old Password */}
                      <div>
                        <label className="font-semibold">Old Password</label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? "text" : "password"}
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowOldPassword((prev) => !prev)}
                          >
                            {showOldPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="font-semibold">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                          >
                            {showNewPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="font-semibold">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                          >
                            {showConfirmPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordUpdate}
                      className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg"
                    >
                      Save Password
                    </button>
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
              </>)}
            </div>
          </div>
        </div>
       
    </>
  );
}    