# Category Image Upload & Admin Features

## Changes Implemented

### 1. Category Image Upload (Instead of URL)
Previously, categories required image URLs to be manually entered. Now admins can upload image files directly.

**Frontend Changes:**
- `CategoryManager.jsx` - Updated form to use file input instead of text URL field
- Added image preview when selecting files
- Images display in category list with thumbnails
- `CategoriesSection.jsx` - Updated to use `getBackendImageUrl` helper
- `CategoryPage.jsx` - Updated to use `getBackendImageUrl` helper
- `api.js` - Updated `categoryService` to handle FormData for multipart uploads

**Backend Changes:**
- `categoryRoutes.js` - Added multer middleware for file uploads
- POST `/categories` - Now accepts image file upload and stores filename
- PUT `/categories/:id` - Handles image file replacement (deletes old image)
- DELETE `/categories/:id` - Removes image file from disk when category is deleted

**Image Handling:**
- Images stored in `/public/uploads/` directory
- Filename format: `timestamp-randomid.extension`
- Supported formats: JPG, PNG, GIF, WebP
- Max file size: 5MB
- Old images automatically deleted when updated/deleted

### 2. Product Count Display in Categories
Each category now shows the number of products assigned to it.

**Backend Changes:**
- `categoryRoutes.js` - GET `/categories` query updated to:
  ```sql
  SELECT c.id, c.name, ..., COUNT(p.id) as product_count
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id
  GROUP BY c.id, ...
  ```

**Frontend Changes:**
- `CategoryManager.jsx` - Added "Products" column to category table
- Displays badge with product count (e.g., "5 products")
- Badge colored in blue for visibility

### 3. Clickable Categories to View Products
Categories in the admin list are now clickable to view all products in that category.

**Frontend Changes:**
- `CategoryManager.jsx`:
  - Table rows clickable to expand/collapse product list
  - Click category row to toggle product list modal
  - Added `handleCategoryClick()` function
  - Added `fetchCategoryProducts()` to load products for category
  - Added `selectedCategory` and `categoryProducts` state

**Behavior:**
- Click any category row to show products modal
- Click again to collapse products
- Edit and Delete buttons stop propagation (don't collapse)
- Products displayed in scrollable modal

### 4. Product Details Modal
When clicking a product in the category's product list, a detailed view appears.

**Frontend Changes:**
- `CategoryManager.jsx` - Added product details modal
- Shows:
  - Product image with fallback
  - Product name
  - Price (in ₹)
  - Product ID
  - Category name
  - Full description
- Modal with close button and "Back to Products" button
- Responsive grid layout (1 col on mobile, 2 cols on larger screens)

## User Flow

### Admin Dashboard - Categories Management

1. **Browse Categories**
   - Admin sees all categories in table
   - Each row shows: Image, Name, Slug, Product Count, Actions

2. **View Products in Category**
   - Click any category row to open products modal
   - Shows all products assigned to that category
   - Shows number of products in header

3. **View Product Details**
   - Click any product in the modal
   - Opens detailed product view
   - Shows image, name, price, ID, category, description
   - Click "Back to Products" to return to product list
   - Click X to close completely

4. **Upload Category Image**
   - Click "Add Category" button
   - Select image file from computer
   - Image preview shows before creating
   - Supported: JPG, PNG, GIF, WebP (Max 5MB)

5. **Edit Category**
   - Click Edit (pencil) icon
   - Can update name, description, slug, image
   - Upload new image to replace old one

6. **Delete Category**
   - Click Delete (trash) icon
   - Confirm deletion
   - Image file automatically removed from server
   - Products in category have category_id set to NULL

## Technical Details

### Database
- `categories` table stores image filenames (not URLs)
- `product_count` calculated via SQL JOIN (not stored)
- Foreign key: `products.category_id` → `categories.id`

### File Storage
```
/public/uploads/
├── timestamp-randomid.jpg
├── timestamp-randomid.png
└── ...
```

### API Endpoints

**GET /categories**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "...",
      "image": "1234567890-123456789.jpg",
      "product_count": 5
    }
  ]
}
```

**GET /categories/:id**
```json
{
  "category": { ... },
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "price": 999,
      "image": "filename.jpg",
      "description": "...",
      "category_id": 1
    }
  ]
}
```

**POST /categories (Admin)**
- Content-Type: multipart/form-data
- Fields: name, description, slug, image (file)
- Returns: Created category with ID

**PUT /categories/:id (Admin)**
- Content-Type: multipart/form-data
- Fields: name, description, slug, image (file - optional)
- Returns: Success message

**DELETE /categories/:id (Admin)**
- Deletes category and associated image file
- Sets product.category_id to NULL for products in category

## Testing Checklist

- [ ] Upload new category with image file
- [ ] Image displays correctly in category list
- [ ] Product count shows correct number
- [ ] Click category row to view products
- [ ] Click product to see details modal
- [ ] Edit category and replace image
- [ ] Verify old image is deleted
- [ ] Delete category and confirm image removed
- [ ] Categories display correctly on homepage
- [ ] Category pages show images properly
- [ ] Responsive on mobile devices

## Dependencies

- Frontend: `lucide-react` (icons), `axios` (API)
- Backend: `multer` (file upload), `express.static` (serve files)

## Notes

- Images are uploaded via FormData (multipart/form-data)
- Old images automatically cleaned up on update/delete
- Product count is dynamic (real-time from database)
- All admin operations require JWT bearer token
- Images accessible at: `http://localhost:3001/uploads/filename.jpg`
