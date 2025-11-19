const express = require("express");
const db = require("../config/database");

const router = express.Router();

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
