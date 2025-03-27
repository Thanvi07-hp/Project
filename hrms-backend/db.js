const mysql = require("mysql2/promise"); 

const pool = mysql.createPool({
  host: "localhost", // Change if needed
  user: "root",      // Your MySQL username
  password: "Abc@123y",      // Your MySQL password
  database: "hrms",  // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
});

console.log("✅ MySQL Connection Pool Ready!");

module.exports = pool;