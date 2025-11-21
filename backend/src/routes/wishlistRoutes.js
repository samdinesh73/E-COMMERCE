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

// Get user's wishlist
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [wishlistItems] = await db.query(
      `SELECT w.id, p.id as product_id, p.name, p.price, p.image, p.description, w.added_at
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.added_at DESC`,
      [userId]
    );
    res.json({ items: wishlistItems });
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// Add item to wishlist
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Insert wishlist item (will ignore if already exists due to UNIQUE constraint)
    await db.query(
      `INSERT IGNORE INTO wishlists (user_id, product_id)
       VALUES (?, ?)`,
      [userId, product_id]
    );

    res.json({ success: true, message: "Item added to wishlist" });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ error: "Failed to add item to wishlist" });
  }
});

// Remove item from wishlist
router.delete("/:productId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await db.query("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?", [
      userId,
      productId,
    ]);

    res.json({ success: true, message: "Item removed from wishlist" });
  } catch (err) {
    console.error("Delete wishlist item error:", err);
    res.status(500).json({ error: "Failed to remove item from wishlist" });
  }
});

// Check if product is in wishlist
router.get("/:productId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const [result] = await db.query(
      "SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    res.json({ inWishlist: result.length > 0 });
  } catch (err) {
    console.error("Check wishlist error:", err);
    res.status(500).json({ error: "Failed to check wishlist" });
  }
});

module.exports = router;
