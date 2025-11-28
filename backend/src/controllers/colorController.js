const db = require("../config/database");

// Get all colors
exports.getAllColors = async (req, res) => {
  try {
    const [colors] = await db.query(
      `SELECT id, name, hex_code FROM colors ORDER BY name`
    );
    res.json(colors);
  } catch (err) {
    console.error("Error fetching colors:", err);
    res.status(500).json({ error: "Failed to fetch colors" });
  }
};

// Get unique color variation values from product_variations
exports.getUniqueColorValues = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT variation_value FROM product_variations 
       WHERE variation_type = 'Color' 
       ORDER BY variation_value`
    );
    
    const values = rows.map(row => row.variation_value);
    res.json(values);
  } catch (err) {
    console.error("Error fetching unique color values:", err);
    res.status(500).json({ error: "Failed to fetch color values" });
  }
};

// Create or update color
exports.createOrUpdateColor = async (req, res) => {
  try {
    const { name, hex_code } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    // Check if color already exists
    const [existing] = await db.query(
      `SELECT id FROM colors WHERE name = ?`,
      [name]
    );

    if (existing.length > 0) {
      // Update existing color
      await db.query(
        `UPDATE colors SET hex_code = ? WHERE name = ?`,
        [hex_code || null, name]
      );
      const [updated] = await db.query(
        `SELECT id, name, hex_code FROM colors WHERE name = ?`,
        [name]
      );
      res.json(updated[0]);
    } else {
      // Create new color
      const [result] = await db.query(
        `INSERT INTO colors (name, hex_code) VALUES (?, ?)`,
        [name, hex_code || null]
      );

      res.status(201).json({
        id: result.insertId,
        name,
        hex_code: hex_code || null
      });
    }
  } catch (err) {
    console.error("Error creating/updating color:", err);
    res.status(500).json({ error: "Failed to save color" });
  }
};

// Delete color
exports.deleteColor = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM colors WHERE id = ?`, [id]);

    res.json({ success: true, message: "Color deleted" });
  } catch (err) {
    console.error("Error deleting color:", err);
    res.status(500).json({ error: "Failed to delete color" });
  }
};
