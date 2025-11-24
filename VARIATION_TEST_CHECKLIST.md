# ✅ Variation Feature Testing Checklist

## Pre-Test Setup
- [ ] Run database migration: `mysql < backend/create-variations.sql`
- [ ] Start backend: `cd backend && npm start`
- [ ] Start frontend: `cd frontend && npm start`
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000

## Test Workflow

### Part 1: Product Upload
- [ ] Go to Admin Dashboard
- [ ] Click "Create Product" tab
- [ ] Fill product details:
  - [ ] Name: "Test T-Shirt"
  - [ ] Price: 500
  - [ ] Category: Select any
  - [ ] Primary Image: Upload image
  - [ ] Additional Images: Upload 2-3 more images
- [ ] Click "Upload Product"
- [ ] ✅ See success message: "✓ Product uploaded successfully! Now add variations below."

### Part 2: Variation Form Appears
- [ ] Below the upload form, you should see:
  ```
  👕 Variation Management (Size, Images & Prices)
  ```
- [ ] Form shows 4 default sizes: S, M, L, XL
- [ ] Each has fields for: SIZE, PRICE, IMAGE, REMOVE

### Part 3: Add Variation Prices
- [ ] For Size S: Enter Price = 0, Upload image (optional)
- [ ] For Size M: Enter Price = 100, Upload image
- [ ] For Size L: Enter Price = 200, Upload image
- [ ] For Size XL: Enter Price = 300, Upload image

### Part 4: Upload Images (Optional)
- [ ] For at least 2 sizes, upload different images
- [ ] Verify image preview shows before saving

### Part 5: Create Variations
- [ ] Click "✓ Create All Variations"
- [ ] ✅ See success message: "✓ Created 4 variations successfully!"
- [ ] See "Existing Variations" section below with all 4 sizes displayed in grid

### Part 6: Verify Variations Display
- [ ] Verify each variation card shows:
  - [ ] Size value (S, M, L, XL)
  - [ ] Price (₹ 0, ₹ 100, ₹ 200, ₹ 300)
  - [ ] Image thumbnail (if uploaded)
  - [ ] Delete button (trash icon)

### Part 7: Delete Variation (Test)
- [ ] Click trash icon on one variation
- [ ] Click "OK" to confirm
- [ ] ✅ Variation deleted and removed from list

### Part 8: Add Another Variation
- [ ] Click "Add Size" button
- [ ] New size field added
- [ ] Modify to test value: "S-Special"
- [ ] Set price: 50
- [ ] Click "✓ Create All Variations"
- [ ] ✅ New variation appears in list

## Browser Console Checks
- [ ] Open F12 → Console tab
- [ ] No red errors during variation creation
- [ ] Network tab shows successful POST requests to `/variations/:productId`
- [ ] No 404 or 500 errors

## Database Checks
- [ ] Tables created: `product_variations`, `variation_images`
- [ ] After creating variations, query DB:
  ```sql
  SELECT * FROM product_variations;
  SELECT * FROM variation_images;
  ```

## Backend Logs
- [ ] Backend console shows API request logs
- [ ] Look for entries like:
  ```
  POST /variations/:productId
  POST /variations/:productId/:variationId/images
  ```

## Files Check
- [ ] Images stored in `backend/public/uploads/variations/`
- [ ] Folder not empty after uploading variation images

## Success Criteria ✅
- [x] Upload form has variation section
- [x] Variations created successfully
- [x] Images uploaded for variations
- [x] Existing variations displayed
- [x] Delete functionality works
- [x] Add size functionality works
- [x] No console errors
- [x] Database records created

---

**All checks passed? Feature is ready!** 🎉
