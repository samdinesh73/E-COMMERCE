import React, { useState, useEffect } from "react";
import ProductList from "../components/sections/ProductList";
import ShopFilters from "../components/common/ShopFilters";
import { Search, Filter, X } from "lucide-react";

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  // Close filters when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setShowFilters(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Shop Our Collection</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">Discover amazing products with the best prices</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center sm:justify-start gap-2 text-gray-700 font-medium text-sm sm:text-base whitespace-nowrap"
            >
              <Filter className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Filter Sidebar Modal - Desktop & Mobile */}
          {showFilters && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setShowFilters(false)}
              />

              {/* Filter Sidebar - Slides from left */}
              <div className="fixed left-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-lg overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-4">
                  <ShopFilters
                    onFilterChange={() => {}}
                    onCategoryChange={setSelectedCategories}
                    onPriceChange={setPriceRange}
                    selectedCategories={selectedCategories}
                    priceRange={priceRange}
                    onClose={() => setShowFilters(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div>
            <ProductList
              searchTerm={searchTerm}
              selectedCategories={selectedCategories}
              priceRange={priceRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
