import React, { useState, useEffect } from "react";
import { productService, categoryService } from "../../services/api";
import { Loader, X, Plus, Trash2, Upload, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Select, Alert, AlertTitle, AlertDescription } from "../ui";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ProductUploadForm() {
  const [form, setForm] = useState({ name: "", price: "", description: "", category_id: "" });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Variation state - now stores multiple variation types
  const [variationGroups, setVariationGroups] = useState([
    {
      groupId: 1,
      type: "Size",
      variations: [
        { id: 1, name: "S", price: 0, images: [], imagePreviews: [] },
        { id: 2, name: "M", price: 0, images: [], imagePreviews: [] },
        { id: 3, name: "L", price: 0, images: [], imagePreviews: [] },
        { id: 4, name: "XL", price: 0, images: [], imagePreviews: [] },
      ]
    }
  ]);
  const [newVariationType, setNewVariationType] = useState("Size");

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

  // Variation Handlers
  const handleVariationPriceChange = (groupId, variationId, price) => {
    setVariationGroups((prev) =>
      prev.map((group) =>
        group.groupId === groupId
          ? {
              ...group,
              variations: group.variations.map((v) =>
                v.id === variationId ? { ...v, price: parseFloat(price) || 0 } : v
              )
            }
          : group
      )
    );
  };

  const handleVariationImagesChange = (groupId, variationId, files) => {
    const fileArray = Array.from(files || []);
    
    setVariationGroups((prev) =>
      prev.map((group) => {
        if (group.groupId === groupId) {
          return {
            ...group,
            variations: group.variations.map((v) => {
              if (v.id === variationId) {
                const newImages = [...(v.images || [])];
                const newPreviews = [...(v.imagePreviews || [])];
                
                fileArray.forEach((file) => {
                  if (file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      newPreviews.push(e.target.result);
                    };
                    reader.readAsDataURL(file);
                    newImages.push(file);
                  }
                });
                
                return { ...v, images: newImages, imagePreviews: newPreviews };
              }
              return v;
            })
          };
        }
        return group;
      })
    );
  };

  const removeVariationImage = (groupId, variationId, imageIndex) => {
    setVariationGroups((prev) =>
      prev.map((group) => {
        if (group.groupId === groupId) {
          return {
            ...group,
            variations: group.variations.map((v) => {
              if (v.id === variationId) {
                return {
                  ...v,
                  images: v.images.filter((_, idx) => idx !== imageIndex),
                  imagePreviews: v.imagePreviews.filter((_, idx) => idx !== imageIndex),
                };
              }
              return v;
            })
          };
        }
        return group;
      })
    );
  };

  const addVariationRow = (groupId) => {
    setVariationGroups((prev) =>
      prev.map((group) => {
        if (group.groupId === groupId) {
          const newId = Math.max(...group.variations.map((v) => v.id), 0) + 1;
          return {
            ...group,
            variations: [...group.variations, { id: newId, name: `Value${newId}`, price: 0, images: [], imagePreviews: [] }]
          };
        }
        return group;
      })
    );
  };

  const removeVariation = (groupId, variationId) => {
    setVariationGroups((prev) =>
      prev.map((group) => {
        if (group.groupId === groupId) {
          return {
            ...group,
            variations: group.variations.filter((v) => v.id !== variationId)
          };
        }
        return group;
      })
    );
  };

  const addVariationType = () => {
    const newGroupId = Math.max(...variationGroups.map((g) => g.groupId), 0) + 1;
    setVariationGroups((prev) => [
      ...prev,
      {
        groupId: newGroupId,
        type: "Color",
        variations: [{ id: 1, name: "", price: 0, images: [], imagePreviews: [] }]
      }
    ]);
  };

  const removeVariationType = (groupId) => {
    setVariationGroups((prev) => prev.filter((g) => g.groupId !== groupId));
  };

  const updateVariationType = (groupId, newType) => {
    setVariationGroups((prev) =>
      prev.map((group) => group.groupId === groupId ? { ...group, type: newType } : group)
    );
  };

  const addVariationGroup = () => {
    const newGroupId = Math.max(...variationGroups.map((g) => g.groupId), 0) + 1;
    setVariationGroups((prev) => [
      ...prev,
      {
        groupId: newGroupId,
        type: newVariationType,
        variations: [{ id: 1, name: "", price: 0, images: [], imagePreviews: [] }]
      }
    ]);
  };

  const removeVariationGroup = (groupId) => {
    setVariationGroups((prev) => prev.filter((g) => g.groupId !== groupId));
  };

  const updateVariationField = (groupId, variationId, field, value) => {
    setVariationGroups((prev) =>
      prev.map((group) => {
        if (group.groupId === groupId) {
          return {
            ...group,
            variations: group.variations.map((v) =>
              v.id === variationId ? { ...v, [field]: value } : v
            )
          };
        }
        return group;
      })
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

    if (variationGroups.length === 0 || variationGroups[0].variations.length === 0) {
      setMessage({ type: "error", text: "Please add at least one product variation." });
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create product
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", Number(form.price));
      formData.append("description", form.description || "");
      if (form.category_id) {
        formData.append("category_id", form.category_id);
      }
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      additionalImages.forEach((img, index) => {
        formData.append('additional_images', img.file);
        formData.append(`angle_${index}`, img.angle);
      });

      const res = await productService.create(formData);
      const productId = res.data.id;

      // Step 2: Create variations for this product
      let variationCount = 0;
      for (const group of variationGroups) {
        for (const variation of group.variations) {
          try {
            // Create variation
            const varRes = await axios.post(`${API_BASE_URL}/variations/${productId}`, {
              variation_type: group.type,
              variation_value: variation.name,
              price_adjustment: variation.price || 0,
              stock_quantity: 100,
            });

            const variationId = varRes.data.id;
            variationCount++;

            // Upload all images for this variation
            for (let imgIndex = 0; imgIndex < variation.images.length; imgIndex++) {
              const img = variation.images[imgIndex];
              const imgFormData = new FormData();
              imgFormData.append("image", img);

              await axios.post(
                `${API_BASE_URL}/variations/${productId}/${variationId}/images`,
                imgFormData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );
            }
          } catch (err) {
            console.error(`Error creating variation:`, err);
          }
        }
      }

      setMessage({ 
        type: "success", 
        text: `✓ Product created with ${variationCount} variations successfully!` 
      });
      
      // Reset form
      setForm({ name: "", price: "", description: "", category_id: "" });
      setImageFile(null);
      setAdditionalImages([]);
      setVariationGroups([
        {
          groupId: 1,
          type: "Size",
          variations: [
            { id: 1, name: "S", price: 0, images: [], imagePreviews: [] },
            { id: 2, name: "M", price: 0, images: [], imagePreviews: [] },
            { id: 3, name: "L", price: 0, images: [], imagePreviews: [] },
            { id: 4, name: "XL", price: 0, images: [], imagePreviews: [] },
          ]
        }
      ]);
      e.target.reset();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.error || "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white text-gray-900 px-6 py-8 mb-8 border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Add Product</h1>
            <p className="text-gray-600 text-sm">Fill in the details below to create a new product with variations and images</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${message.type === "success" ? "bg-green-50 border-l-green-600 text-green-900" : "bg-red-50 border-l-red-600 text-red-900"}`}>
              <div className="font-semibold">{message.type === "success" ? "✓ Success" : "✗ Error"}</div>
              <p className="text-sm mt-1">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-8">
            {/* Left Column - Main Form */}
            <div className="col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="border border-gray-300 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-5">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Product Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Price (₹) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Category
                      </label>
                      {categoriesLoading ? (
                        <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">Loading...</span>
                        </div>
                      ) : (
                        <select
                          name="category_id"
                          value={form.category_id}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="">Select category...</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe your product in detail..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div className="border border-gray-300 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-5">Product Images</h2>
                
                <div className="space-y-4">
                  {/* Primary Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Primary Image <span className="text-red-600">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="main-image-input"
                      />
                      <label htmlFor="main-image-input" className="cursor-pointer block">
                        <Upload className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-700 font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </label>
                      {imageFile && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">{imageFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Additional Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleAdditionalImageChange}
                        className="hidden"
                        id="additional-images-input"
                      />
                      <label htmlFor="additional-images-input" className="cursor-pointer block">
                        <Plus className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-700 font-medium">Add more angles and perspectives</p>
                        <p className="text-xs text-gray-500 mt-1">Multiple files allowed</p>
                      </label>
                    </div>

                    {additionalImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900 mb-3">Uploaded Images ({additionalImages.length})</p>
                        <div className="grid grid-cols-4 gap-3">
                          {additionalImages.map((img) => (
                            <div key={img.id} className="relative group">
                              <img src={img.preview} alt="preview" className="w-full h-20 object-cover rounded border border-gray-300" />
                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(img.id)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Variations */}
              <div className="border border-gray-300 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-5">Variations</h2>
                
                <div className="space-y-4">
                  {variationGroups.map((group) => (
                    <div key={group.groupId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">{group.type}</h3>
                        <button
                          type="button"
                          onClick={() => removeVariationGroup(group.groupId)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-3">
                        {group.variations.map((variation) => (
                          <div key={variation.id} className="bg-white border border-gray-200 rounded p-3">
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <input
                                type="text"
                                value={variation.name}
                                onChange={(e) => updateVariationField(group.groupId, variation.id, "name", e.target.value)}
                                placeholder="e.g., Large"
                                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              />
                              <input
                                type="number"
                                step="0.01"
                                value={variation.price}
                                onChange={(e) => updateVariationField(group.groupId, variation.id, "price", e.target.value)}
                                placeholder="Price adjustment"
                                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              />
                              <button
                                type="button"
                                onClick={() => removeVariationRow(group.groupId, variation.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>

                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleVariationImagesChange(group.groupId, variation.id, e.target.files)}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            />

                            {variation.imagePreviews.length > 0 && (
                              <div className="mt-2 grid grid-cols-4 gap-2">
                                {variation.imagePreviews.map((preview, idx) => (
                                  <div key={idx} className="relative group">
                                    <img src={preview} alt={`preview-${idx}`} className="w-full h-12 object-cover rounded border border-gray-300" />
                                    <button
                                      type="button"
                                      onClick={() => removeVariationImage(group.groupId, variation.id, idx)}
                                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addVariationRow(group.groupId)}
                        className="mt-3 text-sm px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-100"
                      >
                        + Add {group.type}
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <select
                      value={newVariationType}
                      onChange={(e) => setNewVariationType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="Size">Size</option>
                      <option value="Color">Color</option>
                      <option value="Material">Material</option>
                      <option value="Style">Style</option>
                    </select>
                    <button
                      type="button"
                      onClick={addVariationGroup}
                      className="px-4 py-2 bg-gray-200 text-gray-900 rounded text-sm font-medium hover:bg-gray-300 transition"
                    >
                      + Add Variation Type
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-1">
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 sticky top-6 space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Product Name:</span>
                      <span className="font-medium text-gray-900">{form.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Price:</span>
                      <span className="font-medium text-gray-900">₹{form.price || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Variations:</span>
                      <span className="font-medium text-gray-900">
                        {variationGroups.reduce((sum, g) => sum + g.variations.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Images:</span>
                      <span className="font-medium text-gray-900">
                        {(imageFile ? 1 : 0) + additionalImages.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white border border-gray-300 rounded p-3 text-xs text-gray-600 space-y-2">
                  <p>✓ All required fields must be filled</p>
                  <p>✓ At least one variation is required</p>
                  <p>✓ Max 5MB per image</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ name: "", price: "", description: "", category_id: "" });
                      setImageFile(null);
                      setAdditionalImages([]);
                      setVariationGroups([
                        {
                          groupId: 1,
                          type: "Size",
                          variations: [
                            { id: 1, name: "S", price: 0, images: [], imagePreviews: [] },
                            { id: 2, name: "M", price: 0, images: [], imagePreviews: [] },
                            { id: 3, name: "L", price: 0, images: [], imagePreviews: [] },
                            { id: 4, name: "XL", price: 0, images: [], imagePreviews: [] },
                          ]
                        }
                      ]);
                    }}
                    className="w-full bg-white border border-gray-400 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}