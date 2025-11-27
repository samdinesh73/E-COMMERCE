import React, { useState, useEffect } from "react";
import ProductList from "../components/sections/ProductList";
import ShopFilters from "../components/common/ShopFilters";
import { Search, Filter, X, Image, Eye } from "lucide-react";

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [selectedVariations, setSelectedVariations] = useState({});
  const [gridLayout, setGridLayout] = useState("grid-cols-4"); // 2, 3, or 4 columns
  const [viewMode, setViewMode] = useState("full"); // "full" or "images-only"
  const [mobileGridLayout, setMobileGridLayout] = useState("grid-cols-2"); // Mobile grid layout

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
      {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Shop Our Collection</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">Discover amazing products with the best prices</p>
        </div>
      </div> */}

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          {/* Desktop View */}
          <div className="hidden sm:flex flex-row gap-2 sm:gap-4 items-center">
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
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 font-medium text-sm whitespace-nowrap"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Mobile View */}
          <div className="flex sm:hidden flex-col gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image Mode (Left) and Filter (Right) */}
            <div className="flex gap-2">
              {/* View Mode Toggle - Left */}
              <button
                onClick={() => setViewMode(viewMode === "full" ? "images-only" : "full")}
                className={`flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                  viewMode === "images-only"
                    ? "bg-black text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
                title="Toggle view mode"
              >
                <Eye className="h-4 w-4" />
                {/* <span>{viewMode === "images-only" ? "Images" : "Full"}</span> */}
              </button>
              
              {/* Filter Button - Right, Half Width */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex-1 px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700 font-medium text-sm whitespace-nowrap"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Layout Controls Bar - Desktop Only */}
        <div className="hidden sm:block  ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
            {/* Grid Layout Options */}
            {/* 2-Column Layout */}
            <button
              onClick={() => setGridLayout("grid-cols-2")}
              className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                gridLayout === "grid-cols-2"
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
              title="2 columns"
            >
              <span className="text-xs font-bold">||</span>
              
            </button>

            {/* 3-Column Layout */}
            <button
              onClick={() => setGridLayout("grid-cols-3")}
              className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                gridLayout === "grid-cols-3"
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
              title="3 columns"
            >
              <span className="text-xs font-bold">|||</span>
              
            </button>

            {/* 4-Column Layout */}
            <button
              onClick={() => setGridLayout("grid-cols-4")}
              className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                gridLayout === "grid-cols-4"
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
              title="4 columns"
            >
              <span className="text-xs font-bold">||||</span>
            
            </button>

            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === "full" ? "images-only" : "full")}
              className={`px-2 py-2 rounded-full transition-all text-sm font-medium flex items-center gap-2 ml-2 border-l border-gray-300 pl-4 ${
                viewMode === "images-only"
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
              title="Toggle view mode"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Only - View Mode Toggle */}
        <div className="sm:hidden bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            {/* Hidden on mobile - shown in search bar */}
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
                    onVariationChange={setSelectedVariations}
                    selectedCategories={selectedCategories}
                    priceRange={priceRange}
                    selectedVariations={selectedVariations}
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
              selectedVariations={selectedVariations}
              gridLayout={gridLayout}
              viewMode={viewMode}
              mobileGridLayout={mobileGridLayout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
