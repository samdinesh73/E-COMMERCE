import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../common/ProductCard";
import { AlertCircle, Loader } from "lucide-react";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/products");
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-24">
          <p className="text-lg text-gray-600 font-medium">No products available</p>
          <p className="text-sm text-gray-500 mt-2">Check back soon for new items</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 font-medium">Showing {products.length} products</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
