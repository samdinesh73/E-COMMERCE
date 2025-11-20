import React, { useState, useEffect } from "react";
import { productService, categoryService } from "../../services/api";
import { Loader, X, Plus } from "lucide-react";

export default function ProductUploadForm() {
  const [form, setForm] = useState({ name: "", price: "", description: "", category_id: "" });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please select a valid image file." });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 5MB." });
        return;
      }
      setImageFile(file);
      setMessage(null);
    }
  };

  const handleAdditionalImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "All files must be valid image files." });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Each image must be less than 5MB." });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAdditionalImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            file: file,
            preview: event.target.result,
            angle: `Angle ${prev.length + 1}`,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the input
    e.target.value = "";
  };

  const removeAdditionalImage = (id) => {
    setAdditionalImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updateAngleDescription = (id, angle) => {
    setAdditionalImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, angle } : img))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Basic validation
    if (!form.name || !form.price) {
      setMessage({ type: "error", text: "Please provide product name and price." });
      return;
    }

    try {
      setLoading(true);

      // Use FormData for multipart/form-data
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", Number(form.price));
      formData.append("description", form.description || "");
      if (form.category_id) {
        formData.append("category_id", form.category_id);
      }
      
      // Append main image file if selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Append additional images - use consistent naming
      additionalImages.forEach((img, index) => {
        formData.append('additional_images', img.file);
        formData.append(`angle_${index}`, img.angle);
      });

      // Create product
      const res = await productService.create(formData);
      setMessage({ type: "success", text: "Product uploaded successfully with all images!" });
      setForm({ name: "", price: "", description: "", category_id: "" });
      setImageFile(null);
      setAdditionalImages([]);
      // Reset file input
      e.target.reset();
      console.log("Created product:", res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.error || "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-card">
      <h3 className="text-2xl font-semibold mb-4">Upload Product</h3>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Product name" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Price (INR) *</label>
        <input name="price" value={form.price} onChange={handleChange} type="number" step="0.01" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="0.00" />
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
        <label className="block text-sm font-medium mb-1">Primary Product Image *</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-gray-300 rounded px-3 py-2" />
        <p className="text-xs text-gray-500 mt-1">This will be the main product image. Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.</p>
        {imageFile && <p className="text-xs text-green-600 mt-1">✓ Selected: {imageFile.name}</p>}
      </div>

      {/* Additional Images Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Product Images (Different Angles)
        </h4>
        <p className="text-sm text-gray-600 mb-3">Upload multiple images showing different angles of your product (up to 10 images)</p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleAdditionalImageChange}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />

        {/* Display added additional images */}
        {additionalImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {additionalImages.map((img) => (
              <div key={img.id} className="bg-white rounded border border-gray-200 p-2">
                <div className="relative mb-2">
                  <img src={img.preview} alt="preview" className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={img.angle}
                  onChange={(e) => updateAngleDescription(img.id, e.target.value)}
                  placeholder="e.g., Front, Side, Back"
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                />
              </div>
            ))}
          </div>
        )}

        {additionalImages.length > 0 && (
          <p className="text-xs text-gray-600 mt-3">Added {additionalImages.length} image(s)</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Product description" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400">
          {loading ? "Uploading..." : "Upload Product"}
        </button>
        <button type="button" onClick={() => { setForm({ name: "", price: "", description: "", category_id: "" }); setImageFile(null); setAdditionalImages([]); }} className="px-4 py-2 border rounded hover:bg-gray-50">
          Reset
        </button>
      </div>
    </form>
  );
}
