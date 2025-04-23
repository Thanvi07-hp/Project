import { useState, useEffect } from 'react';

export default function AddAdmin() {
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const fetchAdmins = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data); // Store the admins in state
      } else {
        console.error('Failed to fetch admins');
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  useEffect(() => {
    fetchAdmins(); // Fetch the admins when the component mounts
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/admins/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedPassword(data.generatedPassword);
        fetchAdmins(); // Refresh the list of admins after adding a new one
      } else {
        alert('Failed to create admin');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
    }
  };

  const handleDeleteAdmin = async (email) => {
    setDeleteMessage(''); 
    setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.email !== email));
  
    try {
      const res = await fetch(`http://localhost:5000/api/admins/delete/${email}`, {
        method: 'DELETE',
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // Use window.confirm for prompt-like behavior
        const result = window.confirm(`${data.message || 'Admin deleted successfully!'}`);
        if (result) {
          fetchAdmins(); // Refresh the list of admins if confirmed
        }
      } else {
        window.alert(data.message || 'Failed to delete admin');
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
      window.alert('Error deleting admin. Please try again later.');
      fetchAdmins(); 
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add New Admin</h2>
      <form onSubmit={handleAddAdmin} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button type="submit" className="bg-purple-600 text-white py-2 px-3 text-sm rounded hover:bg-purple-700">
        Create Admin
        </button>

      </form>

      {generatedPassword && (
        <div className="mt-4 bg-green-100 p-4 rounded-md text-green-800">
          <p>Admin added successfully!</p>
          <p>Password: <strong>{generatedPassword}</strong></p>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700">Admins List</h3>
        <div className="overflow-x-auto mt-4 bg-gray-50 shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.email} className="border-b">
                  <td className="px-6 py-3">{admin.name}</td>
                  <td className="px-6 py-3">{admin.email}</td>
                  <td className="px-6 py-3">
                  <button
                    onClick={() => handleDeleteAdmin(admin.email)}
                    className="bg-red-600 text-white text-xs py-1 px-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
       
        </div>
      </div>
    </div>
  );
}
