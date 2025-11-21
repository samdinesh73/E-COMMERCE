import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../constants/config";
import ProductCard from "../common/ProductCard";
import { AlertCircle, Loader } from "lucide-react";

export default function ProductList({
  searchTerm = "",
  selectedCategories = [],
  priceRange = { min: 0, max: Infinity },
}) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/products`);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
          (!isNaN(searchNumber) && product.price <= searchNumber) // Show prices up to search number
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

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategories, priceRange]);

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
            {searchTerm || selectedCategories.length > 0 || priceRange.max !== Infinity
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
