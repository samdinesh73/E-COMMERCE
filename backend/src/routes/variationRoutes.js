const express = require("express");
const router = express.Router();
const variationController = require("../controllers/variationController");
const upload = require("../middleware/upload");

// Get all variations for a product
router.get("/:productId", variationController.getProductVariations);

// Create new variation
router.post("/:productId", variationController.createVariation);

// Update variation
router.put("/:productId/:variationId", variationController.updateVariation);

// Delete variation
router.delete("/:productId/:variationId", variationController.deleteVariation);

// Add image to variation
router.post(
  "/:productId/:variationId/images",
  upload.single("image"),
  variationController.addVariationImage
);

// Delete variation image
router.delete(
  "/:productId/:variationId/images/:imageId",
  variationController.deleteVariationImage
);

module.exports = router;
