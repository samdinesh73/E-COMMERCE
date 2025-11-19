import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/api";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";

export default function CategoryFilter({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  const handleClearFilter = () => {
    setSelectedCategory(null);
    if (onSelectCategory) {
      onSelectCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      
      <button
        onClick={handleClearFilter}
        className={`w-full mb-3 px-4 py-2 rounded-lg font-medium transition-colors ${
          selectedCategory === null
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All Products
      </button>

      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleSelectCategory(category.id)}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <p className="text-gray-500 text-sm">No categories available</p>
      )}
    </div>
  );
}
