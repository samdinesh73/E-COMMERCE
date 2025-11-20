import React, { useState, useEffect } from "react";
import { productService } from "../../services/api";
import { Loader, X, Plus, Edit2, Save, Trash2, Upload, AlertCircle } from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";

export default function ProductImageManager({ productId, onImageAdded }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingDescription, setEditingDescription] = useState("");
  const fileInputRef = React.useRef(null);

  // Fetch images on component mount
  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await productService.images.getAll(productId);
      setImages(res.data.images || []);
      setMessage(null);
    } catch (err) {
      console.error("Error fetching images:", err);
      setMessage({ type: "error", text: "Failed to load images" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDescription = async (imageId, image) => {
    try {
      await productService.images.update(productId, imageId, {
        angle_description: editingDescription,
        display_order: image.display_order,
      });

      setMessage({ type: "success", text: "Image updated successfully!" });
      setEditingId(null);
      setEditingDescription("");
      await fetchImages();
    } catch (err) {
      console.error("Error updating image:", err);
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update image" });
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      await productService.images.remove(productId, imageId);
      setMessage({ type: "success", text: "Image deleted successfully!" });
      await fetchImages();
    } catch (err) {
      console.error("Error deleting image:", err);
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to delete image" });
    }
  };

  const handleReplaceImage = async (imageId, image) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please select a valid image file." });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 5MB." });
        return;
      }

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("angle_description", image.angle_description);

        await productService.images.replace(productId, imageId, formData);
        
        setMessage({ type: "success", text: "Image replaced successfully!" });
        await fetchImages();
      } catch (err) {
        console.error("Error replacing image:", err);
        setMessage({ type: "error", text: err.response?.data?.error || "Failed to replace image" });
      } finally {
        setUploading(false);
      }
    };

    input.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 font-medium">Loading images...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Images</h2>
          <p className="text-sm text-gray-600 mt-1">Manage additional product angles and views</p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200">
          <Upload className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">{images.length} image{images.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border-l-4 ${ message.type === "success" 
            ? "bg-green-50 border-l-green-500 text-green-800" 
            : "bg-red-50 border-l-red-500 text-red-800" }`}>
            <div className="flex-shrink-0 mt-0.5">
              {message.type === "success" ? (
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* Upload Multiple Images */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Add More Images
          </h4>
          <input type="file" multiple accept="image/*" className="w-full mb-3" onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach(file => {
              if (file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
                const fd = new FormData();
                fd.append("image", file);
                fd.append("angle_description", file.name.split('.')[0] || "Image");
                setUploading(true);
                productService.images.add(productId, fd).then(() => {
                  fetchImages();
                  setUploading(false);
                  setMessage({ type: "success", text: "Images uploaded!" });
                }).catch(err => {
                  setUploading(false);
                  setMessage({ type: "error", text: "Upload failed" });
                });
              }
            });
            e.target.value = "";
          }} disabled={uploading} />
          <p className="text-xs text-gray-600">Select multiple images (max 5MB each)</p>
        </div>

        {/* Existing Images Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            Additional Images ({images.length})
          </h3>

          {images.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">No images yet</p>
              <p className="text-sm text-gray-500 mt-1">Upload product images above to showcase different angles and views</p>
            </div>
          ) : (
            <div className="grid  gap-5">
              {images.map((image) => (
                <div key={image.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                  {/* Image Preview */}
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-48 overflow-hidden group">
                    <img
                      src={getImageUrl(image.image_path)}
                      alt={image.angle_description}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      onError={(e) => { e.target.src = "assets/img/placeholder.png"; }}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition duration-300"></div>
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {image.angle_description}
                    </span>
                  </div>

                  {/* Image Details */}
                  <div className="p-4">
                    {editingId === image.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Edit description"
                          className="w-full text-sm border-2 border-yellow-400 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateDescription(image.id, image)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold rounded-lg transition shadow-md"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-bold rounded-lg transition shadow-md"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Description</p>
                          <p className="text-sm text-gray-900 font-semibold mt-1">{image.angle_description}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Display Order</p>
                          <p className="text-sm text-gray-900 font-semibold mt-1">Position #{image.display_order + 1}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setEditingId(image.id);
                              setEditingDescription(image.angle_description);
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white text-xs font-bold rounded-lg transition shadow-md"
                            title="Edit description"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleReplaceImage(image.id, image)}
                            disabled={uploading}
                            className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition shadow-md"
                            title="Replace image"
                          >
                            <Upload className="h-4 w-4" />
                            <span className="hidden sm:inline">Replace</span>
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-lg transition shadow-md"
                            title="Delete image"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
