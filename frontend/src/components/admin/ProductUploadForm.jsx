import React, { useState, useEffect } from "react";
import { productService, categoryService } from "../../services/api";
import { Loader, X, Plus, Trash2 } from "lucide-react";
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

      {/* Product Variations Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold text-gray-900">👕 Product Variations</h4>
          <button
            type="button"
            onClick={addVariationType}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Variation Type
          </button>
        </div>

        {/* Variation Groups */}
        <div className="space-y-4">
          {variationGroups.map((group) => (
            <div key={group.groupId} className="bg-white border border-gray-200 rounded p-4">
              {/* Variation Type Header */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b">
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-1 text-gray-700">Variation Type</label>
                  <input
                    type="text"
                    value={group.type}
                    onChange={(e) => updateVariationType(group.groupId, e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm font-medium"
                    placeholder="e.g., Size, Color, Weight, Material"
                  />
                </div>
                {variationGroups.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariationType(group.groupId)}
                    className="ml-2 px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>

              {/* Variations in this group */}
              <div className="space-y-2">
                {group.variations.map((variation) => (
                  <div key={variation.id} className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      {/* Name/Value */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-700">{group.type.toUpperCase()}</label>
                        <input
                          type="text"
                          value={variation.name}
                          onChange={(e) => {
                            setVariationGroups((prev) =>
                              prev.map((g) =>
                                g.groupId === group.groupId
                                  ? {
                                      ...g,
                                      variations: g.variations.map((v) =>
                                        v.id === variation.id ? { ...v, name: e.target.value } : v
                                      )
                                    }
                                  : g
                              )
                            );
                          }}
                          className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                          placeholder={`e.g., S, Red, 500g`}
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-700">PRICE (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variation.price}
                          onChange={(e) => handleVariationPriceChange(group.groupId, variation.id, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                          placeholder="0"
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="flex items-end">
                        {group.variations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariation(group.groupId, variation.id)}
                            className="w-full px-2 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center justify-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Images Upload Section */}
                    <div className="mt-2 pt-2 border-t">
                      <label className="block text-xs font-semibold mb-1 text-gray-700">Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleVariationImagesChange(group.groupId, variation.id, e.target.files)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                      />

                      {/* Image Previews */}
                      {variation.imagePreviews.length > 0 && (
                        <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {variation.imagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative">
                              <img src={preview} alt={`preview-${idx}`} className="h-16 w-16 object-cover rounded border border-gray-300" />
                              <button
                                type="button"
                                onClick={() => removeVariationImage(group.groupId, variation.id, idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 w-6 h-6 flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another button for this group */}
              <button
                type="button"
                onClick={() => addVariationRow(group.groupId)}
                className="mt-3 px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Another {group.type}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400">
          {loading ? "Uploading..." : "✓ Upload Product with Variations"}
        </button>
        <button type="button" onClick={() => { 
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
        }} className="px-4 py-2 border rounded hover:bg-gray-50">
          Reset
        </button>
      </div>
    </form>
  );
}
