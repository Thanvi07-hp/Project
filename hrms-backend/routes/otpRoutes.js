const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../db"); 
const router = express.Router();

// Store OTPs temporarily in-memory
const otpStore = new Map(); // Key: email, Value: { otp, expiresAt }

// Replace with your actual email and app password (not regular password)
const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: "hrms.otp.sender@gmail.com",
      pass: "hrms1234", // generate this from Gmail security settings
    },
  });
  
  async function sendOTPEmail(to, otp) {
    const mailOptions = {
      from: '"HRMS System" <your-email@gmail.com>',
      to,
      subject: "Your OTP for Password Reset",
      html: `<p>Your OTP is: <b>${otp}</b></p><p>It expires in 5 minutes.</p>`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ OTP email sent to", to);
    } catch (error) {
      console.error("❌ Error sending OTP email:", error);
    }
  }

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


router.post("/api/reset-password", async (req, res) => {
    const { email, newPassword, userType } = req.body;
    const record = otpStore.get(email);
  
    if (!record || !record.verified) {
      return res.status(401).json({ message: "OTP verification required" });
    }
  
    const table = userType === "admin" ? "users" : "employees";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    try {
      await db.execute(`UPDATE ${table} SET password = ? WHERE email = ?`, [hashedPassword, email]);
      otpStore.delete(email); // OTP is one-time use
      return res.json({ message: "Password reset successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  

router.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  otpStore.set(email, { ...record, verified: true });
  return res.json({ message: "OTP verified" });
});

router.post("/api/request-otp", async (req, res) => {
    const { email, userType } = req.body;
    const table = userType === "admin" ? "users" : "employees";
  
    try {
      const [results] = await db.execute(`SELECT * FROM ${table} WHERE email = ?`, [email]);
  
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const otp = generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  
      otpStore.set(email, { otp, expiresAt });
  
      // ✅ Send the OTP via email
      await sendOTPEmail(email, otp);
  
      return res.json({ message: "OTP sent" });
    } catch (err) {
      console.error("Error in /api/request-otp:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  

module.exports = router;
