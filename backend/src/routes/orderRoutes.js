const express = require("express");
const db = require("../config/database");
const { verifyToken } = require("./authRoutes");

const router = express.Router();

// Create order
router.post("/", verifyToken, async (req, res) => {
  try {
    const { total_price, shipping_address, city, pincode, payment_method, items } = req.body;
    const user_id = req.user.id;

    if (!total_price || !shipping_address || !payment_method) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await db.execute(
      "INSERT INTO orders (user_id, total_price, shipping_address, city, pincode, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [user_id, total_price, shipping_address, city, pincode, payment_method, "pending"]
    );

    return res.status(201).json({
      id: result.insertId,
      user_id,
      total_price,
      shipping_address,
      payment_method,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// Get user's orders
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [orders] = await db.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    return res.json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order_id = req.params.id;
    const user_id = req.user.id;

    const [orders] = await db.execute(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [order_id, user_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.json({ order: orders[0] });
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

module.exports = router;
