const express = require("express");
const router = express.Router();
const colorController = require("../controllers/colorController");

// Specific routes MUST come before parameterized routes
router.get("/unique-values", colorController.getUniqueColorValues);
router.get("/", colorController.getAllColors);
router.post("/", colorController.createOrUpdateColor);
router.delete("/:id", colorController.deleteColor);

module.exports = router;
