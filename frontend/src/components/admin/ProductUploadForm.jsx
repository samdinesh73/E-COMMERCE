import React, { useState } from "react";
import { productService } from "../../services/api";

export default function ProductUploadForm() {
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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
      
      // Append image file if selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Create product (productService.create will handle FormData)
      const res = await productService.create(formData);
      setMessage({ type: "success", text: "Product uploaded successfully." });
      setForm({ name: "", price: "", description: "" });
      setImageFile(null);
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
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-card">
      <h3 className="text-2xl font-semibold mb-4">Upload Product</h3>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
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
        <label className="block text-sm font-medium mb-1">Product Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-gray-300 rounded px-3 py-2" />
        <p className="text-xs text-gray-500 mt-1">Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.</p>
        {imageFile && <p className="text-xs text-green-600 mt-1">✓ Selected: {imageFile.name}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded">
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button type="button" onClick={() => { setForm({ name: "", price: "", description: "" }); setImageFile(null); }} className="px-4 py-2 border rounded">
          Reset
        </button>
      </div>
    </form>
  );
}
