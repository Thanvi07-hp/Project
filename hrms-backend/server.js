require("dotenv").config();
console.log("DB_HOST:", process.env.DB_HOST);
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const otpRoutes = require("./routes/otpRoutes");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));

app.use(otpRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));



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

//Login Logic
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

        const { email, password, role } = req.body;

        const validRoles = {
            admin: "users",
            employee: "employees"
        };

        const table = validRoles[role];
        if (!table) return res.status(400).json({ message: "Invalid role" });

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

            const token = jwt.sign(
                { id: user.id || user.employeeId, role: user.role || role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({
                token,
                role: user.role || role,
                employee: table === "employees" ? user : null
            });

        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });

        }
    }
});


//Reset Password
app.post("/api/reset-password-simple", async (req, res) => {
    const { email, newPassword, userType } = req.body;

    //     console.log(" Password reset request received:");
    //   console.log("User Type:", userType);
    //   console.log("Email:", email);
    //   console.log("New Password (plaintext):", newPassword);

    try {
        const table = userType === "admin" ? "admins" : "employees";

        const [rows] = await db.execute(`SELECT * FROM ${table} WHERE email = ?`, [email]);

        if (rows.length === 0) {
            console.log(" No user found with email:", email);
            return res.status(404).json({ message: "User not found." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //   console.log("Hashed password:", hashedPassword);


        await db.execute(`UPDATE ${table} SET password = ? WHERE email = ?`, [
            hashedPassword,
            email,
        ]);

        res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        console.error("Reset error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


// 🔹 Get All Employees (Move below verifyToken)
app.get("/api/employees", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM employees");
        res.json(results);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


app.use('/uploads', express.static('uploads'));

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Folder where uploaded files are stored
    },
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
  });

const upload = multer({ storage });




// Add employee route

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

            console.log(" New employee submission received");

            const employeeData = { ...req.body };
            const {
                firstName, lastName, mobile, email, dob, maritalStatus, gender,
                nationality, address, city, state, zip, userName,
                department, designation, type, status, workingDays, joiningDate, role,
                attendance
            } = employeeData;

            console.log("Employee Data:", employeeData);

            if (!firstName || !lastName || !email) {
                return res.status(400).json({ message: "Missing required fields" });
            }
            // Set auto-generated password
            const rawPassword = firstName.trim() + "123";
            const hashedPassword = await bcrypt.hash(rawPassword, 10);


            // File uploads
            const profilePic = req.files["profilePic"] ? req.files["profilePic"][0].path : null;
            const aadharCard = req.files["aadharCard"] ? req.files["aadharCard"][0].path : null;
            const appointmentLetter = req.files["appointmentLetter"] ? req.files["appointmentLetter"][0].path : null;
            const otherDocument1 = req.files["otherDocument1"] ? req.files["otherDocument1"][0].path : null;
            const otherDocument2 = req.files["otherDocument2"] ? req.files["otherDocument2"][0].path : null;

            const query = `INSERT INTO employees (
            firstName, lastName, mobile, email, dob, maritalStatus, gender, nationality,
            address, city, state, zip, userName, department, designation, type,
            status, workingDays, joiningDate, role, attendance, password, profilePic,
            aadharCard, appointmentLetter, otherDocument1, otherDocument2
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                firstName, lastName, mobile, email, dob, maritalStatus, gender,
                nationality, address, city, state, zip, userName, department,
                designation, type, status, workingDays, joiningDate,
                role, attendance, hashedPassword, profilePic, aadharCard,
                appointmentLetter, otherDocument1, otherDocument2
            ];

            await db.query(query, values);

            res.status(201).json({
                message: "Employee added successfully",
                generatedPassword: rawPassword,
            });
        } catch (error) {
            console.error("Server error while adding employee:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

app.put('/api/employees/:employeeId/replace-doc', upload.single('document'), async (req, res) => {
    const employeeId = req.params.id;
    const documentType = req.body.documentType; // The document we want to replace (aadharCard, appointmentLetter, etc.)
    const newFilePath = req.file.path;
  
    try {
      // Fetch current document data from the database
      const employee = await db.query('SELECT * FROM employees WHERE employeeId = ?', [employeeId]);
  
      if (!employee || employee.length === 0) {
        return res.status(404).json({ message: 'Employee not found.' });
      }
  
      const existingFilePath = employee[0][documentType]; // Get the current document path from the DB
  
      // Delete the old file if it exists
      if (existingFilePath) {
        const oldFilePath = path.join(__dirname, existingFilePath);
        console.log(`Attempting to delete old file at: ${oldFilePath}`);  // Log the old file path
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Remove the old file
          console.log(`Successfully deleted old file at: ${oldFilePath}`);
        } else {
          console.log(`Old file does not exist at: ${oldFilePath}`);
        }
      }
  
      // Update the document path in the database
      await db.query(`UPDATE employees SET ${documentType} = ? WHERE employeeid = ?`, [newFilePath, employeeId]);
  
      res.json({ success: true, newDocUrl: newFilePath }); // Send back the new file URL to update the state
    } catch (error) {
      console.error('Error replacing document:', error.message); // Log the error message
      console.error(error.stack); // Log the full error stack
      res.status(500).json({ message: 'Error replacing document.', error: error.message }); // Send detailed error response
    }
  });
  

//GET route for a single employee
app.get("/api/employees/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;
        // console.log(employeeId);

        const [results] = await db.query(`SELECT * FROM employees WHERE employeeId = ?`, [employeeId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json(results[0]);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


//Delete Employee
app.delete("/api/employees/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;

        const [result] = await db.query("DELETE FROM employees WHERE employeeId = ?", [employeeId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
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
        res.status(500).json({ message: "Internal server error" });
    }
});


// Fetch Employees and Their Attendance
app.get("/api/employees", async (req, res) => {
    try {
        const query = `
                    SELECT e.employeeId, e.firstName, e.lastName, a.status, 
                        TIME(a.check_in_time) AS check_in_time
                    FROM employees e
                    LEFT JOIN attendance a ON e.employeeId = a.employeeId AND a.date = CURDATE();
                `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({ error: "Database error" });
    }
});


// Get Attendance for Today
app.get("/api/get-attendance", async (req, res) => {
    try {
        const query = `
            SELECT a.id, a.employeeId, e.firstName, e.lastName, a.status, a.check_in_time, a.date
            FROM attendance a
            JOIN employees e ON a.employeeId = e.employeeId
            WHERE a.date = CURDATE();
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ error: "Failed to fetch attendance" });
    }
});

// Mark Attendance
app.post("/api/mark-attendance", async (req, res) => {
    const { employeeId, status } = req.body;
    const checkInTime = status === "Present" ? new Date() : null; // Only record time if Present

    try {
        // Check if attendance for today exists
        const checkQuery = "SELECT * FROM attendance WHERE employeeId = ? AND date = CURDATE()";
        const [existing] = await db.query(checkQuery, [employeeId]);

        if (existing.length > 0) {
            // If record exists, update it
            await db.query(
                "UPDATE attendance SET status = ?, check_in_time = ? WHERE employeeId = ? AND date = CURDATE()",
                [status, checkInTime, employeeId]
            );
        } else {
            // If no record exists, insert a new one
            await db.query(
                "INSERT INTO attendance (employeeId, date, status, check_in_time) VALUES (?, CURDATE(), ?, ?)",
                [employeeId, status, checkInTime]
            );
        }

        // Fetch the updated record and send it to the frontend
        const [updatedAttendance] = await db.query(
            "SELECT employeeId, status, check_in_time FROM attendance WHERE employeeId = ? AND date = CURDATE()",
            [employeeId]
        );

        res.json(updatedAttendance[0]); // Send updated data to frontend
    } catch (error) {
        console.error("Error updating attendance:", error);
        res.status(500).json({ message: "Error updating attendance" });
    }
});

const fs = require("fs");
const ExcelJS = require("exceljs");

// Export Attendance Data to Excel 
app.get("/api/export-attendance", async (req, res) => {
    try {
        // Fetch attendance data
        const [results] = await db.query(`
            SELECT a.employeeId, e.firstName, 
                   DATE_FORMAT(a.date, '%d-%m-%Y') AS formatted_date, 
                   TIME_FORMAT(a.check_in_time, '%h:%i:%s %p') AS formatted_check_in_time
            FROM attendance a
            JOIN employees e ON a.employeeId = e.employeeId
            ORDER BY a.date ASC;
        `);

        if (results.length === 0) {
            return res.status(404).json({ message: "No attendance data found" });
        }

        // Transform data into the required format
        const attendanceData = {};

        results.forEach(({ employeeId, firstName, formatted_date, formatted_check_in_time }) => {
            if (!attendanceData[employeeId]) {
                attendanceData[employeeId] = { "Employee ID": employeeId, "First Name": firstName };
            }
            attendanceData[employeeId][formatted_date] = formatted_check_in_time || "---";
        });

        // Convert object to array
        const formattedArray = Object.values(attendanceData);

        // Create a new Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Attendance");

        // 🔹 Define header row
        const headers = Object.keys(formattedArray[0]);
        worksheet.addRow(headers);

        // 🔹 Apply styles to header row
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true }; // Bold text
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF00" }, // Yellow background
            };
            cell.alignment = { horizontal: "center", vertical: "middle" }; // Center alignment
        });

        // 🔹 Add data rows
        formattedArray.forEach((row) => {
            worksheet.addRow(Object.values(row));
        });

        // 🔹 Adjust column widths
        worksheet.columns = headers.map((header) => ({
            header,
            key: header,
            width: header.length + 5, // Auto adjust width
        }));

        // Ensure "exports" directory exists
        const exportDir = path.join(__dirname, "exports");
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        // Define file path
        const filePath = path.join(exportDir, `attendance_${Date.now()}.xlsx`);

        // Write file to disk
        await workbook.xlsx.writeFile(filePath);

        res.json({ message: "Attendance exported successfully", filePath });

    } catch (error) {
        console.error("Error exporting attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/attendance/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;
        const query = `
            SELECT a.id, a.employeeId, e.firstName, e.lastName, a.status, a.check_in_time, a.date
            FROM attendance a
            JOIN employees e ON a.employeeId = e.employeeId
            WHERE a.employeeId = ?;
        `;
        const [rows] = await db.query(query, [employeeId]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ error: "Failed to fetch attendance" });
    }
});
app.get("/api/attendance", async (req, res) => {
    try {
        const query = `
            SELECT a.id, a.employeeId, e.firstName, e.lastName, a.status, a.check_in_time, a.date
            FROM attendance a
            JOIN employees e ON a.employeeId = e.employeeId
            ORDER BY a.date ASC, a.employeeId;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching all attendance:", err);
        res.status(500).json({ error: "Failed to fetch all attendance" });
    }
});

// PAYROLL!!
//  Fetch all payroll records (Ensure all employees are included)
app.get("/api/payroll", async (req, res) => {
    try {
        const query = `
          SELECT e.employeeId, e.firstName, e.lastName, e.profilePic, 
                 p.id AS payrollId, p.salary, p.TDS, p.Advance, p.status, p.updated_at
          FROM employees e
          LEFT JOIN payroll p ON e.employeeId = p.employeeId;
      `;

        const [rows] = await db.query(query);

        // Format the 'updated_at' field to show only the date
        rows.forEach(row => {
            const dbTime = new Date(row.updated_at);
            const formattedDate = dbTime.toLocaleDateString("en-IN"); // This formats to "DD/MM/YYYY"
            row.updated_at = formattedDate;  // Replace the time with only the date
        });

        res.json(rows);
    } catch (error) {
        console.error("Error fetching payroll:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// Add or Update Payroll Entry Automatically
app.post("/api/payroll/add", async (req, res) => {
    const { employeeId, salary, TDS, Advance, status } = req.body;

    if (!employeeId || !salary) {
        return res.status(400).json({ message: "Employee ID and Salary are required" });
    }

    try {
        const [existing] = await db.query("SELECT id FROM payroll WHERE employeeId = ?", [employeeId]);

        if (existing.length > 0) {
            // If exists, update instead of throwing error, and store only the date in updated_at
            await db.query(
                "UPDATE payroll SET salary = ?, TDS = ?, Advance = ?, status = ?, updated_at = CURDATE() WHERE employeeId = ?",
                [salary, TDS || 0, Advance || 0, status || "Pending", employeeId]
            );
            return res.json({ message: "Payroll updated successfully" });
        }

        // Otherwise, insert new payroll entry, storing only the date in updated_at
        await db.query(
            "INSERT INTO payroll (employeeId, salary, TDS, Advance, status, updated_at) VALUES (?, ?, ?, ?, ?, CURDATE())",
            [employeeId, salary, TDS || 0, Advance || 0, status || "Pending"]
        );

        res.status(201).json({ message: "Payroll added successfully" });
    } catch (error) {
        console.error("Error adding payroll:", error);
        res.status(500).json({ error: "Server error" });
    }
});

//  Update Payroll Entry
app.put("/api/payroll/update/:id", async (req, res) => {
    const { salary, tds, advance, status } = req.body;
    const { id } = req.params;

    try {
        await db.query(
            "UPDATE payroll SET salary = ?, tds = ?, advance = ?, status = ?, updated_at = CURDATE() WHERE id = ?",
            [salary, tds, advance, status, id]
        );
        res.json({ message: "Payroll updated successfully" });
    } catch (error) {
        console.error("Error updating payroll:", error);
        res.status(500).json({ error: "Server error updating payroll" });
    }
});


//API of  payroll and saving 
app.get("/api/payroll/export", async (req, res) => {
    try {
        const [payrollData] = await db.query(`
          SELECT employees.firstName, employees.lastName, payroll.salary, payroll.tds, payroll.advance, 
                 (payroll.salary - payroll.tds - payroll.advance) AS netSalary, payroll.updated_at 
          FROM payroll 
          JOIN employees ON payroll.employeeId = employees.employeeId
      `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Payroll Report");

        // Add Headers
        worksheet.addRow(["Employee Name", "Salary", "TDS", "Advance", "Net Salary", "Date"]); // Change the column header to just "Date"
        worksheet.getRow(1).font = { bold: true }; // Make headers bold

        worksheet.getColumn(6).width = 25; // Set width for Date column

        // Add Payroll Data
        payrollData.forEach((entry) => {
            const dbTime = new Date(entry.updated_at);

            // Format the date to remove the time portion
            const formattedDate = dbTime.toISOString().split('T')[0];  // Formats as 'YYYY-MM-DD'

            worksheet.addRow([
                `${entry.firstName} ${entry.lastName}`,
                entry.salary,
                entry.tds,
                entry.advance,
                entry.salary - entry.tds - entry.advance, // Net Salary
                formattedDate, // Only Date (no time)
            ]);
        });

        // Create Folder if Not Exists
        const reportsDir = path.join(__dirname, "payroll_reports");
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        // Save File
        const filePath = path.join(reportsDir, `Payroll_${new Date().toISOString().slice(0, 10)}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        // Send File for Download
        res.download(filePath);
    } catch (error) {
        console.error("Error exporting payroll:", error);
        res.status(500).json({ error: "Server error while exporting payroll" });
    }
});


//Holiday Section

// Helper function to get the day of the week
function getDayOfWeek(date) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(date);
    return days[d.getDay()];
}

// CREATE: Add a new holiday
app.post('/api/holidays', async (req, res) => {
    const { name, date } = req.body;
    const day = getDayOfWeek(date);

    try {
        const [result] = await db.execute(
            'INSERT INTO holidays (name, date, day) VALUES (?, ?, ?)',
            [name, date, day]
        );
        res.status(201).json({ id: result.insertId, name, date, day });
    } catch (err) {
        res.status(500).json({ message: 'Error inserting holiday', error: err.message });
    }
});

// READ: Get all holidays
app.get('/api/holidays', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM holidays');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching holidays', error: err.message });
    }
});

// READ: Get a specific holiday by ID
app.get('/api/holidays/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM holidays WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Holiday not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error fetching holiday', error: err.message });
    }
});


// UPDATE: Update holiday status (Upcoming or Past)
app.put('/api/holidays/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Upcoming', 'Past'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const [result] = await db.execute( // Changed from promisePool.execute
            'UPDATE holidays SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Holiday status updated' });
        } else {
            res.status(404).json({ message: 'Holiday not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating holiday status', error: err.message });
    }
});


//delete all
app.delete('/api/holidays', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM holidays');

        // console.log("Deleted rows:", result.affectedRows);
        res.status(200).json({ message: 'All holidays deleted successfully' });

    } catch (error) {
        // console.error('Error deleting holidays:', error.message);
        res.status(500).json({ error: 'Failed to delete holidays' });
    }
});


//Tasks
app.post('/api/tasks', async (req, res) => {
    const { task_name, task_description, employee_name, due_date, employeeId, status = 'pending' } = req.body;


    // Convert employeeId to integer
    const employeeIdInt = parseInt(employeeId, 10);

    if (isNaN(employeeIdInt)) {
        return res.status(400).json({ message: 'Invalid employeeId. It must be a valid integer.' });
    }

    try {
        // Insert task into the database
        const [result] = await db.query(
            'INSERT INTO tasks (task_name, task_description, employee_name, employee_id, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
            [task_name, task_description, employee_name, employeeIdInt, due_date, status]
        );

        res.status(201).json({ id: result.insertId, message: 'Task added successfully' });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ message: 'Error adding task', error });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const [tasks] = await db.query(`
            SELECT t.*, e.firstName, e.lastName 
            FROM tasks t
            JOIN employees e ON t.employee_id = e.employeeId
            WHERE t.status != 'failed'
        `);

        // Convert the due_date from UTC to local time
        const formattedTasks = tasks.map(task => {
            const dueDate = new Date(task.due_date); // Convert to Date object
            const assignedDate = new Date(task.assigned_date); // Convert to Date object


            // Adjust the due_date to local time
            task.due_date = dueDate.toLocaleDateString();
            task.assigned_date = assignedDate.toLocaleDateString();

            return task;
        });
        res.json(formattedTasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
});

app.get('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params; // Extract taskId from the request parameters

    // Validate taskId
    const taskIdInt = parseInt(taskId, 10);
    if (isNaN(taskIdInt)) {
        return res.status(400).json({ message: 'Invalid taskId. It must be a valid integer.' });
    }

    try {
        // Query the database for the task by ID
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE id = ?',
            [taskIdInt]
        );

        // If no task is found, return a 404
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const formattedTasks = rows.map(task => {
            const dueDate = new Date(task.due_date); // Convert to Date object
            const assignedDate = new Date(task.assigned_date); // Convert to Date object


            // Adjust the due_date to local time
            task.due_date = dueDate.toLocaleDateString();
            task.assigned_date = assignedDate.toLocaleDateString();

            return task;
        });

        res.json(formattedTasks[0]);
        // Send the task data as a response

    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Error fetching task', error });
    }
});

app.get('/api/tasks/employee/:employeeId', async (req, res) => {
    const { employeeId } = req.params; // Extract employeeId from the request parameters

    // Validate employeeId
    const employeeIdInt = parseInt(employeeId, 10);
    if (isNaN(employeeIdInt)) {
        return res.status(400).json({ message: 'Invalid employeeId. It must be a valid integer.' });
    }

    try {
        // Query the database for tasks of a specific employee
        const [tasks] = await db.query(`
            SELECT t.*, e.firstName, e.lastName 
            FROM tasks t
            JOIN employees e ON t.employee_id = e.employeeId
            WHERE t.employee_id = ? AND t.status != 'failed'
        `, [employeeIdInt]);

        // If no tasks are found, return a 404
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this employee.' });
        }
        const formattedTasks = tasks.map(task => {
            const dueDate = new Date(task.due_date); // Convert to Date object
            const assignedDate = new Date(task.assigned_date); // Convert to Date object


            // Adjust the due_date to local time
            task.due_date = dueDate.toLocaleDateString();
            task.assigned_date = assignedDate.toLocaleDateString();

            return task;
        });

        res.json(formattedTasks);

    } catch (error) {
        console.error('Error fetching tasks for employee:', error);
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
});

// Update Task
app.put('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { task_name, task_description, employee_name, due_date, employeeId } = req.body;

    // Check if employeeId is provided and valid
    if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required.' });
    }

    try {
        // Update task in the database
        const [result] = await db.query(
            'UPDATE tasks SET task_name = ?, task_description = ?, employee_name = ?, due_date = ?, employee_id = ? WHERE id = ?',
            [task_name, task_description, employee_name, due_date, employeeId, taskId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating task', error });
    }
});

// Route to delete a task
app.delete('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        // Delete the task from the database
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);

        // If the task was deleted successfully
        if (result.affectedRows > 0) {
            res.json({ message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error(error);
        // Send error response if something goes wrong
        res.status(500).json({ message: 'Error deleting task', error });
    }
});

// Route to mark a task as failed
app.put('/api/tasks/:taskId/fail', async (req, res) => {
    const { taskId } = req.params;

    try {
        // Update the task's status to 'failed'
        const [result] = await db.query('UPDATE tasks SET status = "failed" WHERE id = ?', [taskId]);

        // If the task was updated successfully
        if (result.affectedRows > 0) {
            res.json({ message: 'Task marked as failed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error(error);
        // Send error response if something goes wrong
        res.status(500).json({ message: 'Error updating task status', error });
    }
});

// Route to fetch all failed tasks
app.get('/api/failed-tasks', async (req, res) => {
    try {
        // Query the database to get all tasks where status is 'failed'
        const [failedTasks] = await db.query(`
            SELECT t.*, e.firstName, e.lastName 
            FROM tasks t
            JOIN employees e ON t.employee_id = e.employeeId
            WHERE t.status = 'failed'
        `);

        // Send the failed tasks as a response in JSON format
        const formattedTasks = failedTasks.map(task => {
            const dueDate = new Date(task.due_date); // Convert to Date object

            // Adjust the due_date to local time
            task.due_date = dueDate.toLocaleDateString(); // This converts to local date (e.g., 'MM/DD/YYYY')
            // Or you could use: task.due_date = dueDate.toISOString().split('T')[0] to keep it as 'YYYY-MM-DD'

            return task;
        });

        res.json(formattedTasks);

    } catch (error) {
        console.error(error);
        // Send an error response if something goes wrong
        res.status(500).json({ message: 'Error fetching failed tasks', error });
    }
});

// In your Express server, define a route to mark the task as completed
app.put('/api/tasks/:taskId/complete', async (req, res) => {
    const { taskId } = req.params;
    try {
        // Assuming Task is your model for tasks
        const task = await task.findByIdAndUpdate(taskId, { status: 'completed' }, { new: true });
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to mark task as completed');
    }
});

// Route to fetch all completed tasks
app.get('/api/completed-tasks', async (req, res) => {
    try {
        // Query the database to get all tasks where status is 'completed'
        const [completedTasks] = await db.query(`
            SELECT t.*, e.firstName, e.lastName 
            FROM tasks t
            JOIN employees e ON t.employee_id = e.employeeId
            WHERE t.status = 'completed'
        `);

        // Send the completed tasks as a response in JSON format
        const formattedTasks = completedTasks.map(task => {
            const dueDate = new Date(task.due_date); // Convert to Date object

            // Adjust the due_date to local time
            task.due_date = dueDate.toLocaleDateString(); // This converts to local date (e.g., 'MM/DD/YYYY')
            // Or you could use: task.due_date = dueDate.toISOString().split('T')[0] to keep it as 'YYYY-MM-DD'

            return task;
        });

        res.json(formattedTasks);

    } catch (error) {
        console.error(error);
        // Send an error response if something goes wrong
        res.status(500).json({ message: 'Error fetching completed tasks', error });
    }
});

app.get('/api/tasks/employee/:employeeId/assigned-today', async (req, res) => {
    const { employeeId } = req.params;

    const employeeIdInt = parseInt(employeeId, 10);
    if (isNaN(employeeIdInt)) {
        return res.status(400).json({ message: 'Invalid employeeId. It must be a valid integer.' });
    }

    try {
        const [tasks] = await db.query(`
            SELECT t.*, e.firstName, e.lastName 
            FROM tasks t
            JOIN employees e ON t.employee_id = e.employeeId
            WHERE t.employee_id = ? AND DATE(t.assigned_date) = CURDATE()
        `, [employeeIdInt]);

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks assigned today for this employee.' });
        }
        const formattedTasks = tasks.map(task => {
            const assignedDate = new Date(task.assigned_date); // Convert to Date object


            task.assigned_date = assignedDate.toLocaleDateString(); // This converts to local date (e.g., 'MM/DD/YYYY')

            return task;
        });

        res.json(formattedTasks);

    } catch (error) {
        console.error('Error fetching tasks assigned today:', error);
        res.status(500).json({ message: 'Error fetching tasks assigned today', error });
    }
});

app.get('/api/tasks/employee/:employeeId/counts', async (req, res) => {
    const { employeeId } = req.params;
    const employeeIdInt = parseInt(employeeId, 10);

    if (isNaN(employeeIdInt)) {
        return res.status(400).json({ message: 'Invalid employeeId. It must be a valid integer.' });
    }

    try {
        const [taskCounts] = await db.query(`
        SELECT
            (SELECT COUNT(*) FROM tasks WHERE employee_id = ? AND status = 'pending') AS assigned,
            (SELECT COUNT(*) FROM tasks WHERE employee_id = ? AND status = 'completed') AS completed,
            (SELECT COUNT(*) FROM tasks WHERE employee_id = ? AND status = 'failed') AS failed
      `, [employeeIdInt, employeeIdInt, employeeIdInt]);

        if (taskCounts.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this employee.' });
        }

        // Ensure the response is valid JSON
        res.json(taskCounts[0]);
    } catch (error) {
        console.error('Error fetching task counts for employee:', error);
        // Ensure the error is returned as JSON
        res.status(500).json({ message: 'Error fetching task counts', error: error.message });
    }
});





// 🚀 Start Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});