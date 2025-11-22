import React, { useEffect, useState } from "react";
import { productService } from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import { API_BASE_URL, ENDPOINTS } from "../../constants/config";
import { Upload, Trash2, Edit2, Loader, AlertCircle, X, Check, ChevronUp, ChevronDown } from "lucide-react";

export default function AdminProductImageManager({ productId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ angle_description: "", display_order: 0 });
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(productId);
      setImages(res.data.additional_images || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  // Add new image
  const handleAddImage = async (e) => {
    e.preventDefault();
    
    if (!uploadFile) {
      setMessage({ type: "error", text: "Please select an image" });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", uploadFile);
      formData.append("angle_description", uploadDescription || `Image ${images.length + 1}`);
      formData.append("display_order", images.length);

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      setMessage({ type: "success", text: "Image added successfully!" });
      setUploadFile(null);
      setUploadDescription("");
      setUploadMode(false);
      await fetchImages();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to add image" });
    } finally {
      setUploading(false);
    }
  };

  // Start editing
  const startEdit = (image) => {
    setEditingId(image.id);
    setEditForm({
      angle_description: image.angle_description,
      display_order: image.display_order || 0,
    });
  };

  // Update image details
  const handleUpdateImage = async (imageId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images/${imageId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update image");
      }

      setMessage({ type: "success", text: "Image updated successfully!" });
      setEditingId(null);
      await fetchImages();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update image" });
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images/${imageId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setMessage({ type: "success", text: "Image deleted successfully!" });
      await fetchImages();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete image" });
    }
  };

  // Move image up
  const handleMoveUp = async (index) => {
    if (index === 0) return;

    const newImages = [...images];
    [newImages[index].display_order, newImages[index - 1].display_order] = 
    [newImages[index - 1].display_order, newImages[index].display_order];

    try {
      await Promise.all([
        fetch(
          `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images/${newImages[index].id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: newImages[index].display_order }),
          }
        ),
        fetch(
          `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images/${newImages[index - 1].id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: newImages[index - 1].display_order }),
          }
        ),
      ]);

      setMessage({ type: "success", text: "Image order updated!" });
      await fetchImages();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to reorder images" });
    }
  };

  // Move image down
  const handleMoveDown = async (index) => {
    if (index === images.length - 1) return;

    const newImages = [...images];
    [newImages[index].display_order, newImages[index + 1].display_order] = 
    [newImages[index + 1].display_order, newImages[index].display_order];

    try {
      await Promise.all([
        fetch(
          `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images/${newImages[index].id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: newImages[index].display_order }),
          }
        ),
        fetch(
          `${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images/${newImages[index + 1].id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: newImages[index + 1].display_order }),
          }
        ),
      ]);

      setMessage({ type: "success", text: "Image order updated!" });
      await fetchImages();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to reorder images" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Product Images</h3>
        <button
          onClick={() => setUploadMode(!uploadMode)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Add Image
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === "success" 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.type === "success" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Form */}
      {uploadMode && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <form onSubmit={handleAddImage}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0])}
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={uploading}
              />
              {uploadFile && <p className="text-xs text-green-600 mt-1">✓ {uploadFile.name}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="e.g., Front View, Side View, Back View"
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={uploading}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode(false);
                  setUploadFile(null);
                  setUploadDescription("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image Preview */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                  src={getImageUrl(image.image_path)}
                  alt={image.angle_description}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "assets/img/placeholder.png";
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                  {index + 1}
                </div>
              </div>

              {/* Image Details */}
              <div className="p-4">
                {editingId === image.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={editForm.angle_description}
                        onChange={(e) =>
                          setEditForm({ ...editForm, angle_description: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                      <input
                        type="number"
                        value={editForm.display_order}
                        onChange={(e) =>
                          setEditForm({ ...editForm, display_order: parseInt(e.target.value) })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateImage(image.id)}
                        className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <p className="font-medium text-gray-900 text-sm mb-1">{image.angle_description}</p>
                    <p className="text-xs text-gray-600 mb-3">Order: {image.display_order}</p>

                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => startEdit(image)}
                        className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>

                    {/* Move Buttons */}
                    {images.length > 1 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="flex-1 px-2 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center gap-1"
                        >
                          <ChevronUp className="h-3 w-3" />
                          Up
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === images.length - 1}
                          className="flex-1 px-2 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center gap-1"
                        >
                          <ChevronDown className="h-3 w-3" />
                          Down
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No additional images yet</p>
          <button
            onClick={() => setUploadMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add First Image
          </button>
        </div>
      )}
    </div>
  );
}
