const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "brske8exqz6yt5vn3dwc-mysql.services.clever-cloud.com", // Clever Cloud Host
  user: "ujkgatngxeqbgqtv", // Clever Cloud Username
  password: "AOOMdJdnsyIaoCxsBrFa", // Clever Cloud Password
  database: "brske8exqz6yt5vn3dwc", // Clever Cloud Database Name
  port: 3306, // MySQL Default Port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("✅ Connected to Clever Cloud MySQL!");

module.exports = pool;
