require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { router: authRoutes } = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const variationRoutes = require("./routes/variationRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
// Serve static files from public folder (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/products", productRoutes);
app.use("/payments", paymentRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/categories", categoryRoutes);
app.use("/variations", variationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Docs: http://localhost:${PORT}/health\n`);
});
