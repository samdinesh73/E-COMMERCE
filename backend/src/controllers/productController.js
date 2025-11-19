const db = require("../config/database");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT p.id, p.name, p.price, p.image, p.description, p.category_id, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id`
    );
    res.json(results);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.execute(
      `SELECT p.id, p.name, p.price, p.image, p.description, p.category_id, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Create product (with optional file upload)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category_id } = req.body;
    let image = req.body.image || "default.png";

    // If a file was uploaded, use the uploaded filename
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Validation
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const [result] = await db.execute(
      "INSERT INTO products (name, price, image, description, category_id) VALUES (?, ?, ?, ?, ?)",
      [name, Number(price), image, description || "", category_id || null]
    );
    
    res.status(201).json({ id: result.insertId, name, price: Number(price), image, description, category_id });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Update product by ID (with optional file upload)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category_id } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    // If a file was uploaded, update with new image; otherwise keep existing image
    if (req.file) {
      const image = `/uploads/${req.file.filename}`;
      const [result] = await db.execute(
        "UPDATE products SET name = ?, price = ?, image = ?, description = ?, category_id = ? WHERE id = ?",
        [name, Number(price), image, description || "", category_id || null, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json({ id: Number(id), name, price: Number(price), image, description, category_id });
    } else {
      // Update without changing image
      const [result] = await db.execute(
        "UPDATE products SET name = ?, price = ?, description = ?, category_id = ? WHERE id = ?",
        [name, Number(price), description || "", category_id || null, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Fetch updated product to return current image
      const [product] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
      res.json(product[0]);
    }
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};
