const db = require("../config/database");

// Get all coupons (for admin - includes inactive)
exports.getAllCoupons = (req, res) => {
  const query = `
    SELECT id, code, description, discount_type, discount_value, 
           min_order_value, max_uses, current_uses, expires_at, is_active, created_at
    FROM coupons 
    ORDER BY created_at DESC
  `;

  db.query(query).then(([results]) => {
    res.json(results);
  }).catch((err) => {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  });
};

// Validate and apply coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({ error: "Code and order total are required" });
    }

    const query = `
      SELECT * FROM coupons 
      WHERE code = ? AND is_active = 1 
      AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const [results] = await db.query(query, [code.toUpperCase()]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Invalid or expired coupon code" });
    }

    const coupon = results[0];

    // Check if coupon has reached max uses
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({ error: "Coupon usage limit exceeded" });
    }

    // Check minimum order value
    if (orderTotal < coupon.min_order_value) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.min_order_value} required`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (orderTotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, orderTotal);

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        description: coupon.description,
      },
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalTotal: parseFloat((orderTotal - discountAmount).toFixed(2)),
    });
  } catch (err) {
    console.error("Error validating coupon:", err);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
};

// Apply coupon to order
exports.applyCouponToOrder = async (req, res) => {
  try {
    const { couponId, orderId, discountAmount } = req.body;
    const userId = req.user?.id;

    if (!couponId || !orderId || !discountAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Record coupon usage
    const usageQuery = `
      INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) 
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(usageQuery, [couponId, userId, orderId, discountAmount]);

    // Update coupon current uses
    const updateQuery = `
      UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?
    `;

    await db.query(updateQuery, [couponId]);

    res.json({
      success: true,
      message: "Coupon applied successfully",
      usageId: result.insertId,
    });
  } catch (err) {
    console.error("Error recording coupon usage:", err);
    res.status(500).json({ error: "Failed to apply coupon" });
  }
};

// Get coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM coupons WHERE id = ?`;

    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching coupon:", err);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
};

// Get coupon usage history (Admin)
exports.getCouponUsageHistory = async (req, res) => {
  try {
    const { couponId } = req.params;

    const query = `
      SELECT cu.*, c.code, u.email, u.name
      FROM coupon_usage cu
      JOIN coupons c ON cu.coupon_id = c.id
      LEFT JOIN users u ON cu.user_id = u.id
      WHERE c.id = ?
      ORDER BY cu.used_at DESC
    `;

    const [results] = await db.query(query, [couponId]);
    res.json(results);
  } catch (err) {
    console.error("Error fetching coupon usage:", err);
    res.status(500).json({ error: "Failed to fetch coupon usage" });
  }
};

// Create new coupon (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_uses,
      expires_at,
    } = req.body;

    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO coupons 
      (code, description, discount_type, discount_value, min_order_value, max_uses, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(query, [
      code.toUpperCase(),
      description,
      discount_type,
      discount_value,
      min_order_value || 0,
      max_uses || null,
      expires_at || null,
    ]);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      couponId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating coupon:", err);
    res.status(500).json({ error: "Failed to create coupon", details: err.message });
  }
};

// Update coupon (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const reqBody = req.body;

    console.log("Update request - ID:", id, "Body:", reqBody);

    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];

    // Handle each field carefully
    if ("description" in reqBody) {
      updates.push("description = ?");
      values.push(reqBody.description || "");
    }
    if ("discount_type" in reqBody && reqBody.discount_type !== null) {
      updates.push("discount_type = ?");
      values.push(reqBody.discount_type);
    }
    if ("discount_value" in reqBody && reqBody.discount_value !== null && reqBody.discount_value !== "") {
      updates.push("discount_value = ?");
      values.push(parseFloat(reqBody.discount_value));
    }
    if ("min_order_value" in reqBody && reqBody.min_order_value !== null && reqBody.min_order_value !== "") {
      updates.push("min_order_value = ?");
      values.push(parseFloat(reqBody.min_order_value));
    }
    if ("max_uses" in reqBody) {
      updates.push("max_uses = ?");
      // Handle null for unlimited uses
      values.push(reqBody.max_uses && reqBody.max_uses !== "" ? parseInt(reqBody.max_uses) : null);
    }
    if ("is_active" in reqBody) {
      updates.push("is_active = ?");
      // Convert to 0 or 1, handle any falsy value
      const isActive = reqBody.is_active ? 1 : 0;
      values.push(isActive);
    }
    if ("expires_at" in reqBody) {
      updates.push("expires_at = ?");
      // Handle empty string or null for no expiry
      values.push(reqBody.expires_at && reqBody.expires_at.trim() ? reqBody.expires_at : null);
    }

    console.log("Updates to apply:", updates, "Values:", values);

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    const query = `UPDATE coupons SET ${updates.join(", ")} WHERE id = ?`;
    
    console.log("Executing query:", query, "with values:", values);

    const [result] = await db.query(query, values);

    console.log("Update result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Fetch and return updated coupon
    const [updatedCoupon] = await db.query("SELECT * FROM coupons WHERE id = ?", [id]);
    
    res.json({ 
      success: true, 
      message: "Coupon updated successfully",
      coupon: updatedCoupon[0]
    });
  } catch (err) {
    console.error("Error updating coupon:", err);
    res.status(500).json({ error: "Failed to update coupon", details: err.message });
  }
};

// Delete coupon (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM coupons WHERE id = ?`;

    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    console.error("Error deleting coupon:", err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};
