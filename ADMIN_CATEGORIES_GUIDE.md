# Quick Start - Category Image Upload & Admin Features

## What Changed?

### Before
- Categories had to enter image URLs manually
- No product count visible in admin
- No way to see products in a category from admin
- No product details from admin

### After
✅ **Upload image files** directly to categories
✅ **See product count** for each category  
✅ **Click category** to view all products in it
✅ **Click product** to see full details (image, price, description, etc.)

---

## How to Use

### 1️⃣ Create Category with Image

1. Go to **Admin Dashboard** → **Categories** tab
2. Click **"Add Category"** button
3. Fill in details:
   - Category Name (required)
   - Slug (auto-generated, can edit)
   - Description (optional)
4. **Click "Browse"** to select image file from your computer
5. **See image preview** appear next to file input
6. Click **"Create Category"** button

**Result:** 
- Category created with uploaded image
- Image stored in `/uploads/` folder on server
- Category appears in list with thumbnail

---

### 2️⃣ View Products in Category

1. Go to **Admin Dashboard** → **Categories** tab
2. **Click any category row** (anywhere except the buttons)
3. **Products modal opens** showing:
   - All products in that category
   - Product count in header
   - Product images and prices

4. **Click any product** to see full details
5. **Click "Back to Products"** to return to list
6. **Click X** to close modal

---

### 3️⃣ View Product Details

1. After opening category products modal
2. **Click any product** in the list
3. **Product Details panel shows:**
   - Large product image
   - Product name
   - Price (in ₹)
   - Product ID
   - Category name
   - Full description
4. **Click "Back to Products"** or **close (X)**

---

### 4️⃣ Edit Category & Image

1. Go to **Admin Dashboard** → **Categories** tab
2. Find category and click **Edit button** (pencil icon)
3. **Update fields:**
   - Name
   - Slug
   - Description
   - **Upload NEW image** (optional)
   - If you select new image: old image deleted, new one stored

4. Click **"Update Category"** button

---

### 5️⃣ Delete Category

1. Go to **Admin Dashboard** → **Categories** tab
2. Find category and click **Delete button** (trash icon)
3. **Confirm deletion**
4. Category deleted, image file removed from server

---

## Product Count Badge

Each category shows a **blue badge** displaying:
- `5 products` (or `1 product`)
- Updated in real-time
- Includes products linked to that category

---

## Image Upload Requirements

| Requirement | Details |
|---|---|
| Supported Formats | JPG, PNG, GIF, WebP |
| Max File Size | 5 MB |
| Storage Location | `/public/uploads/` |
| Filename Format | `timestamp-randomid.ext` |
| Auto Cleanup | Old images deleted when updated |

---

## UI Elements

### Categories Table
```
[Image] | [Name] | [Slug] | [Product Count Badge] | [Edit] [Delete]
```
- **Click row** to toggle product list
- **Click Edit/Delete** to perform action without toggling

### Products Modal
- Shows all products in category
- Scrollable list
- Click product to see details

### Product Details Modal
- 2-column layout (responsive)
- Left: Large product image
- Right: Product info (name, price, ID, category)
- Bottom: Full description

---

## Example Workflow

```
1. Click "Add Category"
   ↓
2. Fill form: "Electronics"
   ↓
3. Select image file: "electronics.jpg"
   ↓
4. See image preview appear
   ↓
5. Click "Create Category"
   ↓
6. Category created in table with thumbnail
   ↓
7. Badge shows "0 products"
   ↓
8. Upload product with "Electronics" category
   ↓
9. Badge updates to "1 product"
   ↓
10. Click category row
    ↓
11. Products modal opens showing that product
    ↓
12. Click product
    ↓
13. See full product details
```

---

## Pro Tips

💡 **Organize Better:** Use category images to make products easier to find

💡 **Check Products:** Before deleting a category, click it to see all products in it

💡 **Update Images:** Edit category to replace image - old one automatically deleted

💡 **Name Convention:** Keep slugs lowercase and use hyphens (e.g., `home-garden` not `Home Garden`)

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Image not uploading | Check file size (max 5MB), format (JPG/PNG/GIF/WebP) |
| Product count wrong | Refresh page or re-upload product |
| Can't see products | Make sure products have category assigned |
| Image not showing | Check backend is running, uploads folder exists |
| Delete not working | Must confirm in alert dialog |

---

## Next Steps

After setting up categories and products:
1. Visit **Homepage** to see categories showcase
2. Visit **Shop** to filter products by category
3. Click category on homepage to see category page with all products
4. Use on **mobile** to ensure responsive layout

