import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("employee"); // Default to employee

  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log(`Forgot Password Request for ${userType}:`, email);
    alert(`OTP sent to ${email}`);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>

        <form onSubmit={handleForgotPassword}>
          {/* User Type Selection */}
          <div>
            <label className="text-gray-600 text-sm">Select Role</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Email Input */}
          <div className="mt-4">
            <label className="text-gray-600 text-sm">Enter Your Email</label>
            <input
              type="email"
              placeholder="your-email@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}
