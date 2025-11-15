# Image Upload Feature Setup Guide

## Overview
This document explains how the image upload feature has been implemented and how to use it.

## Backend Changes

### 1. **Multer Middleware** (`backend/src/middleware/upload.js`)
- Handles multipart/form-data file uploads
- Stores images in `backend/public/uploads/` directory
- Supported formats: JPEG, PNG, GIF, WebP
- Max file size: 5MB
- Generates unique filenames with timestamps to prevent conflicts

### 2. **Updated Routes** (`backend/src/routes/productRoutes.js`)
- POST `/products` - Now accepts file uploads with `upload.single("image")` middleware
- PUT `/products/:id` - Now accepts file uploads for updating product images
- Handles both file uploads and form data with fallbacks

### 3. **Updated Controllers** (`backend/src/controllers/productController.js`)
- **createProduct**: Checks if file was uploaded (`req.file`), uses filename if present
- **updateProduct**: Same file handling as create, supports partial updates
- Image path saved as `/uploads/[filename]` in database
- Falls back to `req.body.image` if no file provided

### 4. **Static File Serving** (`backend/src/server.js`)
- Added `app.use("/uploads", express.static(...))` to serve uploaded images
- Images accessible at: `http://localhost:5000/uploads/[filename]`

### 5. **Database Schema** (`backend/init-db.sql`)
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Auto Migration**: `backend/src/config/database.js` automatically adds the `description` column if missing (safe no-op if already exists).

---

## Frontend Changes

### 1. **ProductUploadForm** (`frontend/src/components/admin/ProductUploadForm.jsx`)
- Added file input field for image selection
- Validates file type (images only)
- Validates file size (max 5MB)
- Uses `FormData` API to send multipart/form-data
- Shows selected filename for user confirmation
- Falls back gracefully if no image provided

### 2. **EditProductForm** (`frontend/src/components/admin/EditProductForm.jsx`)
- Added optional file input for updating product image
- Supports keeping current image or replacing with new one
- Same validation and FormData handling as upload form

### 3. **API Service** (`frontend/src/services/api.js`)
- Updated `productService.create()` to detect FormData and set proper headers
- Updated `productService.update()` to detect FormData and set proper headers
- Axios automatically handles `multipart/form-data` when Content-Type is set correctly

---

## How to Use

### Upload a Product with Image:
1. Navigate to **Admin Dashboard** → **Create Product** tab
2. Fill in:
   - **Name**: Product name
   - **Price**: Product price in INR
   - **Product Image**: Click to select image file (JPEG, PNG, GIF, WebP)
   - **Description**: Optional product description
3. Click **Upload**
4. Success message confirms product was created
5. Image is saved to `backend/public/uploads/` and filename stored in database

### Edit Product Image:
1. Navigate to **Admin Dashboard** → **Edit Product** tab
2. Select product from list
3. To change image:
   - Click "Change Image (Optional)" file input
   - Select new image file
4. To keep existing image:
   - Leave file input empty
5. Click **Save**

### Access Uploaded Images:
- In ProductCard or ProductList components, image src will be: `http://localhost:5000/uploads/[filename]`
- Example: `http://localhost:5000/uploads/1703001234567-987654321.jpg`

---

## File Structure

```
backend/
├── public/
│   └── uploads/              ← Uploaded images stored here
├── src/
│   ├── middleware/
│   │   └── upload.js         ← Multer configuration
│   ├── routes/
│   │   └── productRoutes.js  ← Updated with upload middleware
│   ├── controllers/
│   │   └── productController.js ← Updated to handle file uploads
│   ├── config/
│   │   └── database.js       ← Auto-migrates description column
│   └── server.js             ← Serves /uploads static folder
└── init-db.sql               ← Database schema

frontend/
└── src/
    ├── components/admin/
    │   ├── ProductUploadForm.jsx ← File input + FormData
    │   └── EditProductForm.jsx   ← Optional file input + FormData
    └── services/
        └── api.js            ← FormData detection + header handling
```

---

## Database Setup

### Option 1: Auto Migration (Recommended)
- Backend automatically creates `description` column on startup if missing
- No manual SQL required

### Option 2: Manual Setup
Run `backend/init-db.sql` in your MySQL client:
```bash
mysql -u root -p shop_db < backend/init-db.sql
```

### Option 3: Add Column Manually
```sql
USE shop_db;
ALTER TABLE products ADD COLUMN description TEXT DEFAULT '';
```

---

## Testing the Feature

### 1. Start Backend:
```bash
cd backend
npm install  # Install multer if not done yet
npm start
```

### 2. Start Frontend:
```bash
cd frontend
npm start
```

### 3. Test Upload:
- Go to http://localhost:3000/admin
- Click "Create Product" tab
- Fill form with product details
- Select an image file (JPEG/PNG/GIF/WebP, max 5MB)
- Click "Upload"
- Verify success message
- Go to Shop page to see product with uploaded image

### 4. Verify Files:
- Check `backend/public/uploads/` for uploaded image files
- Check database `products` table for image path and description

---

## Error Handling

### Common Issues:

**"Only image files are allowed"**
- Solution: Select JPEG, PNG, GIF, or WebP file

**"Image size must be less than 5MB"**
- Solution: Compress image or select smaller file

**"Products table error / Column not found"**
- Solution: Backend auto-migration will add missing columns
- Or manually run `ALTER TABLE products ADD COLUMN description TEXT;`

**Images not displaying:**
- Check backend is running (should serve at http://localhost:5000/uploads/[filename])
- Verify image file exists in `backend/public/uploads/`
- Check ProductCard component uses correct image src path

**Route not found (404 on PUT/DELETE):**
- Ensure backend routes are in correct order in `productRoutes.js`
- Restart backend server
- Check CORS is enabled in `server.js`

---

## Next Steps (Optional Enhancements)

1. **Image Cropping**: Add frontend image editor before upload
2. **CDN Storage**: Move uploads to AWS S3 or similar cloud storage
3. **Image Optimization**: Compress/resize images before saving
4. **Multiple Images**: Support multiple images per product
5. **Thumbnails**: Generate thumbnail versions of images
6. **Image Validation**: Check image dimensions, EXIF data, etc.

---

## API Endpoints Summary

| Method | Endpoint | Payload | Notes |
|--------|----------|---------|-------|
| GET | `/products` | - | Get all products |
| GET | `/products/:id` | - | Get single product |
| POST | `/products` | FormData or JSON | Create product with optional image |
| PUT | `/products/:id` | FormData or JSON | Update product with optional image |
| DELETE | `/products/:id` | - | Delete product |

**FormData Structure for Upload:**
```
name: "Product Name"
price: "99.99"
description: "Product description"
image: <File object from input>  ← Multer extracts this
```

---

**Created**: 2025 | **Feature**: Image Upload with Multer
