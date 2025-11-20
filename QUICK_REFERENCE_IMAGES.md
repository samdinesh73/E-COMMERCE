# 🚀 Multiple Product Images - Quick Reference

## What Changed?

### ✅ Database
- New table: `product_images` (auto-created on startup)
- Stores: image path, angle description, display order, product link

### ✅ Backend
- Routes: Accept up to 10 additional images per product
- Controller: Save multiple images to product_images table
- API: Returns all images when fetching product

### ✅ Frontend
- Admin Form: Now has multi-image upload section
- Product Detail: New image gallery with thumbnails
- Gallery: Navigate with arrows or click thumbnails

---

## 📸 Upload Images - Step by Step

```
1. Go to Admin → Upload Product
   ↓
2. Fill: Name, Price, Primary Image, Category (optional)
   ↓
3. Click "Product Images (Different Angles)" section
   ↓
4. Select multiple images (up to 10)
   ↓
5. Each image shows with text field
   ↓
6. Edit descriptions: "Front", "Side", "Back", etc.
   ↓
7. Click "Upload Product"
   ↓
8. Success! All images saved
```

---

## 🖼️ View Images - On Product Page

```
Customer clicks product
   ↓
Sees main image with label
   ↓
Thumbnail strip shows all images
   ↓
Click thumbnails OR use arrow buttons to browse
   ↓
Image counter shows current position
   ↓
Each image labeled with angle description
```

---

## 🛠️ Setup

### Start Backend
```bash
cd backend
npm run dev
```
✅ Table auto-creates if missing

### Start Frontend
```bash
cd frontend
npm start
```

---

## 📡 API Format

### Upload with Images
```javascript
FormData {
  name: "Product Name",
  price: 999,
  image: mainImageFile,
  additional_images[0][file]: file1,
  additional_images[0][angle]: "Front",
  additional_images[1][file]: file2,
  additional_images[1][angle]: "Side",
}
```

### Response Format
```json
{
  "id": 1,
  "name": "Product",
  "price": 999,
  "additional_images": [
    {
      "id": 1,
      "image_path": "/uploads/img.jpg",
      "angle_description": "Front",
      "display_order": 0
    }
  ]
}
```

---

## 📋 Files Changed

| File | What's New |
|------|-----------|
| `database.js` | Auto-create product_images table |
| `productController.js` | Handle multiple images |
| `productRoutes.js` | Accept multiple files |
| `ProductUploadForm.jsx` | Multi-image upload UI |
| `ProductImageGallery.jsx` | Image gallery (NEW) |
| `ProductDetail.jsx` | Uses gallery |

---

## ✨ Key Features

- ✅ Up to 10 images per product
- ✅ Custom angle descriptions
- ✅ Image preview before upload
- ✅ Remove images before submitting
- ✅ Interactive gallery on product page
- ✅ Thumbnail navigation
- ✅ Arrow buttons to browse
- ✅ Image counter
- ✅ Responsive design
- ✅ Auto-database setup

---

## 🎯 Example

**Upload "Blue T-Shirt":**
- Main image: front.jpg
- Add 3 angles:
  - Image 1: front.jpg → "Front"
  - Image 2: back.jpg → "Back"  
  - Image 3: side.jpg → "Side"

**Result on Product Page:**
- Shows main image
- Can click arrows to see Back, Side, Back, Main...
- Click thumbnail to jump to specific angle
- Counter: "1/4", "2/4", "3/4", "4/4"
- Each shows its angle label

---

## 🔍 Check Database

### Does table exist?
```sql
SHOW TABLES LIKE 'product_images';
```

### View table structure
```sql
DESCRIBE product_images;
```

### Check product images
```sql
SELECT * FROM product_images WHERE product_id = 1;
```

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| Images won't upload | Check file size < 5MB, format is image |
| Gallery not showing | Clear cache, refresh page |
| Table not created | Check backend console, restart backend |
| 404 on images | Ensure `/uploads/` directory exists |

---

## 📦 Upload Limits

- Max images per product: **10**
- Max file size: **5 MB** per image
- Supported formats: **JPEG, PNG, GIF, WebP**
- Recommended size: **1000x1000px**

---

## 🎨 Gallery Features

When customer views product:
- ✅ Main image with label
- ✅ Thumbnail strip below
- ✅ Left/Right arrows
- ✅ Image counter
- ✅ Click thumbnails to jump
- ✅ Hover effects
- ✅ Responsive on mobile

---

**That's it! Your multi-image product feature is ready! 🎉**
