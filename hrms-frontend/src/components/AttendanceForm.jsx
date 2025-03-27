import { useState, useEffect } from "react";

const AttendanceForm = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});

  // 🔹 Fetch Attendance Data on Load
  const fetchAttendance = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/get-attendance");
      const data = await response.json();
  
      if (response.ok) {
        console.log("📌 Fetched Attendance Data:", data);
  
        // Store attendance in state
        const attendanceMap = {};
        data.forEach((record) => {
          attendanceMap[record.employee_id] = record.status;
        });
  
        setAttendance(attendanceMap);
      }
    } catch (error) {
      console.error("⚠️ Error fetching attendance:", error);
    }
  };
  

  // 🔹 Function to Handle Attendance Change
  const handleAttendanceChange = async (employeeId, status) => {
    try {
      const response = await fetch("http://localhost:5000/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Attendance updated:", data);
        fetchAttendance(); // 🔄 Refresh data after update
      } else {
        console.error("⚠️ Failed to update attendance:", data.message);
      }
    } catch (error) {
      console.error("❌ Error updating attendance:", error);
    }
  };

  return (
    <div>
      <h2>Attendance</h2>
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>
              <select
  value={attendance[emp.id] || ""}
  onChange={(e) => handleAttendanceChange(emp.id, e.target.value)}
>
  <option value="">Select</option>
  <option value="Present">Present</option>
  <option value="Absent">Absent</option>
  <option value="Leave">Leave</option>
</select>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceForm;
