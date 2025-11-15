import React, { useEffect, useState } from "react";
import { productService } from "../../services/api";

export default function EditProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState({ id: null, name: "", price: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (product) {
      setForm({ 
        id: product.id, 
        name: product.name || "", 
        price: product.price || "", 
        description: product.description || "" 
      });
      setImageFile(null);
      setMsg(null);
    }
  }, [product]);

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
    try {
      setLoading(true);

      // Use FormData for multipart/form-data
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", Number(form.price));
      formData.append("description", form.description || "");
      
      // Append image file if selected (new image to upload)
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await productService.update(form.id, formData);
      setMsg({ type: "success", text: "Product updated." });
      onSaved && onSaved(res.data);
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: err.response?.data?.error || "Update failed" });
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
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Change Image (Optional)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-gray-300 rounded px-3 py-2" />
        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image.</p>
        {imageFile && <p className="text-xs text-green-600 mt-1">✓ New image: {imageFile.name}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded">
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </form>
  );
}
