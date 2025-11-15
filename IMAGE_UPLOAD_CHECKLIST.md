# Image Upload Implementation - Quick Checklist

## What Was Changed

### Backend ✅
- [x] Added `multer` to `backend/package.json` dependencies
- [x] Created `backend/src/middleware/upload.js` with:
  - diskStorage configuration (saves to `public/uploads/`)
  - fileFilter (images only: JPEG, PNG, GIF, WebP)
  - 5MB file size limit
  - Unique filename generation (timestamp + random ID)
- [x] Updated `backend/src/routes/productRoutes.js`:
  - POST `/products` uses `upload.single("image")` middleware
  - PUT `/products/:id` uses `upload.single("image")` middleware
- [x] Updated `backend/src/controllers/productController.js`:
  - `createProduct` checks `req.file` and saves upload path as `/uploads/[filename]`
  - `updateProduct` handles file uploads and optional image updates
  - Both support `description` field from request body
- [x] Updated `backend/src/server.js`:
  - Added `app.use("/uploads", express.static(...))` to serve uploaded images
  - Images accessible at `http://localhost:5000/uploads/[filename]`
- [x] Created `backend/init-db.sql` with schema and optional sample data
- [x] `backend/src/config/database.js` already has auto-migration for `description` column

### Frontend ✅
- [x] Updated `frontend/src/components/admin/ProductUploadForm.jsx`:
  - Added file input field with validation
  - File type check (images only)
  - File size check (max 5MB)
  - Displays selected filename
  - Uses FormData API for multipart/form-data
- [x] Updated `frontend/src/components/admin/EditProductForm.jsx`:
  - Added optional file input for image replacement
  - Keeps existing image if no new file selected
  - Same validation as upload form
- [x] Updated `frontend/src/services/api.js`:
  - `productService.create()` detects FormData and sets correct headers
  - `productService.update()` detects FormData and sets correct headers

### Documentation ✅
- [x] Created `IMAGE_UPLOAD_SETUP.md` with comprehensive guide
- [x] Created `backend/init-db.sql` with database schema

---

## How to Run

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Ensure Database Schema
**Option A** (Automatic - Recommended):
- Backend will auto-create `description` column on startup if missing
- No manual action needed

**Option B** (Manual):
```bash
mysql -u root -p shop_db < backend/init-db.sql
```

### 3. Start Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
# Images served from http://localhost:5000/uploads/
```

### 4. Start Frontend
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### 5. Test Image Upload
1. Open http://localhost:3000/admin
2. Click "Create Product" tab
3. Fill form:
   - Name: (e.g., "Test Product")
   - Price: (e.g., "99.99")
   - Image: Select a JPEG/PNG/GIF/WebP file
   - Description: (optional)
4. Click "Upload"
5. Check success message
6. View product on Shop page with image

---

## File Locations

| Purpose | Path |
|---------|------|
| Multer Config | `backend/src/middleware/upload.js` |
| Upload Route | `backend/src/routes/productRoutes.js` |
| Upload Handler | `backend/src/controllers/productController.js` |
| Upload Form | `frontend/src/components/admin/ProductUploadForm.jsx` |
| Edit Form | `frontend/src/components/admin/EditProductForm.jsx` |
| API Service | `frontend/src/services/api.js` |
| Uploaded Images | `backend/public/uploads/` |
| Database Schema | `backend/init-db.sql` |
| Setup Guide | `IMAGE_UPLOAD_SETUP.md` |

---

## Key Features

✅ **File Upload**: Upload actual image files from admin panel
✅ **File Validation**: Only images, max 5MB
✅ **File Storage**: Saved to `backend/public/uploads/`
✅ **Database Integration**: Image path stored in `products.image` column
✅ **Static Serving**: Images served at `http://localhost:5000/uploads/[filename]`
✅ **Update Support**: Change image when editing product
✅ **FormData Handling**: Proper multipart/form-data encoding
✅ **Error Handling**: User-friendly error messages
✅ **Auto Migration**: Database schema auto-updates

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Database connects successfully
- [ ] Admin Dashboard loads at `/admin`
- [ ] Can select image file in upload form
- [ ] File size validation works (>5MB shows error)
- [ ] File type validation works (non-image shows error)
- [ ] Upload creates product successfully
- [ ] Image appears in Shop page product cards
- [ ] Can edit product and change image
- [ ] Can edit product and keep existing image (no file selected)
- [ ] Images load correctly from `http://localhost:5000/uploads/`
- [ ] Database shows image path in products table

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails for multer | Update npm: `npm install -g npm@latest` |
| Database column errors | Restart backend (auto-migration will run) |
| Images not displaying | Check backend is running on port 5000 |
| File upload fails silently | Check browser console for error messages |
| "Route not found" on update | Restart backend, check route order in productRoutes.js |
| CORS errors | Ensure CORS middleware is enabled in server.js |

---

**Status**: ✅ Image Upload Feature Complete and Ready to Test

For detailed information, see `IMAGE_UPLOAD_SETUP.md`
