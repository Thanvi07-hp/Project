const express = require("express");
const db = require("../db");

const router = express.Router();

// Get attendance for specific employee
router.get("/:employeeId", async (req, res) => {
    const { employeeId } = req.params;
  
    try {
      const [rows] = await db.execute(
        `SELECT id, date, status, check_in_time 
         FROM attendance 
         WHERE employeeId = ? 
         ORDER BY date DESC`,
        [employeeId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error("❌ Error fetching attendance:", err.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  module.exports = router;