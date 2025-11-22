import React, { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { API_BASE_URL, ENDPOINTS } from "../../constants/config";

export default function ShopFilters({
  onFilterChange,
  onCategoryChange,
  onPriceChange,
  selectedCategories = [],
  priceRange,
  loading,
  onClose,
}) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CATEGORIES}`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newCategories);
  };

  const priceRanges = [
    { label: "All Prices", min: 0, max: Infinity },
    { label: "₹0 - ₹1,000", min: 0, max: 1000 },
    { label: "₹1,000 - ₹5,000", min: 1000, max: 5000 },
    { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
    { label: "₹10,000+", min: 10000, max: Infinity },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 h-fit sticky top-32">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

      {/* Category Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2"
        >
          <h3 className="font-semibold text-gray-900">Categories</h3>
          <ChevronDown
            className={`h-5 w-5 text-gray-600 transition-transform ${
              expandedSections.category ? "rotate-180" : ""
            }`}
          />
        </button>

        {expandedSections.category && (
          <div className="mt-3 space-y-2">
            {/* Clear All Categories Option */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => onCategoryChange([])}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                All Categories
              </span>
            </label>

            {/* Category Options - Multi-select */}
            {categoriesLoading ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-gray-500">No categories found</div>
            ) : (
              categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {category.name}
                  </span>
                  {category.product_count > 0 && (
                    <span className="ml-auto text-xs text-gray-500">
                      ({category.product_count})
                    </span>
                  )}
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2"
        >
          <h3 className="font-semibold text-gray-900">Price Range</h3>
          <ChevronDown
            className={`h-5 w-5 text-gray-600 transition-transform ${
              expandedSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {expandedSections.price && (
          <div className="mt-3 space-y-2">
            {priceRanges.map((range, index) => (
              <label
                key={index}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="price"
                  value={`${range.min}-${range.max}`}
                  checked={
                    priceRange.min === range.min && priceRange.max === range.max
                  }
                  onChange={() =>
                    onPriceChange({ min: range.min, max: range.max })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {(selectedCategories.length > 0 || priceRange.min !== 0 || priceRange.max !== Infinity) && (
        <button
          onClick={() => {
            onCategoryChange([]);
            onPriceChange({ min: 0, max: Infinity });
          }}
          className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );
}
