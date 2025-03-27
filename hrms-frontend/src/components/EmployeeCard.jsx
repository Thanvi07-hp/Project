import { useState } from "react";

export default function EmployeeCard({ employee }) {
  const [status, setStatus] = useState(employee.status || "Select Status");

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);

    try {
      const response = await fetch("http://localhost:5000/api/attendance/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: employee.id,
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          status: newStatus,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Failed to update attendance:", result.message);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow">
      <div className="flex items-center gap-3">
        <img
          src={employee.profileImage || "/default-avatar.png"}
          alt={employee.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{employee.name}</p>
          <p className="text-sm text-gray-500">
            {status === "Present"
              ? "Checked In"
              : status === "Absent"
              ? "Not Checked In"
              : status === "Sick Leave"
              ? "On Leave"
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="text-center text-gray-600 text-sm">
        <p>{employee.work_type || "N/A"}</p>
        <p className="font-semibold">
          {status === "Present"
            ? "✔ Checked In"
            : status === "Absent"
            ? "❌ Not Checked In"
            : status === "Sick Leave"
            ? "🤒 On Leave"
            : "N/A"}
        </p>
      </div>

      <select
        value={status}
        onChange={handleStatusChange}
        className="px-3 py-1 text-xs font-semibold rounded-md border border-gray-300"
      >
        <option value="Select Status" disabled>
          -- Select Status --
        </option>
        <option value="Present">✅ Present</option>
        <option value="Absent">❌ Absent</option>
        <option value="Sick Leave">🤒 Sick Leave</option>
      </select>
    </div>
  );
}
