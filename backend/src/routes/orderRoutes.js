const express = require("express");
const db = require("../config/database");
const { verifyToken } = require("./authRoutes");
const { sendOrderConfirmationEmail, sendAdminNewOrderEmail } = require("../utils/emailService");

const router = express.Router();

// Middleware to verify token (optional for guest checkout)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const JWT_SECRET = process.env.JWT_SECRET || (() => {
        console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables!");
        return "your-secret-key-change-in-prod";
      })();
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token invalid, continue as guest
    }
  }
  next();
};

// Create order (supports both authenticated and guest checkout)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { total_price, shipping_address, city, pincode, payment_method, guest_name, guest_email, full_name, email, phone, items } = req.body;
    const user_id = req.user?.id || null;

    if (!total_price || !shipping_address || !payment_method) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // For authenticated users, use login_orders table; for guests, use orders table
    if (user_id) {
      // Authenticated user - save to login_orders
      const [result] = await db.execute(
        "INSERT INTO login_orders (user_id, email, phone, full_name, total_price, shipping_address, city, pincode, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [user_id, email || null, phone || null, full_name || null, total_price, shipping_address, city, pincode, payment_method, "pending"]
      );
      
      const orderId = result.insertId;

      // Save order items
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await db.execute(
            "INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
            [orderId, item.id || null, item.name, item.quantity, item.price]
          );
        }
      }

      // Send confirmation emails
      const orderData = {
        orderId,
        customerName: full_name,
        customerEmail: email,
        totalPrice: total_price,
        items: items || [],
        shippingAddress: shipping_address,
        city,
        pincode,
        paymentMethod: payment_method,
        phone,
      };

      // Send to customer
      sendOrderConfirmationEmail(orderData).catch(err => console.error("Failed to send customer email:", err));

      // Send to admin
      sendAdminNewOrderEmail(orderData).catch(err => console.error("Failed to send admin email:", err));

      return res.status(201).json({
        id: orderId,
        user_id,
        email,
        phone,
        full_name,
        total_price,
        shipping_address,
        payment_method,
        status: "pending",
        created_at: new Date().toISOString(),
        table: "login_orders"
      });
    } else {
      // Guest user - save to orders
      const [result] = await db.execute(
        "INSERT INTO orders (user_id, total_price, shipping_address, city, pincode, payment_method, guest_name, guest_email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [user_id, total_price, shipping_address, city, pincode, payment_method, guest_name || null, guest_email || null, phone || null, "pending"]
      );

      const orderId = result.insertId;

      // Save order items for guest order
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await db.execute(
            "INSERT INTO guest_order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
            [orderId, item.id || null, item.name, item.quantity, item.price]
          );
        }
      }

      // Send confirmation emails
      const orderData = {
        orderId,
        customerName: guest_name,
        customerEmail: guest_email,
        totalPrice: total_price,
        items: items || [],
        shippingAddress: shipping_address,
        city,
        pincode,
        paymentMethod: payment_method,
        phone,
      };

      // Send to customer
      sendOrderConfirmationEmail(orderData).catch(err => console.error("Failed to send customer email:", err));

      // Send to admin
      sendAdminNewOrderEmail(orderData).catch(err => console.error("Failed to send admin email:", err));

      return res.status(201).json({
        id: orderId,
        user_id,
        total_price,
        shipping_address,
        payment_method,
        status: "pending",
        created_at: new Date().toISOString(),
        table: "orders"
      });
    }
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// Get user's orders (authenticated only)
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    // Fetch from login_orders table for authenticated users
    const [orders] = await db.execute(
      "SELECT * FROM login_orders WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    return res.json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get all orders for admin (both login_orders and orders tables)
router.get("/admin/all-orders", async (req, res) => {
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

    // Fetch from both tables with date filter
    const [loginOrders] = await db.execute(
      `SELECT id, user_id, email, phone, full_name, total_price as total_amount, total_price as amount, shipping_address as address, city, pincode, payment_method, status, created_at FROM login_orders${dateFilter} ORDER BY created_at DESC`,
      params
    );

    const [guestOrders] = await db.execute(
      `SELECT id, user_id, guest_email as email, phone, guest_name as full_name, total_price as total_amount, total_price as amount, shipping_address as address, city, pincode, payment_method, status, created_at FROM orders${dateFilter} ORDER BY created_at DESC`,
      params
    );

    // Combine and sort by date
    const allOrders = [...loginOrders, ...guestOrders].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    return res.json(allOrders);
  } catch (err) {
    console.error("Get all orders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order by ID (authenticated only)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order_id = req.params.id;
    const user_id = req.user.id;

    // Try login_orders first, then orders
    const [orders] = await db.execute(
      "SELECT * FROM login_orders WHERE id = ? AND user_id = ?",
      [order_id, user_id]
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.json({ order: orders[0] });
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Get login orders for admin
router.get("/admin/login-orders", async (req, res) => {
  try {
    const [loginOrders] = await db.execute(
      "SELECT * FROM login_orders ORDER BY created_at DESC"
    );
    return res.json(loginOrders);
  } catch (err) {
    console.error("Get login orders error:", err);
    return res.status(500).json({ error: "Failed to fetch login orders" });
  }
});

// Get guest orders for admin
router.get("/admin/guest-orders", async (req, res) => {
  try {
    const [guestOrders] = await db.execute(
      "SELECT * FROM orders WHERE user_id IS NULL ORDER BY created_at DESC"
    );
    return res.json(guestOrders);
  } catch (err) {
    console.error("Get guest orders error:", err);
    return res.status(500).json({ error: "Failed to fetch guest orders" });
  }
});

// Get single order details for admin (from either table)
router.get("/admin/order-detail/:id", async (req, res) => {
  try {
    const order_id = req.params.id;

    // Try login_orders first
    const [loginOrders] = await db.execute(
      "SELECT * FROM login_orders WHERE id = ?",
      [order_id]
    );

    if (loginOrders && loginOrders.length > 0) {
      // Fetch order items
      const [items] = await db.execute(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order_id]
      );

      return res.json({ order: loginOrders[0], items: items || [], table: "login_orders" });
    }

    // Try orders table
    const [guestOrders] = await db.execute(
      "SELECT * FROM orders WHERE id = ?",
      [order_id]
    );

    if (guestOrders && guestOrders.length > 0) {
      // Fetch order items from guest_order_items
      const [items] = await db.execute(
        "SELECT * FROM guest_order_items WHERE order_id = ?",
        [order_id]
      );

      return res.json({ order: guestOrders[0], items: items || [], table: "orders" });
    }

    return res.status(404).json({ error: "Order not found" });
  } catch (err) {
    console.error("Get order detail error:", err);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Update order status for admin
router.put("/admin/order/:id", async (req, res) => {
  try {
    const order_id = req.params.id;
    const { status, payment_method, shipping_address, city, pincode, email, phone, full_name } = req.body;

    // Try to update in login_orders first
    let [result] = await db.execute(
      "UPDATE login_orders SET status = ?, payment_method = ?, shipping_address = ?, city = ?, pincode = ?, email = ?, phone = ?, full_name = ? WHERE id = ?",
      [status || null, payment_method || null, shipping_address || null, city || null, pincode || null, email || null, phone || null, full_name || null, order_id]
    );

    if (result.affectedRows > 0) {
      return res.json({ message: "Order updated successfully", table: "login_orders" });
    }

    // Try to update in orders table
    [result] = await db.execute(
      "UPDATE orders SET status = ?, payment_method = ?, shipping_address = ?, city = ?, pincode = ? WHERE id = ?",
      [status || null, payment_method || null, shipping_address || null, city || null, pincode || null, order_id]
    );

    if (result.affectedRows > 0) {
      return res.json({ message: "Order updated successfully", table: "orders" });
    }

    return res.status(404).json({ error: "Order not found" });
  } catch (err) {
    console.error("Update order error:", err);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

// Delete order for admin
router.delete("/admin/order/:id", async (req, res) => {
  try {
    const order_id = req.params.id;

    // Try to delete from login_orders first
    let [result] = await db.execute(
      "DELETE FROM login_orders WHERE id = ?",
      [order_id]
    );

    if (result.affectedRows > 0) {
      return res.json({ message: "Order deleted successfully", table: "login_orders" });
    }

    // Try to delete from orders table
    [result] = await db.execute(
      "DELETE FROM orders WHERE id = ?",
      [order_id]
    );

    if (result.affectedRows > 0) {
      return res.json({ message: "Order deleted successfully", table: "orders" });
    }

    return res.status(404).json({ error: "Order not found" });
  } catch (err) {
    console.error("Delete order error:", err);
    return res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
