import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/api";
import { productService } from "../../services/api";
import { getBackendImageUrl } from "../../utils/imageHelper";
import { ShoppingBag, Loader, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function CategoryProductsTabs() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

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

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.featured_image,
    });
  };

  const toggleWishlist = (productId) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
            NEW AND POPULAR
          </h2>
        </div>

        {/* Category Tabs - Glass Morphism */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 px-2 pb-8 border-b border-gray-200/50">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition-all duration-300 backdrop-blur-md border ${
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
              className={`px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition-all duration-300 backdrop-blur-md border ${
                activeCategory === category.id
                  ? "bg-black text-white shadow-lg border-black"
                  : "bg-white/30 text-gray-800 hover:bg-white/50 border-white/40 hover:border-white/60"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 hover:border-white/60 hover:bg-white/40 hover:shadow-2xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                  <img
                    src={product.featured_image ? getBackendImageUrl(product.featured_image) : "assets/img/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "assets/img/placeholder.jpg";
                    }}
                  />

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isInWishlist(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* Add to Cart Button - shows on hover */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md text-black rounded-full font-semibold hover:bg-white transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 shadow-lg"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-xs sm:text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">(125)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-black">
                        ₹{product.price}
                      </p>
                      {product.original_price && (
                        <p className="text-xs sm:text-sm text-gray-500 line-through">
                          ₹{product.original_price}
                        </p>
                      )}
                    </div>
                    {product.original_price && (
                      <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        {Math.round(
                          ((product.original_price - product.price) /
                            product.original_price) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>
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
