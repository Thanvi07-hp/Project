import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Attendance = () => {
  const [employees, setEmployees] = useState(() => {
    const savedData = localStorage.getItem("employees");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employees");
      const formattedEmployees = response.data.map(emp => ({
        ...emp,
        check_in_time: emp.check_in_time
          ? new Date(emp.check_in_time).toLocaleTimeString("en-GB", {
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
          })
          : "--",
        status: emp.status || "Not Marked"
      }));
      setEmployees(formattedEmployees);
      localStorage.setItem("employees", JSON.stringify(formattedEmployees)); // Save data
    }
    catch (err) {
      toast.error("Failed to fetch employees.");
    }
  };

  const markAttendance = async (employeeId, status) => {
    try {
      const response = await axios.post("http://localhost:5000/api/mark-attendance", { employeeId, status });
      const checkInTime = response.data.check_in_time;

      const updatedEmployees = employees.map(emp =>
        emp.employeeId === employeeId ? { ...emp, status, check_in_time: checkInTime } : emp
      );

      setEmployees(updatedEmployees);
      localStorage.setItem("employees", JSON.stringify(updatedEmployees));
      toast.success("Attendance marked successfully!");// Update local storage
    }
    catch (err) {
      toast.error("Error marking attendance.");
    }
  };

  const handleDownload = async () => {
    try {
      // Fetch the Excel file from the server
      const response = await fetch('http://localhost:5000/api/export-attendance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Failed to fetch the file');
      }

      // Convert the response to a Blob
      const blob = await response.blob();

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'attendance.xlsx'; // Set the filename for the download

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>
      <input
        type="text"
        placeholder="Search employees..."
        className="p-2 border rounded-lg mb-6 w-full focus:ring focus:ring-blue-300"
        onChange={(e) => setFilter(e.target.value.toLowerCase())}
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.filter(emp =>
                emp.firstName.toLowerCase().includes(filter) ||
                emp.lastName.toLowerCase().includes(filter)
              ).map((emp) => (
                <TableRow key={emp.employeeId}>
                  <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell>
                    {emp.check_in_time && emp.check_in_time.includes("T")
                      ? new Date(emp.check_in_time).toLocaleTimeString()
                      : emp.check_in_time || "--"}
                  </TableCell>

                  <TableCell>
                    <span className={
                      emp.status === "Present" ? "text-green-600" : "text-red-600"
                    }>
                      {emp.status || "Not Marked"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      className={`mr-2 px-4 py-2 rounded text-white ${emp.status === "Present" ? "bg-green-600" : "bg-gray-400"
                        }`}
                      onClick={() => markAttendance(emp.employeeId, "Present")}
                    >Present</Button>
                    <Button
                      className={`px-4 py-2 rounded text-white ${emp.status === "Absent" ? "bg-red-600" : "bg-gray-400"
                        }`}
                      onClick={() => markAttendance(emp.employeeId, "Absent")}
                    >Absent</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="w-full flex justify-center">
          <Button
            className="w-full mr-2 mt-4 px-4 py-2 rounded text-white"
            onClick={handleDownload}
          >
            Get Attendance
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Attendance;


