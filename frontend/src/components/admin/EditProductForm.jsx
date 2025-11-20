import React, { useEffect, useState } from "react";
import { productService, categoryService } from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import ProductImageManager from "./ProductImageManager";
import { Loader } from "lucide-react";

export default function EditProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState({ id: null, name: "", price: "", description: "", category_id: "" });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setForm({ 
        id: product.id, 
        name: product.name || "", 
        price: product.price || "", 
        description: product.description || "",
        category_id: product.category_id || ""
      });
      setCurrentImage(product.image);
      setImageFile(null);
      setMsg(null);
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  if (!product) return <p className="text-gray-600">Select a product to edit from the list.</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMsg({ type: "error", text: "Please select a valid image file." });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMsg({ type: "error", text: "Image size must be less than 5MB." });
        return;
      }
      setImageFile(file);
      setMsg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    
    // Validate required fields
    if (!form.name?.trim()) {
      setMsg({ type: "error", text: "Product name is required" });
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setMsg({ type: "error", text: "Price must be a positive number" });
      return;
    }

    try {
      setLoading(true);

      // Use FormData for multipart/form-data
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("price", Number(form.price));
      formData.append("description", form.description?.trim() || "");
      if (form.category_id) {
        formData.append("category_id", form.category_id);
      }
      
      // Append image file if selected (new image to upload)
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await productService.update(form.id, formData);
      setMsg({ type: "success", text: "Product updated successfully!" });
      setTimeout(() => {
        onSaved && onSaved(res.data);
      }, 500);
    } catch (err) {
      console.error("Product Update Error:", err.response || err);
      const errorMsg = err.response?.data?.error || err.message || "Update failed";
      setMsg({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-card">
      <h3 className="text-2xl font-semibold mb-4">Edit Product</h3>

      {msg && (
        <div className={`mb-4 p-3 rounded ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Price (INR)</label>
        <input name="price" value={form.price} onChange={handleChange} type="number" step="0.01" className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Category</label>
        {categoriesLoading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader className="h-4 w-4 animate-spin" />
            Loading categories...
          </div>
        ) : (
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select a category (optional)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Change Image (Optional)</label>
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Current Image:</p>
          <img 
            src={getImageUrl(currentImage)} 
            alt={form.name}
            className="w-full h-48 object-cover rounded border border-gray-300 bg-gray-100"
            onError={(e) => e.target.src = "https://via.placeholder.com/400x300?text=No+Image"}
          />
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-gray-300 rounded px-3 py-2" />
        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image.</p>
        {imageFile && (
          <div className="mt-2">
            <p className="text-xs text-green-600 font-semibold">✓ New image selected: {imageFile.name}</p>
            <p className="text-xs text-gray-500">({(imageFile.size / 1024).toFixed(2)} KB)</p>
          </div>
        )}
      </div>

      {/* Product Images Manager */}
      {form.id && (
        <div className="mb-6" onClick={(e) => e.stopPropagation()}>
          <ProductImageManager productId={form.id} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded">
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </form>
  );
}
