import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditEmployee() {
  const { employeeId } = useParams(); // Get employee ID from URL
  const navigate = useNavigate();
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
    type: "Full-Time",
    department: "",
    designation: "",
    workingDays: "",
    joiningDate: "",
    role: "Employee",
    status: "Active",
    profilePic: "",
    aadharCard: "",
    appointmentLetter: "",
    otherDocument1: "",
    otherDocument2: "",
  });

  const [loading, setLoading] = useState(true);

      useEffect(() => {
        console.log("Employee ID changed:", employeeId);
        const fetchEmployee = async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
        
            if (!response.ok) {
              throw new Error(`❌ Employee not found (ID: ${employeeId})`);
            }
        
            const data = await response.json();
            console.log("✅ Fetched Employee:", data);
        
            // Function to format date correctly for input fields
            const formatDate = (dateString) => {
              if (!dateString) return ""; // Ensure empty string for null values
              return dateString.split("T")[0]; // Extract only YYYY-MM-DD
            };
        
            // Ensure `null` values default to empty strings & fix date format
            setEmployee((prev) => ({
              ...prev,
              ...Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                  key,
                  key === "dob" || key === "joiningDate" ? formatDate(value) : value ?? "",
                ])
              ),
            }));
          } catch (error) {
            console.error("Error fetching employee:", error);
            alert(error.message);
          } finally {
            setLoading(false);
          }
        };
        if (employeeId) fetchEmployee();
    }, [employeeId]);


  const handleChange = (e) => {
    setEmployee((prev) => ({
      ...prev,
      [e.target.name]: e.target.value || "",
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Updating Employee:", employee);

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      const result = await response.json();
      console.log("Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to update employee");
      }

      alert("✅ Employee updated successfully!");
      navigate("/all-employees");
    } catch (error) {
      console.error("❌ Update error:", error);
      alert(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg  ml-[250px]">
      <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="firstName" value={employee.firstName} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="First Name" />
          <input type="text" name="lastName" value={employee.lastName} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="Last Name" />
        </div>

        {/* Contact Information */}
        <input type="text" name="mobile" value={employee.mobile} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="Mobile Number" />
        <input type="email" name="email" value={employee.email} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="Email" />

        {/* Personal Details */}
        <div className="grid grid-cols-2 gap-4">
          <input type="date" name="dob" value={employee.dob} onChange={handleChange} className="w-full p-2 border rounded" required />
          <select name="maritalStatus" value={employee.maritalStatus} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
        </div>

        <select name="gender" value={employee.gender} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input type="text" name="nationality" value={employee.nationality} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="Nationality" />

        {/* Address */}
        <textarea name="address" value={employee.address} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Address"></textarea>

        <div className="grid grid-cols-3 gap-4">
          <input type="text" name="city" value={employee.city} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="City" />
          <input type="text" name="state" value={employee.state} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="State" />
          <input type="text" name="zip" value={employee.zip} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="ZIP Code" />
        </div>

        {/* Work Details */}
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="department" value={employee.department} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="Department" />
          <input type="text" name="designation" value={employee.designation} onChange={handleChange} className="w-full p-2 border rounded" required placeholder="Designation" />
        </div>

        <select name="type" value={employee.type} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Contract">Contract</option>
        </select>

        <select name="status" value={employee.status} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select name="workingDays" value={employee.workingDays} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="5 Days">5 Days</option>
            <option value="6 Days">6 Days</option>
        </select>
        <input type="date" name="joiningDate" value={employee.joiningDate} onChange={handleChange} className="w-full p-2 border rounded" required />

        {/* Profile Picture */}
        <input type="text" name="profilePic" value={employee.profilePic} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Profile Picture URL" />

        {/* Documents */}
        <input type="text" name="aadharCard" value={employee.aadharCard} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Aadhar Card URL" />
        <input type="text" name="appointmentLetter" value={employee.appointmentLetter} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Appointment Letter URL" />
        <input type="text" name="otherDocument1" value={employee.otherDocument1} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Other Document 1 URL" />
        <input type="text" name="otherDocument2" value={employee.otherDocument2} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Other Document 2 URL" />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Save Changes</button>
      </form>
    </div>
  );
}
