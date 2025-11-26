import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/api";
import { Link } from "react-router-dom";
import { getBackendImageUrl } from "../../utils/imageHelper";
import { Loader, ShoppingBag } from "lucide-react";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define gradient colors for each category
  const gradients = [
    "from-gray-200 to-gray-400",
    "from-gray-200 to-gray-400",
    "from-gray-200 to-gray-400",
    "from-gray-200 to-gray-400",
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.data.categories.slice(0, 4)); // Show first 4 categories for banner layout
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-2">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto">
            Explore our wide range of products organized by category
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-square bg-gray-100 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl">
                {/* Background Image */}
                <div className="absolute inset-0 overflow-hidden">
                  {category.image ? (
                    <img
                      src={getBackendImageUrl(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "assets/img/placeholder.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
                  )}
                </div>

                {/* Gradient Overlay - appears on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                  {/* Icon/Badge */}
                  <div className="mb-3 opacity-100 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all">
                      <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>

                  {/* Category Name */}
                  {/* <h3 className="text-sm sm:text-base font-bold text-black text-center group-hover:text-white transition-colors duration-300 line-clamp-2">
                    {category.name}
                  </h3> */}

                  {/* Explore Button - shows on hover */}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center gap-1 text-white text-xs font-medium px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
                      <span>Shop</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Category Name for non-hover state */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-xs sm:text-sm font-bold text-white text-center line-clamp-2">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="text-center mt-10 sm:mt-16">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base font-semibold"
            >
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
