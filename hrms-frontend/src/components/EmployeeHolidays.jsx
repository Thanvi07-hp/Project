import { useEffect, useState } from "react";
import EmployeeSidebar from "./EmployeeSidebar";
import { ClipLoader } from "react-spinners";

export default function EmployeeHolidays() {
  const [employee, setEmployee] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const employeeId = localStorage.getItem("employeeId");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
        const empData = await empRes.json();
        setEmployee(empData);

        const holidayRes = await fetch("http://localhost:5000/api/holidays");
        const holidaysData = await holidayRes.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const holidaysWithStatus = holidaysData.map((holiday) => {
          const date = new Date(holiday.date);
          date.setHours(0, 0, 0, 0);
          return {
            ...holiday,
            status: date >= today ? "Upcoming" : "Past",
          };
        });

        setHolidays(holidaysWithStatus);
      } catch (err) {
        console.error("Error fetching employee or holidays:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployeeSidebar employee={employee} />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">📅 Holiday List</h2>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <ClipLoader size={40} color="#2563eb" />
            </div>
          ) : holidays.length === 0 ? (
            <p className="text-gray-500">No holidays found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-white">
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th className="text-left p-3 border border-white">Date</th>
                      <th className="text-left p-3 border border-white">Day</th>
                      <th className="text-left p-3 border border-white">Holiday Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map((holiday, index) => (
                      <tr key={index} className="border-b relative">
                        <td className="p-3 border relative border-white">
                          <div
                            className={`absolute left-0 top-0 h-full w-[4px] ${
                              holiday.status === "Upcoming"
                                ? "bg-blue-500"
                                : "bg-orange-400"
                            }`}
                          ></div>
                          {formatDate(holiday.date)}
                        </td>
                        <td className="p-3 border border-white">{holiday.day}</td>
                        <td className="p-3 border border-white">{holiday.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-700">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Upcoming Holidays
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
                  Past Holidays
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}