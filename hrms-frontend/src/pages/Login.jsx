import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isAdmin
      ? "http://localhost:5000/api/login"
      : "http://localhost:5000/api/employees/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: isAdmin ? "admin" : "employee" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      // 🔹 Store token, role, and employeeId
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role || (isAdmin ? "admin" : "employee"));

      // Clear old employeeId first
      localStorage.removeItem("employeeId");

      if (data.employee && data.employee.employeeId) {
        localStorage.setItem("employeeId", data.employee.employeeId);
      }
      console.log("Logged in user:", data.employee);

      navigate(isAdmin ? "/admin-dashboard" : "/employee-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 ">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6 ">
          <button
            className={`w-1/2 py-2 font-semibold rounded-l-lg transition ${!isAdmin ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setIsAdmin(false)}
          >
            Employee Login
          </button>
          <button
            className={`w-1/2 py-2 font-semibold rounded-r-lg transition ${isAdmin ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setIsAdmin(true)}
          >
            Admin Login
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          {isAdmin ? "Admin Login" : "Employee Login"}
        </h2>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <form onSubmit={handleLogin} className="mt-4 dark:text-black">
          <div>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 dark:text-gray-300"
              >
                {showPassword ? (
                  <i className="fas fa-eye-slash"></i> // Eye Slash icon
                ) : (
                  <i className="fas fa-eye"></i> // Eye icon
                )}
              </button>
            </div>
          </div>

          <div className="text-right mt-2">
            <a href="/forgot-password" className="text-purple-600 text-sm hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
