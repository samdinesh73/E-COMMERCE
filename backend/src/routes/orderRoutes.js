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
        console.log(`💾 Saving ${items.length} items for order ${orderId}...`);
        for (const item of items) {
          const product_id = item.product_id || item.id;
          const product_name = item.name || item.product_name || "Unknown Product";
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const variations = item.selectedVariations || {};
          
          console.log(`  📦 Item: ID=${product_id}, Name=${product_name}, Qty=${quantity}, Price=${price}`);
          console.log(`     Variations:`, JSON.stringify(variations));
          
          try {
            await db.execute(
              "INSERT INTO order_items (order_id, product_id, product_name, quantity, price, variations) VALUES (?, ?, ?, ?, ?, ?)",
              [orderId, product_id, product_name, quantity, price, JSON.stringify(variations)]
            );
            console.log(`    ✅ Item saved successfully with variations`);
          } catch (itemErr) {
            console.error(`    ❌ Error saving item:`, itemErr);
            throw itemErr;
          }
        }
        console.log(`✅ All items saved for order ${orderId}`);
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
        console.log(`💾 Saving ${items.length} items for guest order ${orderId}...`);
        for (const item of items) {
          const product_id = item.product_id || item.id;
          const product_name = item.name || item.product_name || "Unknown Product";
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const variations = item.selectedVariations || {};
          
          console.log(`  📦 Item: ID=${product_id}, Name=${product_name}, Qty=${quantity}, Price=${price}`);
          console.log(`     Variations:`, JSON.stringify(variations));
          
          try {
            await db.execute(
              "INSERT INTO guest_order_items (order_id, product_id, product_name, quantity, price, variations) VALUES (?, ?, ?, ?, ?, ?)",
              [orderId, product_id, product_name, quantity, price, JSON.stringify(variations)]
            );
            console.log(`    ✅ Item saved successfully with variations`);
          } catch (itemErr) {
            console.error(`    ❌ Error saving item:`, itemErr);
            throw itemErr;
          }
        }
        console.log(`✅ All items saved for guest order ${orderId}`);
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
    console.log(`📋 Fetching orders for user ${user_id}...`);
    
    // Fetch from login_orders table for authenticated users
    const [orders] = await db.execute(
      "SELECT * FROM login_orders WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    console.log(`✅ Found ${orders.length} orders for user ${user_id}`);

    // Fetch items with variations for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await db.execute(
        "SELECT id, product_id, product_name, quantity, price, variations FROM order_items WHERE order_id = ?",
        [order.id]
      );
      
      console.log(`  📦 Order #${order.id}: ${items.length} items`);
      
      // Parse variations JSON for each item
      const parsedItems = items.map(item => {
        try {
          return {
            ...item,
            selectedVariations: item.variations ? JSON.parse(item.variations) : {}
          };
        } catch (parseErr) {
          console.error(`    ⚠️ Error parsing variations for item ${item.id}:`, parseErr);
          return {
            ...item,
            selectedVariations: {}
          };
        }
      });

      return { ...order, items: parsedItems };
    }));

    console.log(`✅ Returning ${ordersWithItems.length} orders with items`);
    return res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error("❌ Get orders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
});

// ====== ALL ADMIN ROUTES MUST COME BEFORE /:id ======

// Diagnostic endpoint to check order data in database
router.get("/admin/check-order/:id", async (req, res) => {
  try {
    const order_id = req.params.id;
    console.log(`\n🔧 DIAGNOSTIC: Checking order ${order_id}...`);

    // Check table structure
    const [tableInfo] = await db.execute(
      "DESCRIBE order_items"
    );
    console.log(`📋 order_items columns:`, tableInfo.map(col => `${col.Field} (${col.Type})`));

    // Check if variations column exists
    const hasVariations = tableInfo.some(col => col.Field === 'variations');
    console.log(`✅ Has variations column:`, hasVariations);

    // Get raw data from database
    const [items] = await db.execute(
      "SELECT * FROM order_items WHERE order_id = ?",
      [order_id]
    );

    console.log(`📦 Found ${items.length} items for order ${order_id}`);
    
    const response = {
      order_id,
      items_count: items.length,
      table_has_variations_column: hasVariations,
      columns: tableInfo.map(col => col.Field),
      items: items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        variations_field_value: item.variations,
        variations_field_type: typeof item.variations,
        variations_is_null: item.variations === null
      }))
    };

    console.log(`🔧 Diagnostic response:`, JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error("Diagnostic error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ====== ALL ADMIN ROUTES MUST COME BEFORE /:id ======
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
    console.log(`\n📋 Fetching order detail for order_id: ${order_id}`);

    // Try login_orders first
    console.log(`🔍 Checking login_orders table...`);
    const [loginOrders] = await db.execute(
      "SELECT * FROM login_orders WHERE id = ?",
      [order_id]
    );
    console.log(`✅ login_orders result:`, loginOrders.length > 0 ? "Found" : "Not found");

    if (loginOrders && loginOrders.length > 0) {
      console.log(`✅ Order found in login_orders, fetching items...`);
      
      // Fetch order items with variations
      const [items] = await db.execute(
        "SELECT id, product_id, product_name, quantity, price, variations FROM order_items WHERE order_id = ?",
        [order_id]
      );
      
      console.log(`📦 Found ${items.length} items in order_items table`);
      if (items.length > 0) {
        console.log(`📦 Sample item:`, JSON.stringify(items[0]));
      }

      // Parse variations JSON
      const parsedItems = items.map(item => {
        try {
          let selectedVariations = {};
          
          if (item.variations) {
            console.log(`  📦 Raw variations for item ${item.id}:`, item.variations);
            try {
              // Check if variations is already an object (mysql2 auto-parsing) or a string
              if (typeof item.variations === 'object' && item.variations !== null) {
                selectedVariations = item.variations;
                console.log(`  ✅ Variations already object:`, selectedVariations);
              } else if (typeof item.variations === 'string') {
                selectedVariations = JSON.parse(item.variations);
                console.log(`  ✅ Parsed variations from string:`, selectedVariations);
              }
            } catch (parseErr) {
              console.error(`  ❌ Parse error:`, parseErr.message);
              console.log(`  Raw value was:`, item.variations);
            }
          }
          
          return {
            ...item,
            selectedVariations
          };
        } catch (mapErr) {
          console.error(`⚠️ Error processing item ${item.id}:`, mapErr);
          return {
            ...item,
            selectedVariations: {}
          };
        }
      });

      console.log(`✅ Returning order with ${parsedItems.length} items from login_orders`);
      return res.json({ order: loginOrders[0], items: parsedItems, table: "login_orders" });
    }

    // Try orders table
    console.log(`🔍 Checking orders table...`);
    const [guestOrders] = await db.execute(
      "SELECT * FROM orders WHERE id = ?",
      [order_id]
    );
    console.log(`✅ orders result:`, guestOrders.length > 0 ? "Found" : "Not found");

    if (guestOrders && guestOrders.length > 0) {
      console.log(`✅ Order found in orders, fetching items...`);
      
      // Fetch order items from guest_order_items with variations
      const [items] = await db.execute(
        "SELECT id, product_id, product_name, quantity, price, variations FROM guest_order_items WHERE order_id = ?",
        [order_id]
      );

      console.log(`📦 Found ${items.length} items in guest_order_items table`);
      if (items.length > 0) {
        console.log(`📦 Sample item:`, JSON.stringify(items[0]));
      }

      // Parse variations JSON
      const parsedItems = items.map(item => {
        try {
          let selectedVariations = {};
          
          if (item.variations) {
            console.log(`  📦 Raw variations for item ${item.id}:`, item.variations);
            try {
              // Check if variations is already an object (mysql2 auto-parsing) or a string
              if (typeof item.variations === 'object' && item.variations !== null) {
                selectedVariations = item.variations;
                console.log(`  ✅ Variations already object:`, selectedVariations);
              } else if (typeof item.variations === 'string') {
                selectedVariations = JSON.parse(item.variations);
                console.log(`  ✅ Parsed variations from string:`, selectedVariations);
              }
            } catch (parseErr) {
              console.error(`  ❌ Parse error:`, parseErr.message);
              console.log(`  Raw value was:`, item.variations);
            }
          }
          
          return {
            ...item,
            selectedVariations
          };
        } catch (mapErr) {
          console.error(`⚠️ Error processing item ${item.id}:`, mapErr);
          return {
            ...item,
            selectedVariations: {}
          };
        }
      });

      console.log(`✅ Returning order with ${parsedItems.length} items from orders`);
      return res.json({ order: guestOrders[0], items: parsedItems, table: "orders" });
    }

    console.log(`❌ Order ${order_id} not found in either table`);
    return res.status(404).json({ error: "Order not found" });
  } catch (err) {
    console.error("❌ Get order detail error:", err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ error: "Failed to fetch order details", details: err.message });
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

// ====== USER ROUTE MUST COME LAST AFTER ALL /admin/* ROUTES ======

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

    // Fetch order items with variations
    const [items] = await db.execute(
      "SELECT id, product_id, product_name, quantity, price, variations FROM order_items WHERE order_id = ?",
      [order_id]
    );

    // Parse variations JSON for each item
    const parsedItems = items.map(item => {
      try {
        let selectedVariations = {};
        
        if (item.variations) {
          selectedVariations = JSON.parse(item.variations);
        }
        
        return {
          ...item,
          selectedVariations
        };
      } catch (parseErr) {
        console.error(`⚠️ Error parsing variations for item ${item.id}:`, parseErr);
        return {
          ...item,
          selectedVariations: {}
        };
      }
    });

    const order = { ...orders[0], items: parsedItems };

    return res.json({ order });
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

module.exports = router;
