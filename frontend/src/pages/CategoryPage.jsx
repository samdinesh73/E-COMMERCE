import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categoryService } from "../services/api";
import { getBackendImageUrl } from "../utils/imageHelper";
import ProductCard from "../components/common/ProductCard";
import ShopFilters from "../components/common/ShopFilters";
import { Loader, AlertCircle, ArrowLeft, Search } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [selectedVariations, setSelectedVariations] = useState({});

  useEffect(() => {
    fetchCategoryProducts();
  }, [slug]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, sortBy, priceRange, selectedVariations, allProducts]);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoryService.getBySlug(slug);
      setCategory(res.data.category);
      setAllProducts(res.data.products);
    } catch (err) {
      console.error("Error fetching category:", err);
      setError("Category not found or failed to load");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let results = [...allProducts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query))
      );
    }

    // Price filter
    results = results.filter(
      (product) =>
        parseFloat(product.price) >= priceRange.min &&
        parseFloat(product.price) <= priceRange.max
    );

    // Variation filter
    if (Object.keys(selectedVariations).length > 0) {
      results = results.filter((product) => {
        // This would need to match product variations if available
        // For now, we'll skip this as it depends on product variation structure
        return true;
      });
    }

    // Sorting
    switch (sortBy) {
      case "price-low-to-high":
        results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high-to-low":
        results.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name-a-to-z":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z-to-a":
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        results.sort((a, b) => (new Date(b.created_at) || 0) - (new Date(a.created_at) || 0));
        break;
      default:
        // relevance - keep original order
        break;
    }

    setFilteredProducts(results);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center border border-gray-200">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-lg text-red-600 mb-4 font-semibold">{error || "Category not found"}</p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-600 text-sm sm:text-base">
                  {category.description}
                </p>
              )}
            </div>
            {category.image && (
              <img
                src={getBackendImageUrl(category.image)}
                alt={category.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {allProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center border border-gray-200">
            <p className="text-lg text-gray-600 mb-6">
              No products found in this category
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <ShopFilters
                onFilterChange={() => {}}
                onCategoryChange={() => {}}
                onPriceChange={setPriceRange}
                onVariationChange={setSelectedVariations}
                selectedCategories={[]}
                priceRange={priceRange}
                selectedVariations={selectedVariations}
                loading={loading}
              />
            </div>

            {/* Products Section */}
            <div className="lg:col-span-3">
              {/* Search and Sort Bar */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                  {/* Search Box */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="price-low-to-high">Price: Low to High</option>
                    <option value="price-high-to-low">Price: High to Low</option>
                    <option value="name-a-to-z">Name: A to Z</option>
                    <option value="name-z-to-a">Name: Z to A</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Active Filters Info */}
                {(searchQuery || priceRange.min !== 0 || priceRange.max !== Infinity) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg p-8 sm:p-12 text-center border border-gray-200">
                  <p className="text-lg text-gray-600 mb-6">
                    No products match your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange({ min: 0, max: Infinity });
                      setSelectedVariations({});
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={() => {
                        window.scrollTo(0, 0);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
