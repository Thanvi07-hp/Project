import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import { Form } from 'react-bootstrap';

export default function AddEmployee() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    dob: "",
    maritalStatus: "",
    gender: "",
    nationality: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    type: "",
    status: "Active", 
    department: "",
    designation: "",
    workingDays: "",
    joiningDate: "",
    
    profilePic: null,
    aadharCard: null,
    appointmentLetter: null,
    otherDocument1: null,
    otherDocument2: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    setEmployee((prev) => ({
        ...prev,
        [name]: files[0], // Store the selected file
    }));
};
  
  
  const handleNext = () => {
    const tabs = ["personal", "professional", "documents"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab !== "documents") {
      setActiveTab(
        activeTab === "personal" ? "professional" :
        activeTab === "professional" ? "documents" :
        "documents"
      );
      return;
    }

    const formData = new FormData();

    Object.entries(employee).forEach(([key, value]) => {
        if (value && !(value instanceof File)) {
            formData.append(key, value);
        }
    });

    if (employee.profilePic) formData.append("profilePic", employee.profilePic);
    if (employee.aadharCard) formData.append("aadharCard", employee.aadharCard);
    if (employee.appointmentLetter) formData.append("appointmentLetter", employee.appointmentLetter);
    if (employee.otherDocument1) formData.append("otherDocument1", employee.otherDocument1);
    if (employee.otherDocument2) formData.append("otherDocument2", employee.otherDocument2);
    
    console.log("Sending the following form data to backend:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
  
    try {
        const response = await fetch("http://localhost:5000/api/employees", {
            method: "POST",
            body: formData,
        });

        console.log("Backend response:", response.data);

        if (!response.ok) {
            console.error("Response status:", response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response has JSON data
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
        }

        const responseData = await response.json();
        console.log("Response Data:", responseData);

        if (responseData.generatedPassword) {
          alert(`Employee added successfully!\nGenerated Password: ${responseData.generatedPassword}`);
        } else {
          alert("Employee added successfully!");
        }
        navigate("/all-employees");

    } catch (error) {
        console.error("Error:", error.message);
        alert(`Error: ${error.message}`);
    }
};


  return (
    <div className="flex">
      

      {/* Main Section */}
      <div className="w-4/5 p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Employee</h2>

        {/* Tabs */}
        <div className="border-b flex space-x-4 text-gray-600">
          <span 
            className={`pb-2 cursor-pointer ${activeTab === "personal" ? "border-b-2 border-purple-600 text-black" : ""}`} 
            onClick={() => setActiveTab("personal")}
          >
            Personal Information
          </span>
          <span 
            className={`pb-2 cursor-pointer ${activeTab === "professional" ? "border-b-2 border-purple-600 text-black" : ""}`} 
            onClick={() => setActiveTab("professional")}
          >
            Professional Information
          </span>
          <span 
            className={`pb-2 cursor-pointer ${activeTab === "documents" ? "border-b-2 border-purple-600 text-black" : ""}`} 
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </span>
          <span 
            className={`pb-2 cursor-pointer ${activeTab === "account" ? "border-b-2 border-purple-600 text-black" : ""}`} 
            onClick={() => setActiveTab("account")}
          >
            
          </span>
        </div>

        {/* Tab Content */}
        {activeTab === "personal" && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mt-4">
           <div className="grid grid-cols-2 gap-4">
              <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="text" name="mobile" placeholder="Mobile Number" onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full p-2 border rounded" required />
                <div className="flex flex-col">
                    <label className="font-medium mb-1 text-sm text-gray-400">DOB</label>
                    <input type="date" name="dob" onChange={handleChange} className="w-full p-2 border rounded" required />                
                </div>
              <select name="maritalStatus" onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
            <select name="gender" onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input type="text" name="nationality" placeholder="Nationality" onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="text" name="address" placeholder="Address" onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="text" name="city" placeholder="City" onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="text" name="state" placeholder="State" onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="text" name="zip" placeholder="ZIP Code" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

            {/* Buttons */}
            <div className="flex justify-end mt-4">
              <button type="button" className="px-4 py-2 bg-gray-300 rounded mr-2" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="px-4 py-2  bg-black text-white rounded">Next</button>
            </div>
          </form>
        )}

        {activeTab === "professional" && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mt-4">
            <div className="grid grid-cols-2 gap-4">
            <select name="type" value={employee.type} onChange={handleChange} className="w-full p-2 border rounded" required>
                <option value="">Select Employee Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
            </select>
              <select name="department" onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">Select Department</option>
                <option value="HR">HR</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
              </select>
              <input type="text" name="designation" placeholder="Enter Designation" onChange={handleChange} className="w-full p-2 border rounded" required />
              <select name="workingDays" onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">Select Working Days</option>
                <option value="5 Days">5 Days</option>
                <option value="6 Days">6 Days</option>
              </select>
              <div className="flex flex-col">
                <label className="font-medium mb-1 text-sm text-gray-400">Joining Date</label>
                <input type="date" name="joiningDate" onChange={handleChange} className="w-full p-2 border rounded" required />
              </div>

            </div>
            <div className="flex justify-end mt-4">
              <button type="button" className="px-4 py-2 bg-gray-300 rounded mr-2" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="px-4 py-2  bg-black text-white rounded">Next</button>
            </div>
          </form>
        )}

        {activeTab === "documents" && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mt-4">
            <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded-lg text-center">
                <label>Upload Aadhar Card </label>
                <div className="border-dashed border-2 p-6 rounded-lg mt-2">
                <input type="file" name="aadharCard" onChange={handleFileChange} accept="image/jpeg, application/pdf"/>
                  <p className="text-gray-400 text-sm">Supported formats: Jpeg, pdf</p>
                </div>
              </div>
              <div className="border p-4 rounded-lg text-center">
                <label>Upload Appointment Letter </label>
                <div className="border-dashed border-2 p-6 rounded-lg mt-2">
                <input type="file" name="appointmentLetter" onChange={handleFileChange} accept="image/jpeg, application/pdf"/>
                  <p className="text-gray-400 text-sm">Supported formats: Jpeg, pdf</p>
                </div>
              </div>

              <div className="border p-4 rounded-lg text-center">
                <label>Upload PAN Card </label>
                <div className="border-dashed border-2 p-6 rounded-lg mt-2">
                <input type="file" name="otherDocument1" onChange={handleFileChange} accept="image/jpeg, application/pdf"/>
                  <p className="text-gray-400 text-sm">Supported formats: Jpeg, pdf</p>
                </div>
              </div>

              <div className="border p-4 rounded-lg text-center">
                <label>Upload Other Document </label>
                <div className="border-dashed border-2 p-6 rounded-lg mt-2">
                <input type="file" name="otherDocument2" onChange={handleFileChange} accept="image/jpeg, application/pdf"/>
                  <p className="text-gray-400 text-sm">Supported formats: Jpeg, pdf</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button type="button" className="px-4 py-2 bg-gray-300 rounded mr-2" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-black text-white rounded">Done</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}