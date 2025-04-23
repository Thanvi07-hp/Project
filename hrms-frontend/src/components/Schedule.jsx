import { useState, useEffect } from "react";

export default function Schedule({ darkMode }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayedMonth, setDisplayedMonth] = useState(currentDate.getMonth());
  const [displayedYear, setDisplayedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAddTask = () => {
    if (!selectedDate || newTask.trim() === "") return;
    setTasks((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newTask],
    }));
    setNewTask("");
  };

  const prevMonth = () => {
    setDisplayedMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (displayedMonth === 0) {
      setDisplayedYear((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    setDisplayedMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (displayedMonth === 11) {
      setDisplayedYear((prev) => prev + 1);
    }
  };

  const firstDay = new Date(displayedYear, displayedMonth, 1).getDay();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();

  return (
    <div
      className={`p-9 rounded-lg shadow-md transition-all duration-300 dark:bg-gray-900 dark:text-white`}
    >
      {/* Header */}
      <h3 className="text-lg font-bold mb-2">My Schedule</h3>
      <p className="text-sm">
        {currentDate.toLocaleDateString()} - {currentDate.toLocaleTimeString()}
      </p>

      {/* Calendar */}
      <div
        className={`p-4 rounded-lg mt-3 transition-all duration-300 ${
          darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}
      >
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={prevMonth}
            className={`px-2 py-1 rounded transition-all duration-300 ${
              darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
          >
            ←
          </button>
          <span className="font-semibold">
            {new Date(displayedYear, displayedMonth).toLocaleString('default', { month: 'long' })} {displayedYear}
          </span>
          <button
            onClick={nextMonth}
            className={`px-2 py-1 rounded transition-all duration-300 ${
              darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-sm font-bold">{day}</div>
          ))}

          {/* Empty spaces before the first day of the month */}
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="text-gray-400 p-2"></div>
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const date = i + 1;
            const isToday =
              date === currentDate.getDate() &&
              displayedMonth === currentDate.getMonth() &&
              displayedYear === currentDate.getFullYear();

            return (
              <div
                key={i}
                onClick={() => handleDateClick(date)}
                className={`cursor-pointer p-2 rounded-full transition-all ${
                  selectedDate === date
                    ? "bg-blue-500 text-white"
                    : isToday
                    ? darkMode
                      ? "bg-gray-500 text-white" // Current date in dark mode
                      : "bg-black text-white" // Current date in light mode
                    : darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-black"
                }`}
              >
                {date}
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Schedule */}
      {selectedDate && (
        <div
          className={`mt-4 p-4 rounded-lg transition-all duration-300 ${
            darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
          }`}
        >
          <h4 className="text-md font-bold">
            Tasks for {selectedDate} {new Date(displayedYear, displayedMonth).toLocaleString('default', { month: 'long' })}
          </h4>
          <ul className="mt-2">
            {tasks[selectedDate]?.map((task, index) => (
              <li key={index} className="text-sm p-1">
                {task}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className={`p-1 flex-1 rounded transition-all duration-300 ${
                darkMode
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "bg-white text-black border border-gray-300"
              }`}
              placeholder="Add new task"
            />
            <button
              onClick={handleAddTask}
              className={`ml-2 px-3 py-1 rounded transition-all duration-300 ${
                darkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
