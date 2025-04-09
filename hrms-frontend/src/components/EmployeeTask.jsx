import React, { useEffect, useState } from 'react';
import EmployeeSidebar from './EmployeeSidebar';


const EmployeeTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle any errors

  // Get the employeeId from local storage
  const employeeId = localStorage.getItem('employeeId'); 

  useEffect(() => {
    if (!employeeId) {
      setError('No logged-in employee found');
      setLoading(false);
      return;
    }
    
    // Fetch tasks for the logged-in employee
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/tasks/employee/${employeeId}`); // Fetch tasks for the logged-in employee

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data); // Store the tasks in state
      } catch (err) {
        setError(err.message); // Handle any errors that occur
      } finally {
        setLoading(false); // Set loading to false once the request is complete
      }
    };

    fetchTasks(); // Call fetchTasks when employeeId is available
  }, [employeeId]);

  const handleMarkAsCompleted = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark task as completed');
      }

      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: 'completed' } : task
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };


  // Render the tasks or a loading/error message
  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployeeSidebar  />
    <div className="mx-auto p-6">
      <h2 className="text-4xl font-bold text-center mb-6">Employee Tasks</h2>

      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : tasks.length === 0 ? (
        <p>No tasks available for this employee.</p>
      ) : (
        <ul className="space-y-4 ">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`bg-white p-6 shadow-lg rounded-lg transition mt-4 ${new Date(task.due_date) < new Date() ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-100 border-l-4 border-green-500'}`}
            >
              <h3 className="text-xl font-semibold text-gray-900">{task.task_name}</h3>
              <p className="text-gray-600 mt-2">{task.task_description}</p>
              <p className="text-gray-500 mt-2">Assigned to: {task.firstName} {task.lastName}</p>
              <p className="text-gray-500 mt-2">Due Date: {task.due_date}</p>
              <p className="text-gray-500 mt-2">Status: {task.status}</p>
              {task.status !== 'completed' && (
                <button
                  onClick={() => handleMarkAsCompleted(task.id)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600 transition"
                >
                  Mark as Completed
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
};

export default EmployeeTask;
