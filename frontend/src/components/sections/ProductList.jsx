import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../constants/config";
import { getImageUrl } from "../../utils/imageHelper";
import ProductCard from "../common/ProductCard";
import { AlertCircle, Loader } from "lucide-react";

export default function ProductList({
  searchTerm = "",
  selectedCategories = [],
  priceRange = { min: 0, max: Infinity },
  selectedVariations = {},
  gridLayout = "grid-cols-3",
  viewMode = "full",
  mobileGridLayout = "grid-cols-2",
}) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productVariations, setProductVariations] = useState({});

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/products`);
        setProducts(response.data);
        setError(null);
        
        // Fetch variations for each product
        const variationsMap = {};
        for (const product of response.data) {
          try {
            const variationResponse = await axios.get(
              `${API_BASE_URL}/variations/${product.id}`
            );
            // Handle both array response and object response
            const variationData = Array.isArray(variationResponse.data) 
              ? variationResponse.data 
              : (variationResponse.data.variations || []);
            
            if (Array.isArray(variationData) && variationData.length > 0) {
              variationsMap[product.id] = variationData;
            }
          } catch (err) {
            console.error(`Error fetching variations for product ${product.id}:`, err);
          }
        }
        setProductVariations(variationsMap);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Check if product matches selected variations
  const matchesVariationFilter = (productId) => {
    const hasVariationFilter = Object.keys(selectedVariations).length > 0;
    if (!hasVariationFilter) return true;

    const variations = productVariations[productId] || [];
    
    // Check if product has any of the selected variations
    for (const [variationType, selectedValues] of Object.entries(selectedVariations)) {
      const hasMatchingVariation = variations.some(
        (variation) =>
          (variation.variation_type || '').toLowerCase() === String(variationType).toLowerCase() &&
          selectedValues.includes(variation.variation_value)
      );
      
      if (!hasMatchingVariation) return false;
    }
    
    return true;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term (name, description, category, price)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const searchNumber = parseFloat(searchTerm);
      
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.category_name?.toLowerCase().includes(term) ||
          product.price.toString().includes(term) ||
          (!isNaN(searchNumber) && product.price <= searchNumber)
      );
    }

    // Filter by multiple categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category_id)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Filter by variations
    filtered = filtered.filter((product) => matchesVariationFilter(product.id));

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategories, priceRange, selectedVariations, productVariations]);

  return (
    <section id="products" className="w-full">
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600">Loading amazing products...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-red-800 font-semibold">{error}</p>
          <p className="text-sm text-red-600 mt-2">Please try refreshing the page</p>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-24">
          <p className="text-lg text-gray-600 font-medium">No products found</p>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm || selectedCategories.length > 0 || priceRange.max !== Infinity || Object.keys(selectedVariations).length > 0
              ? "Try adjusting your filters"
              : "Check back soon for new items"}
          </p>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 font-medium">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
          {viewMode === "images-only" ? (
            // Images Only Grid - 4 columns for portrait, responsive
            <div 
              className="grid gap-2 sm:gap-3 lg:gap-4"
              style={{
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))"
              }}
            >
              {filteredProducts.map((product) => (
                <Link
                  to={`/product/${product.id}`}
                  key={product.id}
                  className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-[9/16] block cursor-pointer"
                >
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </Link>
              ))}
            </div>
          ) : (
            // Full Product Cards Grid - 2 columns default for mobile/portrait
            <div 
              className="grid gap-3 sm:gap-4 lg:gap-6"
              style={{
                gridTemplateColumns: window.innerWidth < 640 
                  ? "repeat(2, minmax(0, 1fr))"
                  : gridLayout === "grid-cols-2" 
                  ? "repeat(2, minmax(0, 1fr))" 
                  : gridLayout === "grid-cols-3" 
                  ? "repeat(3, minmax(0, 1fr))"
                  : "repeat(4, minmax(0, 1fr))"
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
