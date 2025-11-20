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
    
    // Fetch additional images for this product
    const [images] = await db.execute(
      `SELECT id, image_path, angle_description, display_order, is_primary 
       FROM product_images 
       WHERE product_id = ? 
       ORDER BY display_order ASC, created_at ASC`,
      [id]
    );
    
    const product = results[0];
    product.additional_images = images || [];
    res.json(product);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Create product (with optional file upload and multiple images)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category_id } = req.body;
    let image = req.body.image || "default.png";

    // If a file was uploaded, use the uploaded filename
    if (req.files && req.files.image && req.files.image[0]) {
      image = `/uploads/${req.files.image[0].filename}`;
    }

    // Validation
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const [result] = await db.execute(
      "INSERT INTO products (name, price, image, description, category_id) VALUES (?, ?, ?, ?, ?)",
      [name, Number(price), image, description || "", category_id || null]
    );
    
    const productId = result.insertId;
    
    // Handle multiple additional images if provided
    if (req.files && req.files.additional_images && Array.isArray(req.files.additional_images)) {
      const additionalImages = req.files.additional_images;
      
      for (let i = 0; i < additionalImages.length; i++) {
        const file = additionalImages[i];
        const angleDescription = req.body[`angle_${i}`] || `Image ${i + 1}`;
        
        await db.execute(
          "INSERT INTO product_images (product_id, image_path, angle_description, display_order, is_primary) VALUES (?, ?, ?, ?, ?)",
          [productId, `/uploads/${file.filename}`, angleDescription, i, i === 0]
        );
      }
    }
    
    res.status(201).json({ 
      id: productId, 
      name, 
      price: Number(price), 
      image, 
      description, 
      category_id,
      message: "Product and images uploaded successfully!"
    });
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
};

// Delete product by ID
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

// ========== PRODUCT IMAGES CRUD OPERATIONS ==========

// Get all images for a product
exports.getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Verify product exists
    const [product] = await db.execute("SELECT id FROM products WHERE id = ?", [productId]);
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const [images] = await db.execute(
      `SELECT id, product_id, image_path, angle_description, display_order, is_primary, created_at 
       FROM product_images 
       WHERE product_id = ? 
       ORDER BY display_order ASC`,
      [productId]
    );
    
    res.json({ product_id: productId, images: images || [] });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Add a single image to product
exports.addProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { angle_description, display_order } = req.body;
    
    // Verify product exists
    const [product] = await db.execute("SELECT id FROM products WHERE id = ?", [productId]);
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Check if file was uploaded (using req.files for upload.fields)
    if (!req.files || !req.files.image || !req.files.image[0]) {
      return res.status(400).json({ error: "Image file is required" });
    }
    
    const imagePath = `/uploads/${req.files.image[0].filename}`;
    const order = display_order || 0;
    
    const [result] = await db.execute(
      "INSERT INTO product_images (product_id, image_path, angle_description, display_order, is_primary) VALUES (?, ?, ?, ?, ?)",
      [productId, imagePath, angle_description || "Product Image", order, false]
    );
    
    res.status(201).json({
      id: result.insertId,
      product_id: productId,
      image_path: imagePath,
      angle_description: angle_description || "Product Image",
      display_order: order,
      is_primary: false,
      message: "Image added successfully"
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Update image details (angle description, display order)
exports.updateProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const { angle_description, display_order } = req.body;
    
    // Verify image exists and belongs to product
    const [image] = await db.execute(
      "SELECT id FROM product_images WHERE id = ? AND product_id = ?",
      [imageId, productId]
    );
    
    if (image.length === 0) {
      return res.status(404).json({ error: "Image not found for this product" });
    }
    
    // Update image
    const [result] = await db.execute(
      "UPDATE product_images SET angle_description = ?, display_order = ? WHERE id = ?",
      [angle_description || "Product Image", display_order || 0, imageId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Failed to update image" });
    }
    
    res.json({
      id: imageId,
      product_id: productId,
      angle_description: angle_description || "Product Image",
      display_order: display_order || 0,
      message: "Image updated successfully"
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete image from product
exports.deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    
    // Verify image exists and belongs to product
    const [image] = await db.execute(
      "SELECT id FROM product_images WHERE id = ? AND product_id = ?",
      [imageId, productId]
    );
    
    if (image.length === 0) {
      return res.status(404).json({ error: "Image not found for this product" });
    }
    
    // Delete image
    const [result] = await db.execute(
      "DELETE FROM product_images WHERE id = ?",
      [imageId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Failed to delete image" });
    }
    
    res.json({
      success: true,
      id: imageId,
      product_id: productId,
      message: "Image deleted successfully"
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Replace/update image file
exports.replaceProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const { angle_description } = req.body;
    
    // Verify image exists and belongs to product
    const [image] = await db.execute(
      "SELECT id FROM product_images WHERE id = ? AND product_id = ?",
      [imageId, productId]
    );
    
    if (image.length === 0) {
      return res.status(404).json({ error: "Image not found for this product" });
    }
    
    // Check if file was uploaded (using req.files for upload.fields)
    if (!req.files || !req.files.image || !req.files.image[0]) {
      return res.status(400).json({ error: "Image file is required" });
    }
    
    const imagePath = `/uploads/${req.files.image[0].filename}`;
    
    const [result] = await db.execute(
      "UPDATE product_images SET image_path = ?, angle_description = ? WHERE id = ?",
      [imagePath, angle_description || "Product Image", imageId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Failed to replace image" });
    }
    
    res.json({
      id: imageId,
      product_id: productId,
      image_path: imagePath,
      angle_description: angle_description || "Product Image",
      message: "Image replaced successfully"
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};
