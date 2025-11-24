import React, { useEffect, useState } from "react";
import { productService, categoryService } from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import ProductImageManager from "./ProductImageManager";
import { Loader, Plus, Trash2, X } from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function EditProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState({ id: null, name: "", price: "", description: "", category_id: "" });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  
  // Variation states
  const [variations, setVariations] = useState([]);
  const [showAddVariation, setShowAddVariation] = useState(false);
  const [editingVariationId, setEditingVariationId] = useState(null);
  const [newVariationType, setNewVariationType] = useState("Size");
  const [newVariationValue, setNewVariationValue] = useState("");
  const [newVariationPrice, setNewVariationPrice] = useState(0);
  const [newVariationImages, setNewVariationImages] = useState([]);
  const [newVariationPreviews, setNewVariationPreviews] = useState([]);

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
      
      // Fetch variations
      fetchVariations(product.id);
    }
  }, [product]);

  const fetchVariations = async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/variations/${productId}`);
      setVariations(response.data || []);
    } catch (err) {
      console.error("Error fetching variations:", err);
    }
  };

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

  // Variation Handlers
  const handleAddVariationImages = (files) => {
    if (!files || files.length === 0) {
      setMsg({ type: "error", text: "Please select at least one image" });
      return;
    }

    const fileArray = Array.from(files);
    let validFiles = 0;

    fileArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMsg({ type: "error", text: `${file.name} is not a valid image file` });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMsg({ type: "error", text: `${file.name} is too large (max 5MB)` });
        return;
      }

      validFiles++;
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewVariationPreviews((prev) => [...prev, e.target.result]);
      };
      reader.onerror = () => {
        setMsg({ type: "error", text: `Failed to read ${file.name}` });
      };
      reader.readAsDataURL(file);
      setNewVariationImages((prev) => [...prev, file]);
    });

    if (validFiles > 0) {
      setMsg({ type: "success", text: `Added ${validFiles} image(s)` });
    }
  };

  const removeNewVariationImage = (index) => {
    setNewVariationImages((prev) => prev.filter((_, i) => i !== index));
    setNewVariationPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateVariation = async () => {
    if (!newVariationValue.trim()) {
      setMsg({ type: "error", text: "Please enter variation value" });
      return;
    }

    try {
      setLoading(true);

      let variationId;

      if (editingVariationId) {
        // Update existing variation
        await axios.put(`${API_BASE_URL}/variations/${form.id}/${editingVariationId}`, {
          variation_value: newVariationValue,
          price_adjustment: newVariationPrice || 0,
        });
        variationId = editingVariationId;
      } else {
        // Create new variation
        const varRes = await axios.post(`${API_BASE_URL}/variations/${form.id}`, {
          variation_type: newVariationType,
          variation_value: newVariationValue,
          price_adjustment: newVariationPrice || 0,
          stock_quantity: 100,
        });
        variationId = varRes.data.id;
      }

      // Upload new images if any
      for (let img of newVariationImages) {
        const imgFormData = new FormData();
        imgFormData.append("image", img);
        await axios.post(
          `${API_BASE_URL}/variations/${form.id}/${variationId}/images`,
          imgFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      setMsg({ type: "success", text: editingVariationId ? "Variation updated successfully!" : "Variation added successfully!" });
      
      // Reset form
      setNewVariationType("Size");
      setNewVariationValue("");
      setNewVariationPrice(0);
      setNewVariationImages([]);
      setNewVariationPreviews([]);
      setShowAddVariation(false);
      setEditingVariationId(null);

      // Refresh variations
      await fetchVariations(form.id);
    } catch (err) {
      console.error("Error creating/updating variation:", err);
      setMsg({ type: "error", text: "Failed to save variation" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariation = async (variationId) => {
    if (!window.confirm("Delete this variation?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/variations/${form.id}/${variationId}`);
      setMsg({ type: "success", text: "Variation deleted!" });
      await fetchVariations(form.id);
    } catch (err) {
      console.error("Error deleting variation:", err);
      setMsg({ type: "error", text: "Failed to delete variation" });
    }
  };

  const handleDeleteVariationImage = async (variationId, imageId) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/variations/${form.id}/${variationId}/images/${imageId}`);
      setMsg({ type: "success", text: "Image deleted!" });
      await fetchVariations(form.id);
    } catch (err) {
      console.error("Error deleting image:", err);
      setMsg({ type: "error", text: "Failed to delete image" });
    }
  };

  const handleEditVariation = (variation) => {
    setEditingVariationId(variation.id);
    setNewVariationType(variation.variation_type);
    setNewVariationValue(variation.variation_value);
    setNewVariationPrice(variation.price_adjustment);
    setNewVariationImages([]);
    setNewVariationPreviews([]);
    setShowAddVariation(true);
  };

  const handleCancelEdit = () => {
    setShowAddVariation(false);
    setEditingVariationId(null);
    setNewVariationType("Size");
    setNewVariationValue("");
    setNewVariationPrice(0);
    setNewVariationImages([]);
    setNewVariationPreviews([]);
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

      {/* Product Variations Section */}
      {form.id && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-gray-900">👕 Product Variations</h4>
            {!showAddVariation && (
              <button
                type="button"
                onClick={() => setShowAddVariation(true)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Variation
              </button>
            )}
          </div>

          {/* Add Variation Form */}
          {showAddVariation && (
            <div className="bg-white border border-gray-200 rounded p-4 mb-4">
              <h5 className="font-semibold mb-3 text-gray-900">{editingVariationId ? "Edit Variation" : "Add New Variation"}</h5>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Variation Type</label>
                  <input
                    type="text"
                    value={newVariationType}
                    onChange={(e) => setNewVariationType(e.target.value)}
                    disabled={editingVariationId ? true : false}
                    className={`w-full border border-gray-300 rounded px-2 py-2 text-sm ${editingVariationId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Size, Weight, Color..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Value</label>
                  <input
                    type="text"
                    value={newVariationValue}
                    onChange={(e) => setNewVariationValue(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                    placeholder="S, M, L, XL..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVariationPrice}
                    onChange={(e) => setNewVariationPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1">{editingVariationId ? "Add More Images" : "Images (Multiple)"}</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    handleAddVariationImages(e.target.files);
                    // Clear the input so users can select again if needed
                    e.target.value = "";
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-2 text-xs"
                />
                {editingVariationId && <p className="text-xs text-gray-500 mt-1">Upload new images to add them to this variation</p>}
              </div>

              {newVariationPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {newVariationPreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img src={preview} alt={`preview-${idx}`} className="h-16 w-16 object-cover rounded border border-gray-300" />
                      <button
                        type="button"
                        onClick={() => removeNewVariationImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 w-6 h-6 flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateVariation}
                  disabled={loading}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : editingVariationId ? "Update Variation" : "Create Variation"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2 border rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Variations */}
          {variations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {variations.map((variation) => (
                <div key={variation.id} className="bg-white border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{variation.variation_value}</p>
                      <p className="text-xs text-gray-600">{variation.variation_type}</p>
                      <p className="text-xs text-gray-600">₹ {variation.price_adjustment}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditVariation(variation)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit variation"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVariation(variation.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Variation Images */}
                  {variation.images && variation.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1">
                      {variation.images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={`${API_BASE_URL}/${img.image_path}`}
                            alt="variation"
                            className="w-full h-16 object-cover rounded border border-gray-200"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteVariationImage(variation.id, img.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No images</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No variations yet. Click "Add Variation" to create one.</p>
          )}
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
