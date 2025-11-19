# Categories Feature - Setup Guide

## Overview
The categories feature allows you to organize products into categories. This includes:
- ✅ Create, read, update, delete categories (CRUD)
- ✅ Assign categories to products during creation/editing
- ✅ View products by category
- ✅ Category showcase on homepage
- ✅ Admin panel for category management

## Setup Steps

### Step 1: Run Database Migration

Execute the SQL migration to create the categories table and add category_id to products:

```bash
mysql -u root -p shop_db < backend/add-categories.sql
```

**What it creates:**
- `categories` table with id, name, description, image, slug columns
- `category_id` column in `products` table as foreign key
- Sample categories: Electronics, Clothing, Books, Home & Garden, Sports, Toys

### Step 2: Verify Backend Routes

The following files have been created/updated:

**Files Created:**
```
backend/src/routes/categoryRoutes.js - Category API endpoints
```

**Files Updated:**
```
backend/src/server.js - Added category routes
backend/src/controllers/productController.js - Added category_id support
```

### Step 3: Verify Frontend Components

The following files have been created/updated:

**Files Created:**
```
frontend/src/components/admin/CategoryManager.jsx - Admin category management UI
frontend/src/components/common/CategoryFilter.jsx - Category filter for shop
frontend/src/components/sections/CategoriesSection.jsx - Category showcase on homepage
frontend/src/pages/CategoryPage.jsx - Category products page
```

**Files Updated:**
```
frontend/src/App.jsx - Added category route
frontend/src/pages/HomePage.jsx - Added CategoriesSection
frontend/src/components/admin/ProductUploadForm.jsx - Added category dropdown
frontend/src/components/admin/EditProductForm.jsx - Added category dropdown
frontend/src/pages/admin/AdminDashboard.jsx - Added Categories tab
frontend/src/services/api.js - Added categoryService
frontend/src/constants/config.js - Added CATEGORIES endpoint
```

---

## API Endpoints

### Public Endpoints (No Auth Required)

#### GET /categories
Get all categories

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "image": "/uploads/electronics.jpg",
      "slug": "electronics"
    }
  ]
}
```

#### GET /categories/:id
Get category by ID with products

**Response:**
```json
{
  "category": { ... },
  "products": [ ... ]
}
```

#### GET /categories/slug/:slug
Get category by slug with products

**Response:**
```json
{
  "category": { ... },
  "products": [ ... ]
}
```

### Admin Endpoints (Requires Bearer Token)

#### POST /categories
Create new category

**Request Body:**
```json
{
  "name": "Sports",
  "description": "Sports equipment",
  "image": "/uploads/sports.jpg",
  "slug": "sports"
}
```

#### PUT /categories/:id
Update category

**Request Body:**
```json
{
  "name": "Sports & Fitness",
  "description": "Updated description",
  "image": "/uploads/sports-fitness.jpg",
  "slug": "sports-fitness"
}
```

#### DELETE /categories/:id
Delete category (sets all products' category_id to NULL)

---

## Admin Dashboard Usage

### Managing Categories

1. Go to Admin Dashboard
2. Click on "Categories" tab
3. Click "Add Category" button to create new categories
4. Enter category name, description, slug, and image URL
5. Click "Create Category"

### Viewing Categories

Categories are listed in a table showing:
- Category name
- Slug (URL-friendly name)
- Description preview
- Edit and Delete buttons

### Editing Categories

1. Click the Edit (pencil) icon on any category
2. Modify the fields
3. Click "Update Category"

### Deleting Categories

1. Click the Delete (trash) icon
2. Confirm deletion
3. Note: Products in this category will have their category_id set to NULL

---

## Product Management with Categories

### Creating Products with Categories

1. Go to Admin Dashboard
2. Click on "Create Product" tab
3. Fill in product details:
   - Name
   - Price
   - Category (dropdown - select from existing categories)
   - Description
   - Product image
4. Click "Create Product"

### Editing Product Category

1. Go to Admin Dashboard
2. Click on "Edit Product" tab
3. Select product from list
4. Change category dropdown
5. Click "Update Product"

---

## Frontend Features

### Homepage Categories Showcase

The homepage now displays the first 6 categories:
- Shows category image
- Category name
- Category description preview
- Clickable cards link to category page

### Shop by Category Filter

The shop page includes a category filter in the sidebar:
- "All Products" button
- List of all categories
- Click to filter products by category

### Category Pages

Visit `/category/:slug` to see all products in a category:
- Category header with image and description
- Grid of all products in that category
- Product count displayed

---

## Database Schema

### categories Table
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### products Table Update
```sql
ALTER TABLE products ADD COLUMN category_id INT;
ALTER TABLE products ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
```

---

## Example Flow

### 1. Create Categories

```bash
POST /categories (admin)
{
  "name": "Electronics",
  "description": "Electronic devices",
  "slug": "electronics",
  "image": "/uploads/electronics.jpg"
}
```

### 2. Create Product with Category

```bash
POST /products (admin)
{
  "name": "iPhone 15",
  "price": 79999,
  "description": "Latest iPhone",
  "category_id": 1,
  "image": <file>
}
```

### 3. View Category Products

Visit: `http://localhost:3000/category/electronics`

Shows all products where category_id = 1

### 4. Filter Products by Category

Visit: `http://localhost:3000/shop`
Click category name in sidebar to filter

---

## Troubleshooting

### Categories not showing in admin dashboard

1. Check database tables exist: `DESCRIBE categories;`
2. Ensure categoryRoutes are imported in server.js
3. Check browser console for API errors
4. Verify backend is running on correct port

### Products not showing category when created

1. Ensure category_id column exists in products table
2. Verify foreign key relationship: `SHOW CREATE TABLE products;`
3. Check that category_id is being sent in product creation request

### Category page shows no products

1. Verify products have category_id set in database
2. Check that slug matches in URL
3. Verify the category exists: `SELECT * FROM categories WHERE slug = '<slug>';`

---

## Future Enhancements

- [ ] Add category images to categories section
- [ ] Category hierarchies (parent/child categories)
- [ ] Category-specific promotions/discounts
- [ ] Category analytics dashboard
- [ ] Bulk category operations
- [ ] Category bulk product assignment
