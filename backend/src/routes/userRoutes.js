const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const upload = require("../middleware/upload");

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-prod";
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Get all users (admin only)
router.get("/admin/all-users", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    // Build date filter if provided
    let dateFilter = "";
    let params = [];
    
    if (fromDate || toDate) {
      if (fromDate && toDate) {
        dateFilter = " WHERE DATE(created_at) BETWEEN ? AND ?";
        params = [fromDate, toDate];
      } else if (fromDate) {
        dateFilter = " WHERE DATE(created_at) >= ?";
        params = [fromDate];
      } else if (toDate) {
        dateFilter = " WHERE DATE(created_at) <= ?";
        params = [toDate];
      }
    }

    // Fetch users with their order counts and revenue
    const [users] = await db.execute(
      `SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.created_at,
        COUNT(lo.id) as total_orders,
        COALESCE(SUM(lo.total_price), 0) as total_revenue
      FROM users u
      LEFT JOIN login_orders lo ON u.id = lo.user_id
      ${dateFilter}
      GROUP BY u.id, u.email, u.name, u.created_at
      ORDER BY u.created_at DESC`,
      params
    );

    return res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user details by ID
router.get("/admin/user-detail/:id", async (req, res) => {
  try {
    const user_id = req.params.id;

    // Get user info
    const [users] = await db.execute(
      "SELECT id, email, name, created_at FROM users WHERE id = ?",
      [user_id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's orders with revenue
    const [orders] = await db.execute(
      `SELECT 
        id, 
        email, 
        phone, 
        full_name, 
        total_price as amount, 
        shipping_address as address,
        city,
        pincode,
        payment_method,
        status,
        created_at
      FROM login_orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [user_id]
    );

    // Calculate totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0);

    return res.json({
      user: users[0],
      orders,
      totalOrders,
      totalRevenue
    });
  } catch (err) {
    console.error("Get user detail error:", err);
    return res.status(500).json({ error: "Failed to fetch user details" });
  }
});

module.exports = router;

// ====== USER PROFILE ROUTES (AUTHENTICATED) ======

// Get current user profile (logged in user)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Get user info
    const [users] = await db.execute(
      "SELECT id, email, name, phone, avatar FROM users WHERE id = ?",
      [user_id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's addresses
    const [addresses] = await db.execute(
      "SELECT id, address_line, city, state, pincode, country, is_default FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [user_id]
    );

    return res.json({
      user: users[0],
      addresses: addresses || []
    });
  } catch (err) {
    console.error("Get user profile error:", err);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user profile (name, email, phone, avatar)
router.put("/me", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, phone, avatar } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Update user
    const [result] = await db.execute(
      "UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?",
      [name.trim(), phone || null, avatar || null, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return updated user
    const [users] = await db.execute(
      "SELECT id, email, name, phone, avatar FROM users WHERE id = ?",
      [user_id]
    );

    return res.json({ message: "Profile updated successfully", user: users[0] });
  } catch (err) {
    console.error("Update user profile error:", err);
    return res.status(500).json({ error: "Failed to update user profile" });
  }
});

// Upload user avatar
router.post("/me/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Construct the avatar path (relative to public folder)
    const avatarPath = `/uploads/${req.file.filename}`;

    // Update user avatar in database
    const [result] = await db.execute(
      "UPDATE users SET avatar = ? WHERE id = ?",
      [avatarPath, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "Avatar uploaded successfully", avatar: avatarPath });
  } catch (err) {
    console.error("Upload avatar error:", err);
    return res.status(500).json({ error: "Failed to upload avatar" });
  }
});

// ====== USER ADDRESS ROUTES (AUTHENTICATED) ======

// Get all user addresses
router.get("/addresses", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [addresses] = await db.execute(
      "SELECT id, address_line, city, state, pincode, country, is_default FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [user_id]
    );

    return res.json({ addresses: addresses || [] });
  } catch (err) {
    console.error("Get user addresses error:", err);
    return res.status(500).json({ error: "Failed to fetch addresses" });
  }
});

// Add new address for user
router.post("/addresses", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { address_line, city, state, pincode, country, is_default } = req.body;

    // Validate required fields
    if (!address_line || !city || !pincode) {
      return res.status(400).json({ error: "Address, city, and pincode are required" });
    }

    // If this is the default address, unset other defaults
    if (is_default) {
      await db.execute(
        "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?",
        [user_id]
      );
    }

    // Insert new address
    const [result] = await db.execute(
      "INSERT INTO user_addresses (user_id, address_line, city, state, pincode, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [user_id, address_line, city, state || null, pincode, country || null, is_default ? 1 : 0]
    );

    return res.status(201).json({
      id: result.insertId,
      user_id,
      address_line,
      city,
      state: state || null,
      pincode,
      country: country || null,
      is_default: is_default ? 1 : 0
    });
  } catch (err) {
    console.error("Add address error:", err);
    return res.status(500).json({ error: "Failed to add address" });
  }
});

// Update user address
router.put("/addresses/:id", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const address_id = req.params.id;
    const { address_line, city, state, pincode, country, is_default } = req.body;

    // Verify ownership
    const [existing] = await db.execute(
      "SELECT id FROM user_addresses WHERE id = ? AND user_id = ?",
      [address_id, user_id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    // If this is the default address, unset other defaults
    if (is_default) {
      await db.execute(
        "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ? AND id != ?",
        [user_id, address_id]
      );
    }

    // Update address
    const [result] = await db.execute(
      "UPDATE user_addresses SET address_line = ?, city = ?, state = ?, pincode = ?, country = ?, is_default = ? WHERE id = ? AND user_id = ?",
      [address_line || null, city || null, state || null, pincode || null, country || null, is_default ? 1 : 0, address_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Failed to update address" });
    }

    return res.json({ message: "Address updated successfully" });
  } catch (err) {
    console.error("Update address error:", err);
    return res.status(500).json({ error: "Failed to update address" });
  }
});

// Delete user address
router.delete("/addresses/:id", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const address_id = req.params.id;

    // Verify ownership
    const [existing] = await db.execute(
      "SELECT id FROM user_addresses WHERE id = ? AND user_id = ?",
      [address_id, user_id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Delete address
    const [result] = await db.execute(
      "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
      [address_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Failed to delete address" });
    }

    return res.json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Delete address error:", err);
    return res.status(500).json({ error: "Failed to delete address" });
  }
});
