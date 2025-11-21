const express = require("express");
const router = express.Router();
const db = require("../config/database");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || (() => {
      console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables!");
      return "your-secret-key-change-in-prod";
    })();
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Get user's cart
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [cartItems] = await db.query(
      `SELECT c.id, p.id as product_id, p.name, p.price, p.image, p.description, c.quantity, c.added_at
       FROM carts c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.added_at DESC`,
      [userId]
    );
    res.json({ items: cartItems });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add item to cart
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity, price } = req.body;

    if (!product_id || !quantity || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert or update cart item
    await db.query(
      `INSERT INTO carts (user_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [userId, product_id, quantity, price, quantity]
    );

    res.json({ success: true, message: "Item added to cart" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// Update cart item quantity
router.put("/:productId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Delete if quantity is 0 or negative
      await db.query("DELETE FROM carts WHERE user_id = ? AND product_id = ?", [
        userId,
        productId,
      ]);
    } else {
      await db.query(
        "UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?",
        [quantity, userId, productId]
      );
    }

    res.json({ success: true, message: "Cart updated" });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove item from cart
router.delete("/:productId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await db.query("DELETE FROM carts WHERE user_id = ? AND product_id = ?", [
      userId,
      productId,
    ]);

    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    console.error("Delete cart item error:", err);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

// Clear entire cart
router.delete("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query("DELETE FROM carts WHERE user_id = ?", [userId]);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

module.exports = router;
