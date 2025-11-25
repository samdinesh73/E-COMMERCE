import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/api";
import { Link } from "react-router-dom";
import { getBackendImageUrl } from "../../utils/imageHelper";
import { Loader } from "lucide-react";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

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
      <div className="flex items-center justify-center py-16">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-t border-gray-100 py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-black mb-1 sm:mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-xs sm:text-base">
            Explore our wide range of products organized by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl h-56 sm:h-72 md:h-64 lg:h-72 flex items-center bg-gradient-to-br from-gray-800 to-black">
                {/* Left text */}
                <div className="z-20 p-6 sm:p-8 md:p-10 w-1/2">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {category.name}
                  </h3>
                  <div className="mt-6 text-sm text-white/80 flex items-center gap-2 font-medium">
                    <span className="inline-block">Learn more</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Right image */}
                <div className="absolute right-0 top-0 h-full w-1/2">
                  {category.image ? (
                    <img
                      src={getBackendImageUrl(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover object-right-top"
                      onError={(e) => {
                        e.target.src = "assets/img/placeholder.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>

                {/* Soft gradient overlay to separate text */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
              </div>
            </Link>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="text-center mt-6 sm:mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-4 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-base font-medium"
            >
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
