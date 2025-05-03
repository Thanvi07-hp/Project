const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: "brske8exqz6yt5vn3dwc-mysql.services.clever-cloud.com",
  user: "ujkgatngxeqbgqtv",
  password: "AOOMdJdnsyIaoCxsBrFa",
  database: "brske8exqz6yt5vn3dwc",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 60000,
});

// pool.on('error', (err) => {
//   console.error('Unexpected error on idle connection', err);
//   process.exit(-1);
// });

pool.getConnection()
  .then(connection => {
    console.log("✅ MySQL Connection Pool Ready!");
    connection.release();
  })
  .catch(err => {
    console.error("❌ Error connecting to MySQL:", err);
    process.exit(1);
  });

module.exports = pool;