const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-prod";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log("[auth] Signup attempt:", { email, name });
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }

    // Check if user already exists
    const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    console.log("[auth] existing users for email:", existing && existing.length ? existing.length : 0);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user
    const [insertResult] = await db.execute(
      "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
      [email, password_hash, name]
    );
    console.log("[auth] insert result insertId:", insertResult && insertResult.insertId);

    // Generate JWT token
    const token = jwt.sign(
      { id: insertResult.insertId, email, name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: { id: insertResult.insertId, email, name },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
});

// Signin endpoint
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[auth] Signin attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const [users] = await db.execute(
      "SELECT id, email, name, password_hash FROM users WHERE email = ?",
      [email]
    );
    console.log("[auth] users found:", users && users.length ? users.length : 0);

    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    // Debug: report that a user record was retrieved (without exposing password hash)
    console.log("[auth] user retrieved:", { id: user?.id, email: user?.email, hasPasswordHash: !!user?.password_hash });

    // Safety check
    if (!user || !user.password_hash) {
      console.log("[auth] user missing or no password_hash");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log("[auth] password match result:", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ error: "Signin failed" });
  }
});

// Verify token and get user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, email, name FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: users[0] });
  } catch (err) {
    console.error("Me endpoint error:", err);
    return res.status(500).json({ error: "Failed to fetch user info" });
  }
});

module.exports = { router, verifyToken };
