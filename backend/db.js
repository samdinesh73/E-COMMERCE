require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "shop_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Optional: catch errors
pool.on("error", (err) => {
    console.error("❌ MySQL Error:", err);
});

module.exports = pool.promise();
