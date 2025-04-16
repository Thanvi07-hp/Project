import React, { useEffect, useState } from 'react';
import EmployeeSidebar from './EmployeeSidebar';
import { useNavigate } from "react-router-dom";

const EmployeeTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle any errors
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();


  // Get the employeeId from local storage
  const employeeId = localStorage.getItem('employeeId'); 

  useEffect(() => {
    if (!employeeId) {
      setError('No logged-in employee found');
      setLoading(false);
      return;
    }
    
    // Fetch tasks for the logged-in employee
    const fetchEmployeeAndTasks = async () => {
      try {
        const empRes = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
        if (!empRes.ok) throw new Error('Failed to fetch employee');
        const empData = await empRes.json();
        setEmployee(empData);

        
        
        if (data && data.length === 0) {
          setTasks([]); 
          setNoTasksMessage("No tasks found for this employee."); 
        } else {
          setTasks(data); 
          setNoTasksMessage(""); 
        }
    
      } catch (err) {
         
      } finally {
        setLoading(false);
      }
    };
  
    fetchEmployeeAndTasks();
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

  // Separate tasks by status
  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  // Render the tasks or a loading/error message
  return (
    <div className="flex bg-gray-100 dark:bg-gray-900">
    <EmployeeSidebar employee={employee} />

      <div className="mx-auto p-6 w-full">
        <h2 className="text-4xl font-bold text-center mb-6">Employee Tasks</h2>

        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <>
            {/* Pending Tasks Section */}
            <div className="mb-6">
              {pendingTasks.length === 0 ? (
                <div className='bg-white shadow rounded p-6 dark:bg-gray-900'>
                  <h3 className="text-2xl font-semibold mb-4">Pending Tasks</h3>

                <p className='text-center'>No pending tasks available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto max-h-96">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white p-6 shadow-lg rounded-lg transition mt-4 ${
                        new Date(task.due_date) < new Date()
                          ? 'bg-red-50 border-l-4 border-red-500'
                          : 'bg-green-100 border-l-4 border-green-500'
                      }`}
                    >
                      <h3 className="text-xl font-semibold text-gray-900">{task.task_name}</h3>
                      <p className="text-gray-600 mt-2">{task.task_description}</p>
                      <p className="text-gray-500 mt-2">
                        Assigned to: {task.firstName} {task.lastName}
                      </p>
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks Section */}
            <div>
              {completedTasks.length === 0 ? (
                <div className='bg-white shadow rounded p-6 dark:bg-gray-900'>
                  
                <h3 className="text-2xl font-semibold mb-4 ">Completed Tasks</h3>
                <p className='text-center'>No completed tasks available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto max-h-96">
                  {completedTasks.map((task) => (
                    <div
                    key={task.id}
                    className="bg-gray-200 p-6 shadow-lg rounded-lg transition mt-4"
                    >
                      <h3 className="text-xl font-semibold text-gray-900">{task.task_name}</h3>
                      <p className="text-gray-600 mt-2">{task.task_description}</p>
                      <p className="text-gray-500 mt-2">
                        Assigned to: {task.firstName} {task.lastName}
                      </p>
                      <p className="text-gray-500 mt-2">Due Date: {task.due_date}</p>
                      <p className="text-gray-500 mt-2">Status: {task.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeTask;
