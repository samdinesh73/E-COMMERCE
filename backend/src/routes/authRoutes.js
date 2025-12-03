const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables!");
  return "your-secret-key-change-in-prod";
})();

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

    // Insert new user with default 'customer' role
    const [insertResult] = await db.execute(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
      [email, password_hash, name, 'customer']
    );
    console.log("[auth] insert result insertId:", insertResult && insertResult.insertId);

    // Generate JWT token with role
    const token = jwt.sign(
      { id: insertResult.insertId, email, name, role: 'customer' },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: { id: insertResult.insertId, email, name, role: 'customer' },
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
      "SELECT id, email, name, password_hash, role FROM users WHERE email = ?",
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

    // Generate JWT token with role
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role || 'customer' },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role || 'customer' },
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ error: "Signin failed" });
  }
});

// In-memory OTP storage (use Redis in production)
const otpStorage = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    console.log("[OTP] Received request:", { phone, phoneType: typeof phone, phoneLength: phone ? phone.length : 'null' });

    // Validate phone number
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Remove any non-digit characters and validate
    const cleanPhone = phone.toString().replace(/\D/g, '');
    console.log("[OTP] Cleaned phone:", { cleanPhone, length: cleanPhone.length });

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: `Valid 10-digit phone number required (received ${cleanPhone.length} digits)` });
    }

    const otp = generateOTP();
    
    // Store OTP with 5-minute expiry
    otpStorage.set(cleanPhone, {
      otp,
      createdAt: Date.now(),
      attempts: 0,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    console.log(`\n✅ [OTP] Generated OTP for ${cleanPhone}: ${otp}`);
    console.log(`📱 [DEV] OTP for +91${cleanPhone}: ${otp}\n`);

    // TODO: Integrate actual SMS service (Twilio, AWS SNS, etc.)
    // await sendSMS(cleanPhone, `Your OTP is ${otp}. Valid for 5 minutes.`);

    return res.json({ 
      message: "OTP sent successfully",
      phone: cleanPhone,
      // Remove in production - only for testing
      ...(process.env.NODE_ENV !== 'production' && { otp, devOnly: true })
    });
  } catch (err) {
    console.error("[OTP] Send OTP error:", err);
    return res.status(500).json({ error: "Failed to send OTP: " + err.message });
  }
});

// Verify OTP endpoint
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp, name, password, action } = req.body;

    console.log("[OTP-Verify] Received request:", { phone, otp: otp ? "***" : "missing", action });

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP required" });
    }

    // Clean phone number (same as send-otp)
    const cleanPhone = phone.toString().replace(/\D/g, '');
    console.log("[OTP-Verify] Cleaned phone:", { cleanPhone, originalPhone: phone });

    // Check if OTP exists and is valid
    const otpData = otpStorage.get(cleanPhone);
    console.log("[OTP-Verify] OTP Storage lookup:", { found: !!otpData, storageKeys: Array.from(otpStorage.keys()) });
    
    if (!otpData) {
      return res.status(400).json({ error: "No OTP found for this phone number. Please send OTP first." });
    }

    if (Date.now() > otpData.expiresAt) {
      otpStorage.delete(cleanPhone);
      console.log("[OTP-Verify] OTP Expired");
      return res.status(400).json({ error: "OTP expired. Please request a new one" });
    }

    if (otpData.attempts >= 3) {
      otpStorage.delete(cleanPhone);
      console.log("[OTP-Verify] Max attempts exceeded");
      return res.status(400).json({ error: "Maximum OTP attempts exceeded. Please request a new OTP" });
    }

    console.log("[OTP-Verify] Comparing OTPs:", { received: otp, stored: otpData.otp, match: otp === otpData.otp });

    if (otpData.otp !== otp) {
      otpData.attempts++;
      console.log("[OTP-Verify] Invalid OTP, attempts:", otpData.attempts);
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    console.log("[OTP-Verify] OTP verified successfully");

    // OTP verified - clear it
    otpStorage.delete(cleanPhone);

    // Handle signup with phone
    if (action === "signup") {
      if (!name || !password) {
        return res.status(400).json({ error: "Name and password required for signup" });
      }

      // Check if phone already exists
      const [existing] = await db.execute(
        "SELECT id FROM users WHERE phone = ?",
        [cleanPhone]
      );

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: "Phone number already registered" });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert new user with phone
      const [insertResult] = await db.execute(
        "INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)",
        [
          `${cleanPhone}@phone.local`, // Generate email from phone
          password_hash,
          name,
          cleanPhone,
          'customer'
        ]
      );

      const userId = insertResult.insertId;

      // Generate JWT token
      const token = jwt.sign(
        { id: userId, email: `${cleanPhone}@phone.local`, name, phone: cleanPhone },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      console.log("[OTP-Verify] User created:", { userId, phone: cleanPhone });

      return res.json({
        message: "Account created successfully",
        token,
        user: { id: userId, name, phone: cleanPhone, role: 'customer' }
      });
    }

    // Handle signin with phone
    if (action === "login") {
      // Find user by phone
      const [users] = await db.execute(
        "SELECT id, email, name, password_hash, role FROM users WHERE phone = ?",
        [cleanPhone]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: "Phone not registered. Please sign up first" });
      }

      const user = users[0];

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, phone: cleanPhone },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      console.log("[OTP-Verify] User logged in:", { userId: user.id, phone: cleanPhone });

      return res.json({
        message: "Signed in successfully",
        token,
        user: { id: user.id, email: user.email, name: user.name, phone: cleanPhone, role: user.role || 'customer' }
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

// Verify token and get user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, email, name, role FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: { ...users[0], role: users[0].role || 'customer' } });
  } catch (err) {
    console.error("Me endpoint error:", err);
    return res.status(500).json({ error: "Failed to fetch user info" });
  }
});

module.exports = { router, verifyToken };
