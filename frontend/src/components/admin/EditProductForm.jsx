import React, { useEffect, useState } from "react";
import { productService, categoryService } from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import ProductImageManager from "./ProductImageManager";
import { Loader, Plus, Trash2, X, Upload, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Select, Alert, AlertTitle, AlertDescription } from "../ui";
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
    <div className="w-full h-full overflow-y-auto bg-slate-50 p-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-white">
                <Upload className="h-5 w-5" />
                Edit Product
              </CardTitle>
              <CardDescription className="text-blue-100">
                Update product details, images, and variations
              </CardDescription>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-blue-500 rounded p-2"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {msg && (
            <Alert className={`mb-6 ${msg.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <AlertCircle className={`h-4 w-4 ${msg.type === "success" ? "text-green-600" : "text-red-600"}`} />
              <AlertTitle className={msg.type === "success" ? "text-green-800" : "text-red-800"}>
                {msg.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription className={msg.type === "success" ? "text-green-700" : "text-red-700"}>
                {msg.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (INR)</label>
                    <Input
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    {categoriesLoading ? (
                      <div className="flex items-center gap-2 text-gray-600 py-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : (
                      <Select value={form.category_id} onChange={handleChange} name="category_id">
                        <option value="">Select category...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Product description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                  <img 
                    src={getImageUrl(currentImage)} 
                    alt={form.name}
                    className="w-full h-32 object-cover rounded border border-gray-300 bg-gray-100"
                    onError={(e) => e.target.src = "https://via.placeholder.com/400x300?text=No+Image"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                  {imageFile && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Images Manager */}
            {form.id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Additional Images</CardTitle>
                </CardHeader>
                <CardContent onClick={(e) => e.stopPropagation()}>
                  <ProductImageManager productId={form.id} />
                </CardContent>
              </Card>
            )}

            {/* Variations Card - Simplified */}
            {form.id && (
              <Card className="border-2 border-blue-300">
                <CardHeader className="bg-blue-50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                      👕 Product Variations
                    </CardTitle>
                    {!showAddVariation && (
                      <Button
                        type="button"
                        onClick={() => setShowAddVariation(true)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  {/* Add/Edit Variation Form */}
                  {showAddVariation && (
                    <Card className="border border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <h5 className="font-semibold mb-3 text-sm text-gray-900">
                          {editingVariationId ? "Edit Variation" : "Add New Variation"}
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-700">Type</label>
                            <Input
                              type="text"
                              value={newVariationType}
                              onChange={(e) => setNewVariationType(e.target.value)}
                              disabled={editingVariationId ? true : false}
                              placeholder="Size, Color..."
                              className="text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-700">Value</label>
                            <Input
                              type="text"
                              value={newVariationValue}
                              onChange={(e) => setNewVariationValue(e.target.value)}
                              placeholder="S, M, L..."
                              className="text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-700">Price (₹)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={newVariationPrice}
                              onChange={(e) => setNewVariationPrice(parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-semibold mb-1 text-gray-700">
                            {editingVariationId ? "Add More Images" : "Upload Images"}
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              handleAddVariationImages(e.target.files);
                              e.target.value = "";
                            }}
                            className="w-full text-xs"
                          />
                        </div>

                        {newVariationPreviews.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 mb-3">
                            {newVariationPreviews.map((preview, idx) => (
                              <div key={idx} className="relative">
                                <img src={preview} alt={`preview-${idx}`} className="h-12 w-12 object-cover rounded border border-gray-300" />
                                <button
                                  type="button"
                                  onClick={() => removeNewVariationImage(idx)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 w-5 h-5 flex items-center justify-center"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleCreateVariation}
                            disabled={loading}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                          >
                            {loading ? "Saving..." : editingVariationId ? "Update" : "Create"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEdit}
                            size="sm"
                            className="h-8 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Existing Variations - Grid Layout */}
                  {variations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {variations.map((variation) => (
                        <Card key={variation.id} className="border border-gray-200 p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{variation.variation_value}</p>
                              <p className="text-xs text-gray-600">{variation.variation_type}</p>
                              <p className="text-xs font-medium text-blue-600">₹{variation.price_adjustment}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditVariation(variation)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVariation(variation.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {variation.images && variation.images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-0.5">
                              {variation.images.map((img) => (
                                <div key={img.id} className="relative group">
                                  <img
                                    src={`${API_BASE_URL}/${img.image_path}`}
                                    alt="variation"
                                    className="w-full h-12 object-cover rounded border border-gray-200 text-xs"
                                    onError={(e) => { e.target.style.display = "none"; }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVariationImage(variation.id, img.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition w-4 h-4 flex items-center justify-center"
                                  >
                                    <X className="h-2 w-2" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">No images</p>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 text-center py-2">
                      No variations yet. Click "Add" to create one.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons - Sticky at bottom */}
            <div className="flex gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-b-lg">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black hover:bg-gray-800 h-9 text-sm"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-9 text-sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
