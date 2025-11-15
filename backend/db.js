const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Sellerrocket@2025",
    database: "shop_db"
});

db.connect((err) => {
    if (err) console.log("DB error:", err);
    else console.log("MySQL Connected");
});

module.exports = db;
