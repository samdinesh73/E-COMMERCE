# API Testing Examples - Image Upload

## Prerequisites
- Backend running on `http://localhost:5000`
- Image file ready (e.g., `product.jpg`)

## Endpoints

### 1. Get All Products
```bash
curl -X GET http://localhost:5000/products
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "iPhone 15 Pro",
    "price": 79999,
    "image": "/uploads/1703001234567-123456789.jpg",
    "description": "Latest Apple smartphone"
  }
]
```

---

### 2. Get Single Product
```bash
curl -X GET http://localhost:5000/products/1
```

---

### 3. Create Product with File Upload
```bash
curl -X POST http://localhost:5000/products \
  -F "name=Samsung Galaxy S24" \
  -F "price=74999" \
  -F "description=Premium Android phone" \
  -F "image=@/path/to/image.jpg"
```

**FormData Fields:**
- `name` (text): Product name
- `price` (text/number): Product price
- `description` (text): Product description
- `image` (file): Image file

**Response:**
```json
{
  "id": 2,
  "name": "Samsung Galaxy S24",
  "price": 74999,
  "image": "/uploads/1703001234567-987654321.jpg",
  "description": "Premium Android phone"
}
```

---

### 4. Create Product without File (Text Image Path)
```bash
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Redmi Note 13",
    "price": 22999,
    "description": "Budget-friendly smartphone",
    "image": "default.png"
  }'
```

---

### 5. Update Product with New Image
```bash
curl -X PUT http://localhost:5000/products/1 \
  -F "name=iPhone 15 Pro Max" \
  -F "price": "89999" \
  -F "description=Updated description" \
  -F "image=@/path/to/new-image.jpg"
```

**Response:**
```json
{
  "id": 1,
  "name": "iPhone 15 Pro Max",
  "price": 89999,
  "image": "/uploads/1703001234568-111111111.jpg",
  "description": "Updated description"
}
```

---

### 6. Update Product without Changing Image
```bash
curl -X PUT http://localhost:5000/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro (Updated)",
    "price": 79999,
    "description": "Updated only name and price"
  }'
```

---

### 7. Delete Product
```bash
curl -X DELETE http://localhost:5000/products/1
```

**Response:**
```json
{
  "success": true,
  "id": 1
}
```

---

## PowerShell Examples (Windows)

### Create Product with Image Upload
```powershell
$filePath = "C:\path\to\image.jpg"
$url = "http://localhost:5000/products"

$body = @{
    name = "iPhone 15 Pro"
    price = "79999"
    description = "Latest Apple smartphone"
    image = Get-Item -Path $filePath
}

Invoke-WebRequest -Uri $url -Method Post -Form $body
```

### Using Invoke-RestMethod (Simpler)
```powershell
$file = Get-Item -Path "C:\path\to\image.jpg"
$url = "http://localhost:5000/products"

# Create multipart form data
$form = @{
    name = "Samsung Galaxy S24"
    price = "74999"
    description = "Premium Android phone"
    image = $file
}

Invoke-RestMethod -Uri $url -Method Post -Form $form | ConvertTo-Json
```

---

## JavaScript/Fetch Examples (Frontend)

### Upload Product with Image
```javascript
const formData = new FormData();
formData.append('name', 'iPhone 15 Pro');
formData.append('price', '79999');
formData.append('description', 'Latest Apple smartphone');
formData.append('image', fileInput.files[0]); // From <input type="file">

const response = await fetch('http://localhost:5000/products', {
  method: 'POST',
  body: formData  // Don't set Content-Type header; browser sets it automatically
});

const data = await response.json();
console.log(data);
```

### Update Product with New Image
```javascript
const formData = new FormData();
formData.append('name', 'iPhone 15 Pro Max');
formData.append('price', '89999');
formData.append('description', 'Updated description');
formData.append('image', fileInput.files[0]); // New image

const response = await fetch('http://localhost:5000/products/1', {
  method: 'PUT',
  body: formData
});

const data = await response.json();
console.log(data);
```

---

## Axios Examples (Already Used in Project)

### Upload with Axios (Using FormData)
```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('name', 'iPhone 15 Pro');
formData.append('price', '79999');
formData.append('description', 'Latest Apple smartphone');
formData.append('image', fileInput.files[0]);

axios.post('http://localhost:5000/products', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
.then(res => console.log(res.data))
.catch(err => console.error(err.response.data));
```

---

## Expected Responses

### Success (200-201)
```json
{
  "id": 1,
  "name": "Product Name",
  "price": 99.99,
  "image": "/uploads/timestamp-randomid.jpg",
  "description": "Product description"
}
```

### Validation Error (400)
```json
{
  "error": "Name and price are required"
}
```

### File Type Error (400)
```json
{
  "error": "Only image files are allowed"
}
```

### Not Found (404)
```json
{
  "error": "Product not found"
}
```

### Server Error (500)
```json
{
  "error": "Database error"
}
```

---

## Testing Workflow

### 1. Test via Curl (Command Line)
```bash
# Create with image
curl -X POST http://localhost:5000/products \
  -F "name=Test Product" \
  -F "price=999" \
  -F "description=Test" \
  -F "image=@C:\path\to\image.jpg"

# View created product
curl -X GET http://localhost:5000/products

# Update product
curl -X PUT http://localhost:5000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","price":1499}'

# Delete
curl -X DELETE http://localhost:5000/products/1
```

### 2. Test via Postman
- Set method to POST/PUT
- URL: `http://localhost:5000/products` or `http://localhost:5000/products/:id`
- Body → form-data
- Add keys: `name`, `price`, `description`, `image`
- For `image` key, set type to "File" and select image
- Send

### 3. Test via Frontend UI
- Open http://localhost:3000/admin
- Use ProductUploadForm and EditProductForm components
- Upload and verify images appear in Shop page

---

## Image URL Access

Once uploaded, images are accessible at:
```
http://localhost:5000/uploads/[filename]
```

Example:
```
http://localhost:5000/uploads/1703001234567-123456789.jpg
```

Use this URL as `src` in `<img>` tags:
```jsx
<img src="http://localhost:5000/uploads/1703001234567-123456789.jpg" alt="Product" />
```

---

**Date**: 2025 | **Feature**: Image Upload Testing
