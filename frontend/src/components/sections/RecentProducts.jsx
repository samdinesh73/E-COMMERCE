import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader, AlertCircle, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../constants/config";
import ProductCard from "../common/ProductCard";

export default function RecentProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      // Get last 6 products (most recent)
      const recentProducts = response.data.slice(-6).reverse();
      setProducts(recentProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load recent products");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Recently Added
              </h2>
              <p className="text-gray-600">
                Discover our latest products handpicked for you
              </p>
            </div>
            <button
              onClick={() => navigate("/shop")}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-medium mb-4">No products available</p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Shop
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid using ProductCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* View All Button (Mobile) */}
            <div className="flex justify-center md:hidden">
              <button
                onClick={() => navigate("/shop")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Products
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
