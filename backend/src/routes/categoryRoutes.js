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

// Get all categories (public)
router.get("/", async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT c.id, c.name, c.description, c.image, c.slug, c.parent_id,
              COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id, c.name, c.description, c.image, c.slug, c.parent_id
       ORDER BY c.parent_id, c.name`
    );
    res.json({ categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get products by category slug (public)
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [categories] = await db.query(
      "SELECT id, name, description, image, slug, parent_id FROM categories WHERE slug = ?",
      [slug]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    const category = categories[0];
    
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

// Get single category with products by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [categories] = await db.query(
      "SELECT id, name, description, image, slug, parent_id FROM categories WHERE id = ?",
      [id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    
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

// Helper function to check for circular parent relationships
const hasCircularParent = async (categoryId, parentId) => {
  if (!parentId || parentId === "" || parentId === null) return false;
  if (parseInt(categoryId) === parseInt(parentId)) return true;

  let currentParentId = parseInt(parentId);
  const visitedIds = new Set();

  while (currentParentId) {
    if (visitedIds.has(currentParentId)) return true;
    visitedIds.add(currentParentId);

    const [parent] = await db.query(
      "SELECT parent_id FROM categories WHERE id = ?",
      [currentParentId]
    );

    if (parent.length === 0) break;
    currentParentId = parent[0].parent_id;
  }

  return false;
};

// Create category (admin only)
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  try {
    console.log("\n========== CREATE CATEGORY ==========");
    console.log("[1] req.body RECEIVED:", req.body);
    console.log("[1] req.body keys:", Object.keys(req.body));
    
    let { name, description, slug, parent_id } = req.body;
    
    console.log("[2] Extracted fields:");
    console.log("    name:", name, "| type:", typeof name);
    console.log("    description:", description, "| type:", typeof description);
    console.log("    slug:", slug, "| type:", typeof slug);
    console.log("    parent_id:", parent_id, "| type:", typeof parent_id);
    
    if (!name || name.trim() === "") {
      if (req.file) fs.unlink(req.file.path, (err) => {});
      return res.status(400).json({ error: "Category name is required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = req.file.filename;
      console.log("[3] Image uploaded:", imagePath);
    }

    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-');
    console.log("[4] Category slug:", categorySlug);

    // Handle parent_id - convert to number or null
    let parentIdValue = null;
    if (parent_id && parent_id !== "" && parent_id !== "null") {
      parentIdValue = parseInt(parent_id, 10);
      console.log("[5] Parent ID conversion: original:", parent_id, "-> converted:", parentIdValue);
      
      // Validate parent exists
      const [parentCheck] = await db.query(
        "SELECT id FROM categories WHERE id = ?",
        [parentIdValue]
      );
      
      if (parentCheck.length === 0) {
        if (req.file) fs.unlink(req.file.path, (err) => {});
        console.error("[5] Parent category not found:", parentIdValue);
        return res.status(400).json({ error: "Parent category not found" });
      }
      console.log("[5] Parent category exists: ID", parentIdValue);
    } else {
      console.log("[5] No parent_id provided, setting to NULL");
    }

    console.log("[6] Inserting into database:");
    console.log("    Values: [name:", name, ", description:", description, ", image:", imagePath, ", slug:", categorySlug, ", parent_id:", parentIdValue, "]");
    
    const [result] = await db.query(
      "INSERT INTO categories (name, description, image, slug, parent_id) VALUES (?, ?, ?, ?, ?)",
      [name, description || null, imagePath || null, categorySlug, parentIdValue]
    );

    console.log("[7] Category inserted successfully!");
    console.log("    ID:", result.insertId);
    console.log("    parent_id:", parentIdValue);
    console.log("=====================================\n");

    res.status(201).json({
      success: true,
      message: "Category created",
      category: {
        id: result.insertId,
        name,
        description: description || null,
        image: imagePath,
        slug: categorySlug,
        parent_id: parentIdValue
      }
    });
  } catch (err) {
    console.error("[ERROR] Create category error:", err);
    if (req.file) {
      fs.unlink(req.file.path, (error) => {});
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
    console.log("\n========== UPDATE CATEGORY ==========");
    console.log("[1] req.body RECEIVED:", req.body);
    console.log("[1] Category ID:", req.params.id);
    
    const { id } = req.params;
    let { name, description, slug, parent_id } = req.body;

    const [categories] = await db.query(
      "SELECT id, image FROM categories WHERE id = ?",
      [id]
    );
    
    if (categories.length === 0) {
      if (req.file) fs.unlink(req.file.path, (err) => {});
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("[2] Extracted fields:");
    console.log("    parent_id:", parent_id, "| type:", typeof parent_id);

    // Handle parent_id
    let parentIdValue = null;
    if (parent_id && parent_id !== "" && parent_id !== "null") {
      parentIdValue = parseInt(parent_id, 10);
      console.log("[3] Parent ID conversion: original:", parent_id, "-> converted:", parentIdValue);
      
      if (parentIdValue === parseInt(id, 10)) {
        if (req.file) fs.unlink(req.file.path, (err) => {});
        return res.status(400).json({ error: "A category cannot be its own parent" });
      }

      const [parentCheck] = await db.query(
        "SELECT id FROM categories WHERE id = ?",
        [parentIdValue]
      );
      
      if (parentCheck.length === 0) {
        if (req.file) fs.unlink(req.file.path, (err) => {});
        return res.status(400).json({ error: "Parent category not found" });
      }

      const isCircular = await hasCircularParent(id, parentIdValue);
      if (isCircular) {
        if (req.file) fs.unlink(req.file.path, (err) => {});
        return res.status(400).json({ error: "Cannot set parent: would create circular relationship" });
      }
    } else {
      console.log("[3] No parent_id provided, setting to NULL");
    }

    const categorySlug = slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : null);
    let imagePath = categories[0].image;

    if (req.file) {
      if (categories[0].image) {
        const oldImagePath = path.join(__dirname, "../../public/uploads", categories[0].image);
        fs.unlink(oldImagePath, (err) => {});
      }
      imagePath = req.file.filename;
    }

    console.log("[4] Updating with parent_id:", parentIdValue);
    await db.query(
      "UPDATE categories SET name = ?, description = ?, image = ?, slug = ?, parent_id = ? WHERE id = ?",
      [name || null, description || null, imagePath, categorySlug, parentIdValue, id]
    );

    console.log("[5] Category updated successfully!");
    console.log("=====================================\n");

    res.json({
      success: true,
      message: "Category updated"
    });
  } catch (err) {
    console.error("[ERROR] Update category error:", err);
    if (req.file) {
      fs.unlink(req.file.path, (error) => {});
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

    const [categories] = await db.query(
      "SELECT id, image FROM categories WHERE id = ?",
      [id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (categories[0].image) {
      const imagePath = path.join(__dirname, "../../public/uploads", categories[0].image);
      fs.unlink(imagePath, (err) => {});
    }

    await db.query("UPDATE products SET category_id = NULL WHERE category_id = ?", [id]);
    await db.query("UPDATE categories SET parent_id = NULL WHERE parent_id = ?", [id]);
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

module.exports = router;
