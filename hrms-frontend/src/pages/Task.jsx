import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';


const Task = () => {
    const [tasks, setTasks] = useState([]);
    const [failedTasks, setFailedTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showAllTasks, setShowAllTasks] = useState(false);
    const parseDate = (dateString) => {
        const parts = dateString.split('/');
        // Return a new Date object in the correct format (YYYY-MM-DD)
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    };
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

    console.log("Updated date", updatedTask.due_date)
    // Fetch tasks from the backend
    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tasks');
            console.log("Fetched Tasks Raw Response:", response.data); // Log the raw response data

            // Check each task's due_date here


            const sortedTasks = response.data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
            setTasks(sortedTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
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


    const isValidDate = (date) => {
        const parsedDate = parseDate(date);
        return !isNaN(parsedDate.getTime()); // Return true if valid, false if invalid
    };

    const isTaskDueToday = (taskDueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set today's date to midnight for accurate comparison

        const taskDate = parseDate(taskDueDate); // Use the helper function here
        taskDate.setHours(0, 0, 0, 0); // Set task's due date to midnight

        if (!isValidDate(taskDueDate)) {
            console.error(`Invalid task due_date: ${taskDueDate}`);
            return false; // If the date is invalid, don't compare
        }

        return taskDate.getTime() === today.getTime(); // Compare dates if valid
    };

    const markOverdueTasksAsFailed = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set today's date to midnight

        console.log("Today's Date for comparison:", today);

        tasks.forEach(async (task) => {
            if (!isValidDate(task.due_date)) {
                console.error(`Invalid due_date for Task ID: ${task.id}, skipping task.`);
                return; // Skip invalid tasks
            }

            const taskDueDate = parseDate(task.due_date); // Use the helper function
            taskDueDate.setHours(0, 0, 0, 0); // Set task's due date to midnight

            console.log(`Task ID: ${task.id}, Task Due Date: ${taskDueDate}`);

            if (taskDueDate < today) {
                try {
                    console.log(`Marking Task ID ${task.id} as failed.`);
                    await axios.put(`http://localhost:5000/api/tasks/${task.id}/fail`);
                    fetchTasks(); // Refresh task list after marking as failed
                } catch (error) {
                    console.error("Error marking task as failed:", error);
                }
            }
        });
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
            due_date: task.due_date,
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
        <div className=' ml-[250px]'>
            <h1 className="text-3xl font-semibold text-center mb-5 mt-10">Task Management</h1>
            <div className="max-w-4xl mx-auto p-10 dark:bg-gray-800 rounded-lg bg-gray-100 ">

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
            </div>

            {/* Edit Task Form (if editing a task) */}
            {editingTask && (
                <div className="mt-8 max-w-4xl mx-auto p-5 dark:bg-gray-800 rounded-lg bg-gray-100">
                    <form onSubmit={handleUpdateTask} className="space-y-4 mt-8">
                        <h1 className="text-3xl font-semibold text-center">Edit Task</h1>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Task Name"
                                value={updatedTask.task_name}
                                onChange={(e) => setUpdatedTask({ ...updatedTask, task_name: e.target.value })}
                                className="p-2 border border-gray-300 rounded-lg w-full dark:text-white dark:bg-gray-900"
                            />
                            <input
                                type="text"
                                placeholder="Task Description"
                                value={updatedTask.task_description}
                                onChange={(e) => setUpdatedTask({ ...updatedTask, task_description: e.target.value })}
                                className="p-2 border border-gray-300 rounded-lg w-full dark:text-white dark:bg-gray-900"
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
                                className="p-2 border border-gray-300 rounded-lg w-full dark:text-white dark:bg-gray-900"
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
                                className="p-2 border border-gray-300 rounded-lg w-full dark:text-white dark:bg-gray-900"
                                min={new Date().toISOString().split('T')[0]} // Prevent past dates for editing
                            />

                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Employee ID"
                                value={updatedTask.employeeId}
                                onChange={(e) => setUpdatedTask({ ...updatedTask, employeeId: e.target.value })}
                                className="p-2 border border-gray-300 rounded-lg w-full dark:text-white dark:bg-gray-900"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            Update Task
                        </button>
                    </form>
                </div>
            )}

            <h2 className="text-2xl font-semibold dark:text-white mt-8 ml-[180px]">Pending Tasks</h2>
            <div className='max-w-4xl mx-auto dark:mt-5 mt-10 p-6 dark:p-0 bg-gray-100 dark:bg-gray-900 rounded-lg'>
                {/* Pending Tasks Section */}

                {tasks && tasks.length > 0 ?
                    (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-5">
                        {(showAllTasks ? tasks : tasks.slice(0, 3))
                            .filter(task => task.status !== 'completed') // Filter out completed tasks
                            .map((task) => (
                                <div key={task.id} className={`bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition mt-5 dark:bg-gray-900 ${isTaskDueToday(task.due_date) ? 'bg-yellow-50 border-l-4 border-red-500' : 'bg-green-100 border-l-4 border-green-500'}`}>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{task.task_name}</h3>
                                    <p className="text-gray-600 mt-2 dark:text-white">{task.task_description}</p>
                                    <p className="text-gray-500 mt-2 dark:text-white">Assigned to: {task.employee_name}</p>
                                    <p className="text-gray-500 mt-2 dark:text-white">Due Date: {task.due_date}</p>

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
                    </div>) : (<p className='text-center mt-5'> No Pending tasks available</p>)
                }
                {/* View More Button */}
                {tasks && tasks.length > 2 ? (
                    <div className="text-center mt-6">
                        <button
                            onClick={handleToggleView}
                            className="w-full bg-transparent text-blue-700 py-2 rounded-lg "
                        >
                            {showAllTasks ? "View Less" : "View More"}
                        </button>
                    </div>) : null}
            </div>
            <div>

                <div className="flex space-x-20 mt-14 max-w-4xl rounded-lg mx-auto p-2 dark:bg-gray-800 ">
                    {/* Failed Tasks Section */}
                    <div className="w-full  rounded-lg m-5">
                        <h2 className="text-2xl font-semibold text-red-500 text-center">Failed Tasks</h2>
                        {/* Failed Tasks Section */}
                        <ul className="space-y-4 mt-4 max-h-96 overflow-y-auto m-5">
                            {failedTasks && failedTasks.length > 0 ? (
                                failedTasks.map((task) => (
                                    <li key={task.id} className="bg-white p-4 shadow-md rounded-lg border-l-4 border-red-500 hover:shadow-lg transition dark:bg-gray-800 ">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{task.task_name}</h3>
                                                <p className="text-gray-600 dark:text-white">{task.task_description}</p>
                                                <p className="text-gray-500 dark:text-white">Assigned to: {task.employee_name}</p>
                                                <p className="text-gray-500 dark:text-white">Due Date:{task.due_date}</p>
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
                        {tasks && tasks.length > 0 ? (
                            <ul className="space-y-4 mt-4 max-h-96 overflow-y-auto m-5">
                                {/* Add completed tasks rendering logic here */}
                                {/* You can filter tasks by their `status` value */}
                                {tasks.filter(task => task.status === 'completed').map((task) => (
                                    <li key={task.id} className="bg-white p-4 shadow-md rounded-lg border-l-4 border-green-500 hover:shadow-lg transition dark:bg-gray-800">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{task.task_name}</h3>
                                                <p className="text-gray-600 dark:text-white">{task.task_description}</p>
                                                <p className="text-gray-500 dark:text-white">Assigned to: {task.employee_name}</p>
                                                <p className="text-gray-500 dark:text-white">Due Date: {task.due_date}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>) : (<p className='text-center mt-3'>No completed tasks available</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Task;