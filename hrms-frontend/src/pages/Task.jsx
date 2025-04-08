import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const Task = () => {
    const [tasks, setTasks] = useState([]);
    const [failedTasks, setFailedTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showAllTasks, setShowAllTasks] = useState(false);
    const [newTask, setNewTask] = useState({
        task_name: '',
        task_description: '',
        employee_name: '',
        due_date: '',
        employeeId: ''
    });

    const [editingTask, setEditingTask] = useState(null); // Added state to track which task is being edited
    const [updatedTask, setUpdatedTask] = useState({
        task_name: '',
        task_description: '',
        employee_name: '',
        due_date: '',
        employeeId: ''
    });

    console.log("Updated date",updatedTask.due_date)
    // Fetch tasks from the backend
    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tasks');
            const sortedTasks = response.data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

            setTasks(sortedTasks);
        } catch (error) {
            console.error("There was an error fetching tasks:", error);
        }
    };
    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/employees');
            console.log('Fetched Employees:', response.data);
            setEmployees(response.data); // Make sure employee data includes id and firstName
        } catch (error) {
            console.error("There was an error fetching employees:", error);
        }
    };
    const markOverdueTasksAsFailed = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set today's date to midnight to avoid time comparison issues
    
        tasks.forEach(async (task) => {
            const taskDueDate = new Date(task.due_date);
            taskDueDate.setHours(0, 0, 0, 0); // Set the task's due date to midnight for accurate comparison
    
            if (taskDueDate < today) {
                try {
                    await axios.put(`http://localhost:5000/api/tasks/${task.id}/fail`);
                    fetchTasks(); // Refresh task list after marking as failed
                } catch (error) {
                    console.error("There was an error marking the task as failed:", error);
                }
            }
        });
    };
    const isTaskDueToday = (taskDueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set today's date to midnight for accurate comparison
        const taskDate = new Date(taskDueDate);
        taskDate.setHours(0, 0, 0, 0); // Set task's due date to midnight
        return taskDate.getTime() === today.getTime(); // Check if the due date matches today's date
    };
    
    useEffect(() => {
        fetchTasks();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (tasks.length > 0) {
            markOverdueTasksAsFailed();
        }
    }, [tasks]);
    

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const formattedDueDate = new Date(newTask.due_date).toISOString().slice(0, 19).replace('T', ' ');

            const taskWithFormattedDate = {
                ...newTask,
                due_date: formattedDueDate
            };

            await axios.post('http://localhost:5000/api/tasks', taskWithFormattedDate);
            fetchTasks();

            setNewTask({
                task_name: '',
                task_description: '',
                employee_name: '',
                due_date: '',
                employeeId: ''
            });
        } catch (error) {
            console.error("There was an error adding the task:", error);
        }
    };




    // Fetch failed tasks from the backend
    const fetchFailedTasks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/failed-tasks');
            setFailedTasks(response.data);
        } catch (error) {
            console.error("There was an error fetching failed tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchFailedTasks();
    }, []);



    // Handle edit task
    const handleEditTask = (task) => {
        setEditingTask(task.id); // Set the task being edited
        setUpdatedTask({
            task_name: task.task_name,
            task_description: task.task_description,
            employee_name: task.employee_name,
            due_date: format(new Date(task.due_date), 'yyyy-MM-dd'),
            employeeId: task.employee_id
        });

    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/tasks/${editingTask}`, updatedTask);
            fetchTasks(); // Refresh task list after update
            setEditingTask(null); // Clear the editing state
        } catch (error) {
            console.error("There was an error updating the task:", error);
        }
    };
    const handleToggleView = () => {
        setShowAllTasks(prev => !prev); // Toggle show all tasks
    };

    // Handle delete task
    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
            fetchTasks(); // Refresh task list after deletion
        } catch (error) {
            console.error("There was an error deleting the task:", error);
        }
    };

    // Handle fail task
    const handleFailTask = async (taskId) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${taskId}/fail`);
            fetchTasks(); // Refresh task list after marking as failed
            fetchFailedTasks(); // Refresh the failed tasks list
        } catch (error) {
            console.error("There was an error marking the task as failed:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-center mb-6">Task Management</h1>

            {/* Task Form */}
            <form onSubmit={handleAddTask} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Task Name"
                        value={newTask.task_name}
                        onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg w-full dark:bg-gray-900 dark:text-white"
                    />
                    <input
                        type="text"
                        placeholder="Task Description"
                        value={newTask.task_description}
                        onChange={(e) => setNewTask({ ...newTask, task_description: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg w-full dark:bg-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        value={newTask.employee_name}
                        onChange={(e) => {
                            const selectedEmployee = employees.find(emp => emp.firstName === e.target.value);
                            setNewTask({
                                ...newTask,
                                employee_name: e.target.value,
                                employeeId: selectedEmployee ? selectedEmployee.employeeId : ''
                            });
                        }}
                        className="p-2 border border-gray-300 rounded-lg w-full dark:bg-gray-900 dark:text-white"
                    >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.firstName}>
                                {employee.firstName}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Employee ID"
                        value={newTask.employeeId}
                        readOnly // Ensure that the employee ID field is read-only
                        className="p-2 border border-gray-300 rounded-lg w-full dark:bg-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg w-full dark:bg-gray-900 dark:text-white"
                        min={new Date().toISOString().split('T')[0]} // This will prevent selecting past dates
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    Add Task
                </button>
            </form>

            {/* Edit Task Form (if editing a task) */}
            {editingTask && (
                <form onSubmit={handleUpdateTask} className="space-y-4 mt-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Task Name"
                            value={updatedTask.task_name}
                            onChange={(e) => setUpdatedTask({ ...updatedTask, task_name: e.target.value })}
                            className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                        <input
                            type="text"
                            placeholder="Task Description"
                            value={updatedTask.task_description}
                            onChange={(e) => setUpdatedTask({ ...updatedTask, task_description: e.target.value })}
                            className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                         <select
                        value={updatedTask.employee_name}
                        onChange={(e) => {
                            const selectedEmployee = employees.find(emp => emp.firstName === e.target.value);
                            setUpdatedTask({
                                ...updatedTask,
                                employee_name: e.target.value,
                                employeeId: selectedEmployee ? selectedEmployee.employeeId : ''
                            });
                        }}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                    >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.firstName}>
                                {employee.firstName}
                            </option>
                        ))}
                    </select>
                        <input
                            type="date"
                            value={updatedTask.due_date}
                            onChange={(e) => setUpdatedTask({ ...updatedTask, due_date: e.target.value })}
                            className="p-2 border border-gray-300 rounded-lg w-full"
                            min={new Date().toISOString().split('T')[0]} // Prevent past dates for editing
                        />

                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Employee ID"
                            value={updatedTask.employeeId}
                            onChange={(e) => setUpdatedTask({ ...updatedTask, employeeId: e.target.value })}
                            className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    >
                        Update Task
                    </button>
                </form>
            )}

            {/* Pending Tasks Section */}
            <h2 className="text-2xl font-semibold dark:text-white mt-8">Pending Tasks</h2>


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-5">
                {(showAllTasks ? tasks : tasks.slice(0, 2)).map((task) => (
                    <div key={task.id} className={`bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition mt-10 ${isTaskDueToday(task.due_date) ? 'bg-yellow-50 border-l-4 border-red-500' : 'bg-green-100 border-l-4 border-green-500'}`}>
                        <h3 className="text-xl font-semibold text-gray-900">{task.task_name}</h3>
                        <p className="text-gray-600 mt-2">{task.task_description}</p>
                        <p className="text-gray-500 mt-2">Assigned to: {task.employee_name}</p>
                        <p className="text-gray-500 mt-2">Due Date: {format(new Date(task.due_date), 'MMMM dd, yyyy')}</p>

                        {/* Task Action Buttons */}
                        <div className="flex gap-2 mt-4">
                            <button
                                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                                onClick={() => handleEditTask(task)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                                onClick={() => handleDeleteTask(task.id)}
                            >
                                Delete
                            </button>
                            <button
                                className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                                onClick={() => handleFailTask(task.id)}
                            >
                                Mark as Failed
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* View More Button */}
            <div className="text-center mt-6">
                <button
                    onClick={handleToggleView}
                    className="w-full bg-transparent text-blue-700 py-2 rounded-lg "
                >
                    {showAllTasks ? "View Less" : "View More"}
                </button>
            </div>








            <div className="flex space-x-20 mt-8 dark:bg-gray-800 dark:text-white bg-gray-100 rounded-lg">
                {/* Failed Tasks Section */}
                <div className="w-full  rounded-lg m-5">
                    {/* Failed Tasks Section */}
                    <h2 className="text-2xl font-semibold text-red-500 mt-4 text-center">Failed Tasks</h2>
                    <ul className="space-y-4 mt-4 max-h-96 overflow-y-auto m-5">
                        {failedTasks && failedTasks.length > 0 ? (
                            failedTasks.map((task) => (
                                <li key={task.id} className="bg-white p-4 shadow-md rounded-lg border-l-4 border-red-500 hover:shadow-lg transition">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{task.task_name}</h3>
                                            <p className="text-gray-600">{task.task_description}</p>
                                            <p className="text-gray-500">Assigned to: {task.employee_name}</p>
                                            <p className="text-gray-500">Due Date: {format(new Date(task.due_date), 'MMMM dd, yyyy')}</p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className='text-center'>No failed tasks available</p>
                        )}
                    </ul>
                </div>
                <div className="w-full rounded-lg">
                    <h2 className="text-2xl font-semibold text-green-500 mt-8 text-center">Completed Tasks</h2>
                    <ul className="space-y-4 mt-4 max-h-96 overflow-y-auto m-5">
                        {/* Add completed tasks rendering logic here */}
                        {/* You can filter tasks by their `status` value */}
                        {tasks.filter(task => task.status === 'completed').map((task) => (
                            <li key={task.id} className="bg-white p-4 shadow-md rounded-lg border-l-4 border-green-500 hover:shadow-lg transition">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{task.task_name}</h3>
                                        <p className="text-gray-600">{task.task_description}</p>
                                        <p className="text-gray-500">Assigned to: {task.employee_name}</p>
                                        <p className="text-gray-500">Due Date: {format(new Date(task.due_date), 'MMMM dd, yyyy')}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Task;