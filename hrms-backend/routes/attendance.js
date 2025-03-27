const express = require("express");
const router = express.Router();
const db = require("../db"); // Ensure the correct import

router.post("/update", async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `
      INSERT INTO attendance (employee_id, date, status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE status = ?;
    `;

    // Using db.execute() instead of db.query()
    const [result] = await db.execute(query, [employeeId, date, status, status]);

    res.json({ success: true, message: "Attendance updated successfully", result });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
