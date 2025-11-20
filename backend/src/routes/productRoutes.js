const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");

// Product CRUD
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "additional_images", maxCount: 10 }
]), productController.createProduct);
router.put("/:id", upload.single("image"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// Product Images CRUD
// Get all images for a product
router.get("/:productId/images", productController.getProductImages);

// Add new image to product
router.post("/:productId/images", upload.fields([{ name: "image", maxCount: 1 }]), productController.addProductImage);

// Update image details (description, order)
router.put("/:productId/images/:imageId", productController.updateProductImage);

// Delete image from product
router.delete("/:productId/images/:imageId", productController.deleteProductImage);

// Replace image file
router.put("/:productId/images/:imageId/replace", upload.fields([{ name: "image", maxCount: 1 }]), productController.replaceProductImage);

module.exports = router;
