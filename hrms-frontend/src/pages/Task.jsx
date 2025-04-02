import React, { useState, useEffect } from "react";
import axios from "axios";

const Task = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", employee: "" });
    const [showAllTasks, setShowAllTasks] = useState(false);  // State to toggle the "View All" functionality

    useEffect(() => {
        fetchTasks();
        fetchEmployees();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/tasks");
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/employees");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask((prev) => ({ ...prev, [name]: value }));
    };

    const assignTask = async () => {
        if (!newTask.title || !newTask.dueDate || !newTask.employee) {
            console.error("Missing required fields");
            return;
        }

        const assignedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
        const formattedDueDate = newTask.dueDate.split("T")[0];

        const assignedTask = {
            ...newTask,
            dueDate: formattedDueDate,
            assignedAt,
            status: "Pending",
        };

        try {
            const response = await axios.post("http://localhost:5000/api/tasks", assignedTask);
            setTasks([...tasks, response.data]);
            setNewTask({ title: "", description: "", dueDate: "", employee: "" });
        } catch (error) {
            console.error("Error adding task:", error.response ? error.response.data : error.message);
        }
    };

    const markAsCompleted = async (taskId) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: "Completed" });
            setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "Completed" } : task)));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            console.log(`Deleting task with ID: ${taskId}`);  // Debugging log to check taskId
            const response = await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
            console.log("Delete successful:", response.data);  // Log success
            setTasks(tasks.filter((task) => task.id !== taskId)); // Remove task from UI
        } catch (error) {
            console.error("Error deleting task:", error); // Log error details
        }
    };
    

    const handleEditChange = (e, taskId) => {
        const { name, value } = e.target;
        setTasks(tasks.map((task) =>
            task.id === taskId ? { ...task, [name]: value } : task
        ));
    };

    const saveEdit = async (taskId) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId);
        const formattedDueDate = taskToUpdate.dueDate.split("T")[0];
    
        try {
            const updatedTask = {
                ...taskToUpdate,
                dueDate: formattedDueDate, // Ensure the due date is in the correct format (YYYY-MM-DD)
            };
    
            const response = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, updatedTask);
    
            setTasks(tasks.map((task) =>
                task.id === taskId ? { ...task, ...response.data } : task
            ));
    
            setTasks(tasks.map((task) =>
                task.id === taskId ? { ...task, isEditing: false } : task
            ));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };


    // Function to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        // Reset time to 00:00 to ensure only date is compared
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split("T")[0]; // Format to YYYY-MM-DD (ignores time part)
    };

    // Function to compare task dueDate with today's date (ignores time part)
    const isDueToday = (dueDate) => {
        const todayDate = getTodayDate(); // Get today's date in YYYY-MM-DD
        const taskDueDate = new Date(dueDate);
        
        // Reset the time of both dates to 00:00 to ignore time comparison
        taskDueDate.setHours(0, 0, 0, 0);

        return taskDueDate.toISOString().split("T")[0] === todayDate;
        
    };


    // Function to sort tasks based on dueDate
    const sortedTasks = tasks.sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA - dateB; // Sort in ascending order
    });

    // Display only a limited number of tasks (3 by default) when not showing all tasks
    const tasksToShow = showAllTasks ? sortedTasks : sortedTasks.slice(0, 3);

    return (
        <div className="p-4 w-full max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Assign Task</h2>
            <div className="mb-4">
                <input type="text" name="title" placeholder="Task Title" value={newTask.title} onChange={handleInputChange} className="border p-2 w-full mb-2" />
                <input type="text" name="description" placeholder="Task Description" value={newTask.description} onChange={handleInputChange} className="border p-2 w-full mb-2" />
                <input type="date" name="dueDate" value={newTask.dueDate} onChange={handleInputChange} className="border p-2 w-full mb-2" />
                <select name="employee" value={newTask.employee} onChange={handleInputChange} className="border p-2 w-full mb-2">
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp.id || emp.firstName} value={emp.firstName}>{emp.firstName}</option>
                    ))}
                </select>
                <button onClick={assignTask} className="bg-blue-500 text-white p-2 w-full">Assign Task</button>
            </div>

            <h3 className="text-lg font-bold mb-2">Pending Tasks</h3>
            <div className="max-h-[350px] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                {tasksToShow.filter(task => task.status === "Pending").map((task) => (
                    <div 
                        key={task.id} 
                        className={`border p-3 mb-2 ${isDueToday(task.dueDate) ? "bg-red-200" : ""}`}
                    >
                    
                        {task.isEditing ? (
                            <>
                                <input
                                    type="text"
                                    name="title"
                                    value={task.title}
                                    onChange={(e) => handleEditChange(e, task.id)}
                                    className="border p-2 w-full mb-2"
                                />
                                <input
                                    type="text"
                                    name="description"
                                    value={task.description}
                                    onChange={(e) => handleEditChange(e, task.id)}
                                    className="border p-2 w-full mb-2"
                                />
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={task.dueDate}
                                    onChange={(e) => handleEditChange(e, task.id)}
                                    className="border p-2 w-full mb-2"
                                />
                                <select
                                    name="employee"
                                    value={task.employee}
                                    onChange={(e) => handleEditChange(e, task.id)}
                                    className="border p-2 w-full mb-2"
                                >
                                    {employees.map(emp => (
                                        <option key={emp.id || emp.firstName} value={emp.firstName}>{emp.firstName}</option>
                                    ))}
                                </select>
                                <button onClick={() => saveEdit(task.id)} className="bg-blue-500 text-white p-2 mt-2">Save Changes</button>
                            </>
                        ) : (
                            <>
                                <h4 className="font-bold">{task.title}</h4>
                                <p>{task.description}</p>
                                <p>Assigned To: {task.employee}</p>
                                <p>Assigned At: {new Date(task.assignedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"})}</p>
                                <p>Due Date: {new Date(task.dueDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}</p>
                                <div className="flex space-x-2 mt-4">
                                    <button onClick={() => markAsCompleted(task.id)} className="bg-green-500 text-white p-1 rounded-md hover:bg-green-600">Mark as Completed</button>
                                    <button onClick={() => setTasks(tasks.map((t) => t.id === task.id ? { ...t, isEditing: true } : t))} className="bg-yellow-500 text-white p-3 rounded-md hover:bg-yellow-600">Edit</button>
                                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white p-3 rounded-md hover:bg-red-600">Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            </div>

            <button 
                onClick={() => setShowAllTasks(!showAllTasks)} 
                className="mt-4 bg-blue-500 text-white p-2 w-full"
            >
                {showAllTasks ? "Show Less" : "View All"}
            </button>

            <h3 className="text-lg font-bold mt-4 mb-5 ">Completed Tasks</h3>
            <div className="max-h-[350px] overflow-y-auto">
            {sortedTasks.filter(task => task.status === "Completed").map((task) => (
                <div key={task.id} className="border p-3 mb-2 bg-gray-200 rounded-lg">
                    <h4 className="font-bold">{task.title}</h4>
                    <p>{task.description}</p>
                    <p>Assigned To: {task.employee}</p>
                    <p>Assigned At: {new Date(task.assignedAt).toLocaleString()}</p>
                    <p>Due Date: {new Date(task.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    })}</p>

                    <p className="text-green-600 font-bold">Completed</p>
                </div>
            ))}
            </div>
        </div>
    );
};

export default Task;
