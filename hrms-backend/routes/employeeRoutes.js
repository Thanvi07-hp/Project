const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const db = require("../db"); 

const router = express.Router();
const app = express();

// Employee Registration
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, employeeId, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [existing] = await db.execute("SELECT * FROM employees WHERE email = ?", [email]);

    if (existing.length > 0) {
      const user = existing[0];
    
      const hasPassword =
        user.password !== null &&
        user.password !== undefined &&
        user.password.trim() !== "";
    
      if (hasPassword) {
        return res.status(400).json({ message: "Email already registered" });
      }
    
      // Password is missing, so update the record
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute(
        "UPDATE employees SET firstName = ?, lastName = ?, password = ? WHERE email = ?",
        [firstName, lastName, hashedPassword, email]
      );
    
      return res.status(200).json({ message: "Employee registration completed" });
    }
    

    // Brand new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO employees (firstName, lastName, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword]
    );

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (error) {
    console.error("Registration error:", error); 
    res.status(500).json({ message: "Error registering employee", error: error.message });
  }
});


// Employee Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [employee] = await db.execute(
      `SELECT employeeId, firstName, lastName, email, password, profilePic, 
              mobile, dob, maritalStatus, gender, department, designation, 
              type, status, role, attendance 
       FROM employees WHERE email = ?`, 
      [email]
    );

    if (employee.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = employee[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    // Generate JWT token
    const token = jwt.sign(
      { id: user.employeeId, email: user.email },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({ 
      message: "Login successful", 
      token, 
      employee: {
        employeeId: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
        mobile: user.mobile,
        dob: user.dob,
        maritalStatus: user.maritalStatus,
        gender: user.gender,
        department: user.department,
        designation: user.designation,
        type: user.type,
        status: user.status,
        role: user.role,
        attendance: JSON.parse(user.attendance || "[]") 
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});


// Get Employee Details
router.get("/employees/:id", async (req, res) => {
  const { id } = req.params;
// console.log("Employee ID from useParams:", id);
  try {
    const [results] = await db.execute(
      `SELECT employeeId, firstName, lastName, email, profilePic, 
              mobile, dob, maritalStatus, gender, department, designation, 
              type, status, role, attendance 
       FROM employees WHERE employeeId = ?`, 
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(results[0]); 
  } catch (err) {
    console.error("Error fetching employee details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Employee Profile
router.put("/:employeeId", async (req, res) => {
  // console.log("PUT /api/employees/:employeeId hit"); 
    const { employeeId } = req.params;
    // console.log("employeeId:", employeeId);
  const {
    firstName, lastName, mobile, email, dob, maritalStatus, gender, nationality,
    address, city, state, zip, type, department, designation, workingDays,
    joiningDate, userName, role, status, profilePic,
    aadharCard, appointmentLetter, otherDocument1, otherDocument2
  } = req.body;

  // console.log("Update request received for:", employeeId); 
  // console.log("Updated data:", req.body);

  try {
    const sql = `UPDATE employees 
                 SET firstName = ?, lastName = ?, mobile = ?, email = ?, dob = ?, maritalStatus = ?, gender = ?, 
                     nationality = ?, address = ?, city = ?, state = ?, zip = ?, type = ?, department = ?, 
                     designation = ?, workingDays = ?, joiningDate = ?, userName = ?, role = ?, status = ?, profilePic = ?, 
                     aadharCard = ?, appointmentLetter = ?, otherDocument1 = ?, otherDocument2 = ? 
                 WHERE employeeId = ?`;

    const values = [
      firstName, lastName, mobile, email, dob, maritalStatus, gender, nationality,
      address, city, state, zip, type, department, designation, workingDays,
      joiningDate, userName, role, status, profilePic,
      aadharCard, appointmentLetter, otherDocument1, otherDocument2,
      employeeId
    ];

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Profile Picture Upload (Secured with JWT)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/upload-profile-pic", upload.single("profilePic"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const profilePicPath = `/uploads/${req.file.filename}`;

    await db.execute("UPDATE employees SET profilePic = ? WHERE employeeId = ?", [profilePicPath, decoded.id]);

    res.json({ profilePic: profilePicPath });
  } catch (error) {
    res.status(500).json({ message: "Error uploading profile picture", error: error.message });
  }
});



module.exports = router;
