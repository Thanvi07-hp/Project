import { useState } from "react";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("OTP Verified, Password Updated!");
    alert("Password reset successfully!");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Verify OTP</h2>

        <form onSubmit={handleVerifyOTP}>
          {/* OTP Input */}
          <div>
            <label className="text-gray-600 text-sm">Enter OTP</label>
            <input
              type="text"
              placeholder="123456"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          {/* New Password Input */}
          <div className="mt-4">
            <label className="text-gray-600 text-sm">New Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mt-4">
            <label className="text-gray-600 text-sm">Confirm Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
