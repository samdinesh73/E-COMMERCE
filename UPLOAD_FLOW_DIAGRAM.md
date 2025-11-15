# Image Upload Flow Diagram

## Complete Upload Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT UPLOAD FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. USER ACTION
   ┌──────────────────────────────────┐
   │  Admin opens ProductUploadForm   │
   │  at /admin → Create Product tab  │
   └──────────────┬───────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────┐
   │  Fills form fields:              │
   │  - Name: "iPhone 15 Pro"         │
   │  - Price: "79999"                │
   │  - Description: "..."            │
   │  - Selects image file: img.jpg   │
   └──────────────┬───────────────────┘
                  │
                  ▼
2. FRONTEND VALIDATION (ProductUploadForm.jsx)
   ┌──────────────────────────────────┐
   │  Check file type:                │
   │  ✓ JPEG, PNG, GIF, WebP allowed  │
   │  ✗ Others rejected               │
   └──────────────┬───────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────┐
   │  Check file size:                │
   │  ✓ Max 5MB allowed               │
   │  ✗ Larger files rejected          │
   └──────────────┬───────────────────┘
                  │
                  ▼
3. FORM SUBMISSION (ProductUploadForm.jsx)
   ┌──────────────────────────────────────────────────┐
   │  Create FormData object:                         │
   │  formData.append('name', 'iPhone 15 Pro')       │
   │  formData.append('price', '79999')              │
   │  formData.append('description', '...')          │
   │  formData.append('image', File)   ← KEY PART    │
   └──────────────┬──────────────────────────────────┘
                  │
                  ▼
4. API SERVICE (api.js)
   ┌──────────────────────────────────────────────────┐
   │  productService.create(formData)                 │
   │                                                   │
   │  Detects FormData:                               │
   │  - Sets Content-Type: multipart/form-data       │
   │  - Sends FormData as-is (not JSON)               │
   └──────────────┬──────────────────────────────────┘
                  │
                  ▼
5. NETWORK REQUEST
   ┌──────────────────────────────────────────────────┐
   │  HTTP POST http://localhost:5000/products       │
   │                                                   │
   │  Headers:                                        │
   │  Content-Type: multipart/form-data; boundary=... │
   │                                                   │
   │  Body:                                           │
   │  --boundary                                       │
   │  Content-Disposition: form-data; name="name"    │
   │  iPhone 15 Pro                                   │
   │  --boundary                                       │
   │  Content-Disposition: form-data; name="price"   │
   │  79999                                           │
   │  --boundary                                       │
   │  Content-Disposition: form-data; name="image"; │
   │  filename="img.jpg"                              │
   │  Content-Type: image/jpeg                        │
   │  [binary image data...]                          │
   │  --boundary--                                     │
   └──────────────┬──────────────────────────────────┘
                  │
                  ▼
6. BACKEND ROUTING (productRoutes.js)
   ┌──────────────────────────────────────────────────┐
   │  POST /products                                  │
   │    ↓                                             │
   │  upload.single('image')  ← Multer middleware    │
   │    ↓                                             │
   │  productController.createProduct                │
   └──────────────┬──────────────────────────────────┘
                  │
                  ▼
7. FILE PROCESSING (upload.js middleware)
   ┌──────────────────────────────────────────────────┐
   │  Multer diskStorage:                             │
   │                                                   │
   │  1. Parse multipart body                         │
   │  2. Extract file: img.jpg                        │
   │  3. Validate MIME type: image/jpeg ✓             │
   │  4. Check size: 2.5MB < 5MB ✓                    │
   │  5. Generate filename:                           │
   │     1703001234567-987654321.jpg                  │
   │  6. Save to disk:                                │
   │     backend/public/uploads/                      │
   │     1703001234567-987654321.jpg                  │
   │                                                   │
   │  Available in controller as req.file:            │
   │  {                                                │
   │    fieldname: 'image',                           │
   │    originalname: 'img.jpg',                      │
   │    encoding: '7bit',                             │
   │    mimetype: 'image/jpeg',                       │
   │    destination: '.../public/uploads',            │
   │    filename: '1703001234567-987654321.jpg',     │
   │    path: '...full path...',                      │
   │    size: 2621440                                  │
   │  }                                                │
   └──────────────┬──────────────────────────────────┘
                  │
                  ▼
8. BACKEND CONTROLLER (productController.js)
   ┌──────────────────────────────────────────────────┐
   │  createProduct(req, res)                         │
   │                                                   │
   │  1. Extract from req.body:                       │
   │     - name = "iPhone 15 Pro"                     │
   │     - price = "79999"                            │
   │     - description = "..."                        │
   │                                                   │
   │  2. Check if file uploaded:                      │
   │     if (req.file) {                              │
   │       image = `/uploads/${req.file.filename}`    │
   │       // image = "/uploads/170300...321.jpg"     │
   │     }                                             │
   │                                                   │
   │  3. Validate required fields:                    │
   │     if (!name || !price) → error 400             │
   │                                                   │
   │  4. INSERT into database:                        │
   │     INSERT INTO products                         │
   │     (name, price, image, description)            │
   │     VALUES ('iPhone 15 Pro', 79999,              │
   │     '/uploads/170300...321.jpg', '...')          │
   └──────────────┬──────────────────────────────────┘
                  │
                  ▼
9. DATABASE INSERT
   ┌──────────────────────────────────────────────────┐
   │  products table:                                 │
   │  ┌────┬──────────────┬───────┬────────────────┐  │
   │  │ id │    name      │ price │     image      │  │
   │  ├────┼──────────────┼───────┼────────────────┤  │
   │  │ 1  │iPhone 15 Pro │79999  │/uploads/170... │  │
   │  └────┴──────────────┴───────┴────────────────┘  │
   │                                                   │
   │  Database returns: { id: 1, name, price, image } │
   └──────────────┬──────────────────────────────────┘
                  │
                  ▼
10. RESPONSE TO FRONTEND
    ┌──────────────────────────────────────────────────┐
    │  HTTP 201 Created                                │
    │                                                   │
    │  Response Body (JSON):                           │
    │  {                                                │
    │    "id": 1,                                       │
    │    "name": "iPhone 15 Pro",                       │
    │    "price": 79999,                               │
    │    "image": "/uploads/1703001234567-987654321.jpg",
    │    "description": "..."                          │
    │  }                                                │
    └──────────────┬──────────────────────────────────┘
                   │
                   ▼
11. FRONTEND STATE UPDATE
    ┌──────────────────────────────────────────────────┐
    │  ProductUploadForm.jsx:                          │
    │                                                   │
    │  1. Show success message:                        │
    │     "Product uploaded successfully."             │
    │                                                   │
    │  2. Reset form:                                  │
    │     - Clear name, price, description            │
    │     - Clear file input                           │
    │                                                   │
    │  3. Optionally trigger refresh of product list   │
    └──────────────┬──────────────────────────────────┘
                   │
                   ▼
12. USER SEES PRODUCT
    ┌──────────────────────────────────────────────────┐
    │  Admin navigates to:                             │
    │  - List Products tab → see in product list       │
    │  - Shop page (/shop) → see with image            │
    │                                                   │
    │  ProductCard component displays:                 │
    │  ┌──────────────────────────────┐               │
    │  │  Image loaded from:          │               │
    │  │  http://localhost:5000/      │               │
    │  │  uploads/170300...321.jpg    │               │
    │  │                              │               │
    │  │  iPhone 15 Pro               │               │
    │  │  ₹79,999                     │               │
    │  │                              │               │
    │  │  [View] [Add to Cart]        │               │
    │  └──────────────────────────────┘               │
    └──────────────────────────────────────────────────┘
```

---

## File Storage Structure

```
backend/
├── src/
│   ├── server.js
│   │   └─ app.use("/uploads", express.static(...))
│   │      ↑ Serves files from public/uploads
│   │
│   ├── routes/productRoutes.js
│   │   └─ router.post("/", upload.single("image"), ...)
│   │      ↑ Multer middleware processes file
│   │
│   └── middleware/upload.js
│       └─ Multer diskStorage configuration
│          - Destination: public/uploads/
│          - Filename: timestamp-random-id.ext
│          - File Filter: images only
│          - Size Limit: 5MB
│
└── public/uploads/           ← Disk Storage Location
    ├── 1703001234567-123456789.jpg  ← Uploaded file
    ├── 1703001234568-987654321.png  ← Uploaded file
    ├── 1703001234569-555555555.gif  ← Uploaded file
    └── ... more files

Database (products table):
┌────┬────────────┬───────┬──────────────────────────────┬─────────────┐
│ id │    name    │ price │           image              │description  │
├────┼────────────┼───────┼──────────────────────────────┼─────────────┤
│ 1  │ iPhone 15  │ 79999 │ /uploads/170300...321.jpg   │ Latest ...  │
│ 2  │ Samsung S24│ 74999 │ /uploads/170300...654.png   │ Premium ... │
│ 3  │ Redmi Note │ 22999 │ /uploads/170300...987.gif   │ Budget ...  │
└────┴────────────┴───────┴──────────────────────────────┴─────────────┘
     │
     └─ image path points to file in public/uploads/
```

---

## Frontend Component Structure

```
App.jsx
├── React Router (BrowserRouter)
│   ├── / → Home
│   ├── /shop → Shop page
│   └── /admin → Admin Dashboard
│
AdminDashboard.jsx (page)
├── Tabs: Create | List | Edit | Delete
│
├── Tab 1: Create Product
│   └── ProductUploadForm.jsx
│       ├── Input: name, price, description
│       ├── Input: file (image)
│       ├── Validation: type, size
│       ├── Submit: FormData → API
│       └── Display: success/error message
│
├── Tab 2: List Products
│   └── AdminProductList.jsx
│       ├── Fetch: GET /products
│       ├── Display: table of products
│       └── Actions: Edit, Delete buttons
│
├── Tab 3: Edit Product
│   └── EditProductForm.jsx
│       ├── Input: name, price, description
│       ├── Input: file (optional image update)
│       ├── Submit: FormData → API PUT
│       └── Feedback: success/error
│
└── Tab 4: Delete Product
    └── DeleteProductConfirm.jsx
        ├── Confirm dialog
        └── Submit: DELETE → API
```

---

## API Request/Response Examples

### Create Product with Image Upload
```
REQUEST:
POST /products HTTP/1.1
Host: localhost:5000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="name"

iPhone 15 Pro
------WebKitFormBoundary
Content-Disposition: form-data; name="price"

79999
------WebKitFormBoundary
Content-Disposition: form-data; name="description"

Latest Apple smartphone
------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="photo.jpg"
Content-Type: image/jpeg

[Binary JPEG data...]
------WebKitFormBoundary--

RESPONSE:
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "name": "iPhone 15 Pro",
  "price": 79999,
  "image": "/uploads/1703001234567-987654321.jpg",
  "description": "Latest Apple smartphone"
}
```

---

## Image Accessibility Flow

```
User on Shop Page
      ↓
Browser renders ProductCard
      ↓
ProductCard has: <img src="/uploads/1703001234567-987654321.jpg" />
      ↓
Browser makes HTTP GET to:
http://localhost:5000/uploads/1703001234567-987654321.jpg
      ↓
Backend server.js handles /uploads route:
app.use("/uploads", express.static("public/uploads"))
      ↓
Express finds file at:
backend/public/uploads/1703001234567-987654321.jpg
      ↓
File sent to browser
      ↓
Image displays in ProductCard
```

---

## Error Handling Flow

```
User selects non-image file (e.g., .pdf)
      ↓
Frontend validates: fileFilter checks MIME type
      ↓
NOT in [image/jpeg, image/png, image/gif, image/webp]
      ↓
Multer rejects file:
cb(new Error("Only image files are allowed"), false)
      ↓
Backend response 400:
{
  "error": "Only image files are allowed"
}
      ↓
Frontend shows error message:
"❌ Only image files are allowed"
```

---

## Database Auto-Migration Flow

```
Backend starts
      ↓
database.js connects to MySQL
      ↓
setTimeout(ensureDescriptionColumn, 500ms)
      ↓
Query: SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'shop_db' AND TABLE_NAME = 'products'
AND COLUMN_NAME = 'description'
      ↓
If description column NOT found:
      ├─ ALTER TABLE products ADD COLUMN description TEXT
      ├─ Log: "Added 'description' column to products table."
      └─ Column created successfully
      ↓
If description column ALREADY exists:
      └─ Log: (silent, no action)
      ↓
Backend ready for requests
```

---

**Diagram Version**: 1.0  
**Date**: 2025  
**Feature**: Image Upload Flow & Architecture
