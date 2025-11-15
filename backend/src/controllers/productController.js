const db = require("../config/database");

// Get all products
exports.getAllProducts = (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

// Get product by ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM products WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(results[0]);
  });
};

// Create product (with optional file upload)
exports.createProduct = (req, res) => {
  const { name, price, description } = req.body;
  let image = req.body.image || "default.png";

  // If a file was uploaded, use the uploaded filename
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  // Validation
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  const query = "INSERT INTO products (name, price, image, description) VALUES (?, ?, ?, ?)";
  db.query(query, [name, Number(price), image, description || ""], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ id: results.insertId, name, price: Number(price), image, description });
  });
};

// Update product by ID (with optional file upload)
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  let image = req.body.image;

  // If a file was uploaded, use the uploaded filename
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  // Validation
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  const query = "UPDATE products SET name = ?, price = ?, image = ?, description = ? WHERE id = ?";
  db.query(query, [name, Number(price), image, description || "", id], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ id: Number(id), name, price: Number(price), image, description });
  });
};

// Delete product by ID
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ success: true, id: Number(id) });
  });
};
