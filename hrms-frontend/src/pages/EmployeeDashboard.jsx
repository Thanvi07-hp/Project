import { useState, useEffect } from "react";

export default function EmployeeDashboard({ employeeId }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/tasks/${employeeId}`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error));
  }, [employeeId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Your Assigned Tasks</h2>
      <ul className="mt-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.taskId} className="border p-2 rounded-md mt-2">
              <strong>Task:</strong> {task.description}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No tasks assigned yet.</p>
        )}
      </ul>
    </div>
  );
}
