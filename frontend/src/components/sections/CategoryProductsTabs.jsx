import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/api";
import { productService } from "../../services/api";
import ProductCard from "../common/ProductCard";
import { Loader } from "lucide-react";

export default function CategoryProductsTabs() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      const cats = res.data.categories.slice(0, 5);
      setCategories(cats);
      // Load all products initially
      fetchAllProducts();
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      console.log("All products fetched:", res.data);
      // Data comes as array directly, not wrapped in { products: [] }
      const productsData = Array.isArray(res.data) ? res.data : (res.data.products || []);
      setProducts(productsData.slice(0, 8));
    } catch (err) {
      console.error("Error fetching all products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      console.log("All products data:", res.data);
      console.log("Filtering for categoryId:", categoryId);
      
      // Data comes as array directly, not wrapped in { products: [] }
      const productsData = Array.isArray(res.data) ? res.data : (res.data.products || []);
      
      // Log first product to see its structure
      if (productsData && productsData.length > 0) {
        console.log("First product structure:", productsData[0]);
      }
      
      const filtered = productsData
        .filter((p) => {
          const catId = p.category_id || p.categoryId;
          console.log(`Product: ${p.name}, catId: ${catId}, matches: ${catId === categoryId}`);
          return catId === categoryId;
        })
        .slice(0, 8);
      
      console.log("Filtered products count:", filtered.length);
      setProducts(filtered);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId === null) {
      fetchAllProducts();
    } else {
      fetchProductsByCategory(categoryId);
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white py-16 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-2 sm:mb-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
            NEW AND POPULAR
          </h2>
        </div>

        {/* Category Tabs - Glass Morphism */}
        <div className="sticky top-0 z-40 flex flex-wrap justify-center gap-2 sm:gap-3 py-2 mb-4 px-2  border-b border-gray-200/50 bg-gradient-to-b from-white via-gray-50 to-white/80 backdrop-blur-sm">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 font-normal text-xs leading-[0.5rem] sm:text-sm sm:leading-[0.5rem] transition-all duration-300 backdrop-blur-md border ${
              activeCategory === null
                ? "bg-black text-white shadow-lg border-black"
                : "bg-white/30 text-gray-800 hover:bg-white/50 border-white/40 hover:border-white/60"
            }`}
          >
            ALL
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-1 sm:px-4 py-1 sm:py-1 border-black font-normal text-xs leading-[0.5rem] sm:text-sm sm:leading-[0.5rem] transition-all duration-300 backdrop-blur-md border ${
                activeCategory === category.id
                  ? "bg-black text-white shadow-lg border-black"
                  : "bg-white/30 text-gray-800 hover:bg-black/50 border-black "
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 text-black animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-600 text-lg">No product found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-12 sm:mt-16">
            <button className="inline-flex items-center gap-2 px-8 sm:px-12 py-3 sm:py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg">
              View All Products
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path
                  d="M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
