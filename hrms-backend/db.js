const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "brske8exqz6yt5vn3dwc-mysql.services.clever-cloud.com",
  user: "ujkgatngxeqbgqtv",
  password: "AOOMdJdnsyIaoCxsBrFa",
  database: "brske8exqz6yt5vn3dwc",
  waitForConnections: true,
  connectionLimit: 5,  
  queueLimit: 0,
});

console.log("✅ MySQL Connection Pool Ready!");

module.exports = pool;
