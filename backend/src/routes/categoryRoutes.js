const express = require("express");
const router = express.Router();
const db = require("../config/database");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

// Middleware to verify JWT token (for admin operations)
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-in-prod");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Get all categories (public)
router.get("/", async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT c.id, c.name, c.description, c.image, c.slug, 
              COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id, c.name, c.description, c.image, c.slug
       ORDER BY c.name`
    );
    res.json({ categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get single category with products (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get category
    const [categories] = await db.query(
      "SELECT id, name, description, image, slug FROM categories WHERE id = ?",
      [id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Get products in this category
    const [products] = await db.query(
      "SELECT id, name, price, image, description, category_id FROM products WHERE category_id = ? ORDER BY name",
      [id]
    );
    
    res.json({
      category: categories[0],
      products
    });
  } catch (err) {
    console.error("Get category error:", err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// Create category (admin only)
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { name, description, slug } = req.body;
    let imagePath = null;

    if (!name) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return res.status(400).json({ error: "Category name is required" });
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    // Store filename if image was uploaded
    if (req.file) {
      imagePath = req.file.filename;
    }

    const [result] = await db.query(
      "INSERT INTO categories (name, description, image, slug) VALUES (?, ?, ?, ?)",
      [name, description || null, imagePath || null, categorySlug]
    );

    res.status(201).json({
      success: true,
      message: "Category created",
      category: {
        id: result.insertId,
        name,
        description,
        image: imagePath,
        slug: categorySlug
      }
    });
  } catch (err) {
    console.error("Create category error:", err);
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        if (error) console.error("Error deleting file:", error);
      });
    }
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Category already exists" });
    }
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Update category (admin only)
router.put("/:id", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug } = req.body;

    // Check if category exists
    const [categories] = await db.query("SELECT id, image FROM categories WHERE id = ?", [id]);
    if (categories.length === 0) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return res.status(404).json({ error: "Category not found" });
    }

    const categorySlug = slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : null);
    let imagePath = categories[0].image; // Keep existing image by default

    // If new image is uploaded, delete old one and use new one
    if (req.file) {
      if (categories[0].image) {
        const oldImagePath = path.join(__dirname, "../../public/uploads", categories[0].image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      imagePath = req.file.filename;
    }

    await db.query(
      "UPDATE categories SET name = ?, description = ?, image = ?, slug = ? WHERE id = ?",
      [name || null, description || null, imagePath, categorySlug, id]
    );

    res.json({
      success: true,
      message: "Category updated"
    });
  } catch (err) {
    console.error("Update category error:", err);
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        if (error) console.error("Error deleting file:", error);
      });
    }
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Category name or slug already exists" });
    }
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Delete category (admin only)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [categories] = await db.query("SELECT id, image FROM categories WHERE id = ?", [id]);
    if (categories.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete the image file if exists
    if (categories[0].image) {
      const imagePath = path.join(__dirname, "../../public/uploads", categories[0].image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image file:", err);
      });
    }

    // Set category_id to NULL for products in this category
    await db.query("UPDATE products SET category_id = NULL WHERE category_id = ?", [id]);

    // Delete category
    await db.query("DELETE FROM categories WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Category deleted"
    });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Get products by category (public)
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Get category by slug
    const [categories] = await db.query(
      "SELECT id, name, description, image, slug FROM categories WHERE slug = ?",
      [slug]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    const category = categories[0];
    
    // Get products in this category
    const [products] = await db.query(
      "SELECT id, name, price, image, description, category_id FROM products WHERE category_id = ? ORDER BY name",
      [category.id]
    );
    
    res.json({
      category,
      products
    });
  } catch (err) {
    console.error("Get category by slug error:", err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

module.exports = router;
