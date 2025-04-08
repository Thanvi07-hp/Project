import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
  
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
  
    const [firstName, lastName] = fullName.split(" ");
  
    try {
      const response = await fetch("http://localhost:5000/api/employees/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
  
      alert("Password set successfully! Please log in.");
      navigate("/login"); 
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        <form onSubmit={handleRegister} className="mt-4">
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-600 text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-600 text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-600 text-sm font-semibold mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/" className="text-purple-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
