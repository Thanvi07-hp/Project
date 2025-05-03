import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HolidayPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    day: '',
    name: '',
  });

  const getDayOfWeek = (date) => {
    const daysOfWeek = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const selectedDate = new Date(date);
    return daysOfWeek[selectedDate.getDay()];
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const dayOfWeek = getDayOfWeek(selectedDate);
    setNewHoliday({ ...newHoliday, date: selectedDate, day: dayOfWeek });
  };

  const handleAddHoliday = async () => {
    if (newHoliday.date && newHoliday.day && newHoliday.name) {
      try {
        const response = await axios.post('http://localhost:5000/api/holidays', {
          name: newHoliday.name,
          date: newHoliday.date,
          day: newHoliday.day,
        });

        setHolidays([...holidays, response.data]); // Add the new holiday to the state
        setNewHoliday({ date: '', day: '', name: '' });
        setIsAddingHoliday(false);
      } catch (error) {
        console.error('Error adding holiday:', error);
      }
    }
  };

  const handleDeleteAllHolidays = async () => {
    try {
      const response = await axios.delete('http://localhost:5000/api/holidays');
      setHolidays([]); 
    } catch (error) {
      console.error('Error deleting all holidays:', error.response?.data || error.message);
    }
  };
  

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/holidays');
        setHolidays(response.data);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      }
    };

    fetchHolidays();
  }, []);

  const filteredHolidays = holidays.map(holiday => {
    const holidayDate = new Date(holiday.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return {
      ...holiday,
      status: holidayDate >= today ? 'Upcoming' : 'Past'
    };
  });


  return (
    <div className="p-6  ml-[250px]">
      <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold mb-4">Holidays</h2>
        <button
          onClick={() => setIsAddingHoliday(!isAddingHoliday)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isAddingHoliday ? 'Cancel' : '+ Add New Holiday'}
        </button>
      </div>

      {/* Add New Holiday Form */}
      {isAddingHoliday && (
        <div className="mb-4 bg-gray-100 p-4 rounded">
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder="Holiday Name"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              className="border px-4 py-2 rounded"
            />
            <input
              type="date"
              value={newHoliday.date}
              onChange={handleDateChange} 
              className="border px-4 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Day (e.g., Monday)"
              value={newHoliday.day}
              disabled
              className="border px-4 py-2 rounded"
            />
            <button
              onClick={handleAddHoliday}
              className="bg-green-600 text-white px-4 py-2 rounded mt-2"
            >
              Add Holiday
            </button>
          </div>
        </div>
      )}

      {/* Holidays Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="dark:bg-gray-900 dark:text-white">
            <tr>
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Day</th>
              <th className="p-2 border text-left">Holiday Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredHolidays.map((holiday, index) => {
              const holidayDate = new Date(holiday.date);
              const today = new Date();
              
              today.setHours(0, 0, 0, 0);
              holidayDate.setHours(0, 0, 0, 0);

              const status = holidayDate >= today ? 'Upcoming' : 'Past';

              return (
                <tr key={index} className="border-b relative">
                  <td className="p-2 border relative">
                  {status === 'Upcoming' && <div className="absolute left-0 top-0 h-full w-[3px] bg-blue-500"></div>}
                  {status === 'Past' && <div className="absolute left-0 top-0 h-full w-[3px] bg-orange-400"></div>}
                  {holiday.date.split('T')[0]} 
                  </td>
                  <td className="p-2 border">{holiday.day}</td>
                  <td className="p-2 border">{holiday.name}</td>
                  {/* <td className="p-2 border">{status}</td> Dynamically set status */}
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      <div className="mt-4 flex items-center space-x-4">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
        <p className="text-sm">Upcoming Holidays</p>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
        <p className="text-sm">Past Holidays</p>
      </div>
    </div>
    <button 
      onClick={handleDeleteAllHolidays} 
      className="bg-red-600 text-white px-4 py-2 rounded mt-4"
    >
      Delete All Holidays
    </button>

    </div>
  );
};

export default HolidayPage;