import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import EmployeeSidebar from "./EmployeeSidebar";
import { useNavigate } from "react-router-dom";

export default function EmployeeAttendance() {
    const [employee, setEmployee] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [chartData, setChartData] = useState([]);
    const navigate = useNavigate();
  
    const formatDate = (isoDate) => {
      const date = new Date(isoDate);
      return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
    };
    
    const formatTime = (isoDate) => {
      if (!isoDate) return "—";
      const date = new Date(isoDate);
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    };  

    useEffect(() => {
        const fetchEmployeeAndAttendance = async () => {
          const employeeId = localStorage.getItem("employeeId");
          console.log("📌 employeeId from localStorage:", employeeId);
      
          if (!employeeId) {
            console.warn("⚠️ No employeeId found in localStorage. Redirecting to login.");
            navigate("/login");
            return;
          }
      
          try {
            const resEmp = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
            if (!resEmp.ok) throw new Error(`❌ Failed to fetch employee: ${resEmp.status}`);
            const empData = await resEmp.json();
            setEmployee(empData);
      
            const resAttendance = await fetch(`http://localhost:5000/api/attendance/${employeeId}`);
            if (!resAttendance.ok) {
            const errorText = await resAttendance.text();
            throw new Error(`❌ Failed to fetch attendance: ${resAttendance.status}\n${errorText}`);
            }
            const attendanceData = await resAttendance.json();
            setAttendance(attendanceData);
      
            const formattedChartData = attendanceData.map((record) => ({
              date: formatDate(record.date),
              status: record.status === "Present" ? 1 : 0,
            }));
            setChartData(formattedChartData);
            
          } catch (err) {
            console.error("🚨 Error fetching employee or attendance:", err);
          }
        };
      
        fetchEmployeeAndAttendance();
      }, [navigate]);
      

  if (!employee) return <div>Loading...</div>;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployeeSidebar employee={employee} />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">My Attendance</h2>

        <div className="mb-8 bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-medium mb-4">Attendance Overview</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="status" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-medium mb-4">Attendance Records</h3>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Check-in Time</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record.id} className="text-center">
                  <td className="border px-4 py-2">{formatDate(record.date)}</td>
                  <td className="border px-4 py-2">{record.status}</td>
                  <td className="border px-4 py-2">{formatTime(record.check_in_time)}</td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}