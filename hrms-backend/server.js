require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const attendanceRoutes = require("./routes/attendance"); 

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// Ensure Express can parse JSON

app.use(cors());
// app.use(bodyParser.json());

// MySQL Database Connection
const db = require("./db");


// 🔹 JWT Middleware for Route Protection (Move this ABOVE all routes!)
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.user = decoded;
        next();
    });
};

// 🔹 Login Route (Admin & Employee)
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const table = "users";  // Ensure this table exists in your database

    try {
        const [results] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, role: user.role });

    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// 🔹 Get All Employees (Move below verifyToken)
app.get("/api/employees", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM employees"); // Use `await`
        res.json(results);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Store files in 'uploads' folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
  });

  const upload = multer({ storage });

// To Add Employee
app.post(
  "/api/employees",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "appointmentLetter", maxCount: 1 },
    { name: "otherDocument1", maxCount: 1 },
    { name: "otherDocument2", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
        const employeeData = { ...req.body };  // Ensure parsing of form fields
        console.log("Received Employee Data:", employeeData);


      const {
        firstName, lastName, mobile, email, dob, maritalStatus, gender,
        nationality, address, city, state, zip, employeeId, userName,
        department, designation, type, status, workingDays, joiningDate, role, attendance
      } = req.body;

      // 🔴 Check required fields before proceeding
      if (!employeeData.firstName || !employeeData.lastName || !employeeData.email) {
        return res.status(400).json({ message: "Missing required fields" });
    }

      const profilePic = req.files["profilePic"] ? req.files["profilePic"][0].path : null;
      const aadharCard = req.files["aadharCard"] ? req.files["aadharCard"][0].path : null;
      const appointmentLetter = req.files["appointmentLetter"] ? req.files["appointmentLetter"][0].path : null;
      const otherDocument1 = req.files["otherDocument1"] ? req.files["otherDocument1"][0].path : null;
      const otherDocument2 = req.files["otherDocument2"] ? req.files["otherDocument2"][0].path : null;

      const query = `INSERT INTO employees (
        firstName, lastName, mobile, email, dob, maritalStatus, gender, nationality,
        address, city, state, zip, employeeId, userName, department, designation, type,
        status, workingDays, joiningDate, role, attendance, profilePic, aadharCard,
        appointmentLetter, otherDocument1, otherDocument2, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

      const values = [
        firstName, lastName, mobile, email, dob, maritalStatus, gender,
        nationality, address, city, state, zip, employeeId, userName,
        department, designation, type, status, workingDays, joiningDate,
        role, attendance, profilePic, aadharCard, appointmentLetter,
        otherDocument1, otherDocument2
      ];
      await db.query(query, values);
        res.status(201).json({ message: "Employee added successfully" });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  }
);


//GET route for a single employee
app.get("/api/employees/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;
        const [results] = await db.query(`SELECT * FROM employees WHERE employeeId = ?`, [employeeId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json(results[0]);
    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Delete Employee
app.delete("/api/employees/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;
        console.log("Attempting to delete Employee ID:", employeeId);

        const [result] = await db.query("DELETE FROM employees WHERE employeeId = ?", [employeeId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting employee:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


// Update employee details by ID
app.put("/api/employees/:employeeId", async (req, res) => {
    const { employeeId } = req.params;
    const { firstName, lastName, mobile, email, dob, maritalStatus, gender, nationality, address, city, state, zip, 
            type, department, designation, workingDays, joiningDate, userName, role, status, profilePic,
            aadharCard, appointmentLetter, otherDocument1, otherDocument2 } = req.body;

    try {
        const sql = `UPDATE employees 
                     SET firstName = ?, lastName = ?, mobile = ?, email = ?, dob = ?, maritalStatus = ?, gender = ?, 
                         nationality = ?, address = ?, city = ?, state = ?, zip = ?, type = ?, department = ?, 
                         designation = ?, workingDays = ?, joiningDate = ?, userName = ?, role = ?, status = ?, profilePic = ?, 
                         aadharCard = ?, appointmentLetter = ?, otherDocument1 = ?, otherDocument2 = ? 
                     WHERE employeeId = ?`;

        const values = [firstName, lastName, mobile, email, dob, maritalStatus, gender, nationality, address, city, state, zip, 
                        type, department, designation, workingDays, joiningDate, userName, role, status, profilePic, 
                        aadharCard, appointmentLetter, otherDocument1, otherDocument2, employeeId];

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


// 🔹 Attendance Routes
app.use("/api", attendanceRoutes.default || attendanceRoutes);

// 🔹 Mark Attendance
app.post("/api/mark-attendance", async (req, res) => {
    const { employeeId, status } = req.body;
    const today = new Date().toISOString().split("T")[0];

    try {
        const [results] = await db.query("SELECT * FROM attendance WHERE employeeId = ? AND date = ?", [employeeId, today]);

        if (results.length > 0) {
            await db.query("UPDATE attendance SET status = ? WHERE employeeId = ? AND date = ?", [status, employeeId, today]);
            return res.json({ message: "Attendance updated!" });
        } 

        await db.query("INSERT INTO attendance (employeeId, date, status) VALUES (?, ?, ?)", [employeeId, today, status]);
        res.json({ message: "Attendance marked successfully!" });

    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ error: error.message });
    }
});


// 🚀 Start Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});