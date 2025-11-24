const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directories exist
const publicDir = path.join(__dirname, "../../public");
const uploadsDir = path.join(publicDir, "uploads");
const variationsDir = path.join(uploadsDir, "variations");

[publicDir, uploadsDir, variationsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if this is a variation upload by looking at baseUrl or originalUrl
    const checkPath = req.baseUrl || req.originalUrl || req.path;
    console.log("Upload destination check - baseUrl:", req.baseUrl, "originalUrl:", req.originalUrl);
    
    // If baseUrl includes 'variations' or the path has '/images' after '/variations'
    if (req.baseUrl?.includes('variations') || req.originalUrl?.includes('/variations')) {
      console.log("✅ Detected variation image upload - saving to variations folder");
      // Store variation images in public/uploads/variations directory
      cb(null, variationsDir);
    } else {
      console.log("📁 Regular product image - saving to uploads folder");
      // Store regular product images in public/uploads directory
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    // Use timestamp + original filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;
