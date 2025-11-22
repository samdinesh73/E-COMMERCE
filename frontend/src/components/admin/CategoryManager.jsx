import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { getBackendImageUrl } from "../../utils/imageHelper";
import { API_BASE_URL } from "../../constants/config";
import { Plus, Edit2, Trash2, Loader, X, ChevronRight } from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";

export default function CategoryManager() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      // Create FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("slug", formData.slug);
      if (formData.image && typeof formData.image === "object") {
        submitData.append("image", formData.image);
      }

      if (editingId) {
        await categoryService.update(editingId, submitData, token);
        setSuccess("Category updated successfully");
      } else {
        await categoryService.create(submitData, token);
        setSuccess("Category created successfully");
      }
      setFormData({ name: "", description: "", slug: "", image: null });
      setImagePreview(null);
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.response?.data?.error || "Failed to save category");
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      slug: category.slug || "",
      image: null,
    });
    setImagePreview(category.image ? getBackendImageUrl(category.image) : null);
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryService.remove(id, token);
        setSuccess("Category deleted successfully");
        fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category");
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", slug: "", image: null });
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const fetchCategoryProducts = async (categoryId) => {
    try {
      setProductsLoading(true);
      const res = await categoryService.getById(categoryId);
      setCategoryProducts(res.data.products);
      setSelectedCategory(res.data.category);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
      setCategoryProducts([]);
    } else {
      fetchCategoryProducts(category.id);
    }
  };

  const handleCloseProducts = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
    setSelectedProduct(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Category" : "Add New Category"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Electronics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="e.g., electronics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Category description"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
                {imagePreview && (
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? "Update Category" : "Create Category"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">No categories yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Image
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Slug
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                  Products
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <td className="py-3 px-4">
                    {category.image ? (
                      <img
                        src={getBackendImageUrl(category.image)}
                        alt={category.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">
                      {category.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {category.slug}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {category.product_count || 0} product{(category.product_count || 0) !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(category);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Modal */}
      {selectedCategory && !selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedCategory.name} - Products
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {categoryProducts.length} product{categoryProducts.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleCloseProducts}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              {productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              ) : categoryProducts.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  No products in this category
                </div>
              ) : (
                <div className="divide-y">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 border-l-4 border-transparent hover:border-blue-600 transition-colors"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.image && (
                        <img
                          src={`${API_BASE_URL}/uploads/${getImageUrl(product.image)}`}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{product.price}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image */}
                <div>
                  {selectedProduct.image ? (
                    <img
                      src={`${API_BASE_URL}/uploads/${getImageUrl(selectedProduct.image)}`}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Product Name</label>
                    <p className="text-lg font-bold text-gray-900">{selectedProduct.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Price</label>
                    <p className="text-lg font-bold text-blue-600">₹{selectedProduct.price}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Product ID</label>
                    <p className="text-sm text-gray-700">#{selectedProduct.id}</p>
                  </div>

                  {selectedProduct.category_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Category</label>
                      <p className="text-sm text-gray-700">{selectedProduct.category_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                  {selectedProduct.description || "No description available"}
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Back to Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

