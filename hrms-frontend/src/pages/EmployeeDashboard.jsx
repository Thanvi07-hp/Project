import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeSidebar from "../components/EmployeeSidebar";


export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const employeeId = localStorage.getItem("employeeId");

    if (!token || !employeeId) {
      navigate("/login");
      return;
    }

    const fetchEmployee = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
          
        });
        console.log("Fetching employee from:", `http://localhost:5000/api/employees/${employeeId}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Received Employee Data:", data);
        setEmployee(data);
        setProfilePicture(data.profilePic || "/default-placeholder.png");
      } catch (error) {
        console.error("Error fetching employee:", error.message);
      }
    };

    fetchEmployee();
  }, [navigate]);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

     try {
      const response = await fetch("http://localhost:5000/api/employees/upload-profile-pic", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }

      const data = await response.json();
      setProfilePicture(data.profilePic);
      setEmployee((prev) => ({ ...prev, profilePic: data.profilePic }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <EmployeeSidebar employee={employee} />

       {/* Main Content */}
       <div className="flex-1 p-8">
       <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Hello, {employee && employee.firstName ? `${employee.firstName} ${employee.lastName}` : "Employee"} 👋
        </h2>

        <div className="flex items-center mb-6">
          {/* Profile Picture */}
          <div className="relative">
            <label htmlFor="profile-upload">
              <img
                src={profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 cursor-pointer"
              />
            </label>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
          </div>

          {/* Welcome Message */}
          <div className="ml-4">
            <h2 className="text-3xl font-bold mb-2">
              🎉 Welcome, {employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}! To Your Dashboard 🎉
            </h2>
            <p className="text-gray-600">We're thrilled to have you here! 🚀</p>
          </div>
        </div>
      </div>
    </div>
  );
}