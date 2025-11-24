const db = require("../config/database");
const path = require("path");
const fs = require("fs");

// Get all variations for a product
exports.getProductVariations = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get variations
    const [variations] = await db.query(
      `SELECT id, product_id, variation_type, variation_value, price_adjustment, stock_quantity 
       FROM product_variations 
       WHERE product_id = ?
       ORDER BY variation_type, variation_value`,
      [productId]
    );

    // Get images for each variation
    for (let variation of variations) {
      const [images] = await db.query(
        `SELECT id, image_path FROM variation_images WHERE variation_id = ? ORDER BY image_order`,
        [variation.id]
      );
      variation.images = images;
    }

    res.json(variations);
  } catch (err) {
    console.error("Error fetching variations:", err);
    res.status(500).json({ error: "Failed to fetch variations" });
  }
};

// Create a new variation
exports.createVariation = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variation_type, variation_value, price_adjustment, stock_quantity } = req.body;

    // Validate product exists
    const [products] = await db.query("SELECT id FROM products WHERE id = ?", [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Insert variation
    const [result] = await db.query(
      `INSERT INTO product_variations (product_id, variation_type, variation_value, price_adjustment, stock_quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, variation_type || "Size", variation_value, price_adjustment || 0, stock_quantity || 100]
    );

    res.status(201).json({
      id: result.insertId,
      product_id: productId,
      variation_type: variation_type || "Size",
      variation_value,
      price_adjustment: price_adjustment || 0,
      stock_quantity: stock_quantity || 100,
      images: [],
    });
  } catch (err) {
    console.error("Error creating variation:", err);
    res.status(500).json({ error: "Failed to create variation" });
  }
};

// Add image to variation
exports.addVariationImage = async (req, res) => {
  try {
    const { productId, variationId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Verify variation exists
    const [variations] = await db.query(
      "SELECT id FROM product_variations WHERE id = ? AND product_id = ?",
      [variationId, productId]
    );
    if (variations.length === 0) {
      return res.status(404).json({ error: "Variation not found" });
    }

    const imagePath = `uploads/variations/${req.file.filename}`;

    // Get max order
    const [maxOrder] = await db.query(
      "SELECT MAX(image_order) as max_order FROM variation_images WHERE variation_id = ?",
      [variationId]
    );
    const order = (maxOrder[0].max_order || 0) + 1;

    // Insert image record
    const [result] = await db.query(
      `INSERT INTO variation_images (variation_id, image_path, image_order)
       VALUES (?, ?, ?)`,
      [variationId, imagePath, order]
    );

    res.status(201).json({
      id: result.insertId,
      variation_id: variationId,
      image_path: imagePath,
      image_order: order,
    });
  } catch (err) {
    console.error("Error adding variation image:", err);
    res.status(500).json({ error: "Failed to add image to variation" });
  }
};

// Update variation
exports.updateVariation = async (req, res) => {
  try {
    const { productId, variationId } = req.params;
    const { variation_value, price_adjustment, stock_quantity } = req.body;

    // Verify variation exists
    const [variations] = await db.query(
      "SELECT id FROM product_variations WHERE id = ? AND product_id = ?",
      [variationId, productId]
    );
    if (variations.length === 0) {
      return res.status(404).json({ error: "Variation not found" });
    }

    // Update variation
    await db.query(
      `UPDATE product_variations 
       SET variation_value = COALESCE(?, variation_value),
           price_adjustment = COALESCE(?, price_adjustment),
           stock_quantity = COALESCE(?, stock_quantity)
       WHERE id = ?`,
      [variation_value, price_adjustment, stock_quantity, variationId]
    );

    const [updated] = await db.query(
      "SELECT * FROM product_variations WHERE id = ?",
      [variationId]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error("Error updating variation:", err);
    res.status(500).json({ error: "Failed to update variation" });
  }
};

// Delete variation (cascades to images)
exports.deleteVariation = async (req, res) => {
  try {
    const { productId, variationId } = req.params;

    // Verify variation exists
    const [variations] = await db.query(
      "SELECT id FROM product_variations WHERE id = ? AND product_id = ?",
      [variationId, productId]
    );
    if (variations.length === 0) {
      return res.status(404).json({ error: "Variation not found" });
    }

    // Get images to delete from filesystem
    const [images] = await db.query(
      "SELECT image_path FROM variation_images WHERE variation_id = ?",
      [variationId]
    );

    // Delete images from filesystem
    for (let img of images) {
      const filePath = path.join(__dirname, "../../public", img.image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete variation (cascades to images in DB)
    await db.query("DELETE FROM product_variations WHERE id = ?", [variationId]);

    res.json({ success: true, message: "Variation deleted" });
  } catch (err) {
    console.error("Error deleting variation:", err);
    res.status(500).json({ error: "Failed to delete variation" });
  }
};

// Delete variation image
exports.deleteVariationImage = async (req, res) => {
  try {
    const { productId, variationId, imageId } = req.params;

    // Get image
    const [images] = await db.query(
      "SELECT vi.image_path FROM variation_images vi WHERE vi.id = ? AND vi.variation_id = ?",
      [imageId, variationId]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Delete from filesystem
    const filePath = path.join(__dirname, "../../public", images[0].image_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await db.query("DELETE FROM variation_images WHERE id = ?", [imageId]);

    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    console.error("Error deleting variation image:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
};
