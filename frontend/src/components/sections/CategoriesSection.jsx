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
      setCategories(res.data.categories.slice(0, 6)); // Show first 6 categories
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
    <div className="bg-white border-t border-gray-100 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Explore our wide range of products organized by category
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group"
            >
              <div className="relative h-32 sm:h-40 lg:h-48 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 border border-gray-200 hover:border-blue-300 transition-all">
                {category.image ? (
                  <img
                    src={getBackendImageUrl(category.image)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "assets/img/placeholder.jpg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                    <span className="text-gray-400 text-xs sm:text-sm font-medium text-center px-2">
                      {category.name}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base truncate group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-600 text-xs line-clamp-1">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
            >
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
