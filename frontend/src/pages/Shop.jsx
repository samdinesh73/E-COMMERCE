import React, { useState, useEffect } from "react";
import ProductList from "../components/sections/ProductList";
import ShopFilters from "../components/common/ShopFilters";
import { Search, Filter, X, Eye, ShoppingBag, Heart, Home, Zap, Users, Sparkles, Watch, Gift, Snowflake, Flower2, Headphones, Lamp, Shirt, Pocket, Package, Briefcase, Wind } from "lucide-react";
import { categoryService } from "../services/api";

// Icon map for categories - with apparel-related icons
const categoryIcons = {
  "Cargos": Briefcase,
  "Jeans": Shirt,
  "Joggers": Shirt,
  "T-Shirt": Shirt,
  "Electronics": Headphones,
  "Home": Lamp,
  "Gifts": Gift,
  "Beauty": Sparkles,
  "Winter": Wind,
  "Wedding": Flower2,
  "Shoes": Package,
  "All": ShoppingBag,
};

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [selectedVariations, setSelectedVariations] = useState({});
  const [gridLayout, setGridLayout] = useState("grid-cols-4");
  const [viewMode, setViewMode] = useState("full");
  const [mobileGridLayout, setMobileGridLayout] = useState("grid-cols-2");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        const fetchedCategories = res.data.categories || [];
        // Add "All" category at the beginning
        const allCategories = [
          { id: 0, name: "All" },
          ...fetchedCategories
        ];
        setCategories(allCategories);
        setSelectedCategoryId(0); // Select "All" by default
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Fallback categories
        setCategories([
          { id: 0, name: "All" },
          { id: 1, name: "Winter" },
          { id: 2, name: "Wedding" },
          { id: 3, name: "Electronics" },
          { id: 4, name: "Home" },
          { id: 5, name: "Beauty" },
        ]);
        setSelectedCategoryId(0);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowFilters(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const colorParam = params.get("color");
      if (colorParam) {
        const values = colorParam.split(",").map((v) => v.trim()).filter(Boolean);
        if (values.length > 0) {
          setSelectedVariations((prev) => ({ ...prev, color: values }));
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCategoryClick = (categoryId, categoryName) => {
    setSelectedCategoryId(categoryId);
    if (categoryId === 0) {
      // "All" category
      setSelectedCategories([]);
    } else {
      setSelectedCategories([categoryName]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Smart Watch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="p-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              title="Filters"
            >
              <Filter className="h-5 w-5 text-gray-600" />
            </button>

            {/* Bookmark/Eye Button */}
            <button
              onClick={() => setViewMode(viewMode === "full" ? "images-only" : "full")}
              className={`p-2.5 border rounded-full transition-colors ${
                viewMode === "images-only"
                  ? "bg-blue-100 border-blue-300 text-blue-600"
                  : "border-gray-300 hover:bg-gray-50 text-gray-600"
              }`}
              title="View mode"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category List with Icons - Clean Design */}
        <div className="bg-white py-2 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-0 overflow-x-auto pb-1">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.name] || ShoppingBag;
                const isSelected = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    className={`flex flex-col items-center gap-0.5 px-4 py-1.5 flex-shrink-0 transition-all relative border-b-2 ${
                      isSelected
                        ? "border-b-blue-600 text-blue-600"
                        : "border-b-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <IconComponent className={`h-5 w-5`} />
                    <span className={`text-xs font-medium`}>
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
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
