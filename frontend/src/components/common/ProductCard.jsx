import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageHelper";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { ShoppingCart, Heart, Star, Zap } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  // Handle image path - support both uploaded images (/uploads/...) and static paths (assets/img/...)
  const imageUrl = getImageUrl(product.image);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="group bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      {/* Image Container */}
      <div
        className="relative w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
        style={{ height: '280px' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Link  to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "assets/img/placeholder.png";
            }}
          />
        </Link>

        {/* Badge */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Zap className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
          New
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full shadow-lg transition-all duration-300 transform ${
            isFavorite
              ? "bg-red-500 text-white scale-100 sm:scale-110"
              : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 hover:scale-105 sm:hover:scale-110"
          }`}
        >
          <Heart
            className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? "fill-current" : ""}`}
          />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white bg-opacity-95 backdrop-blur px-2 sm:px-3 py-1 rounded-lg flex items-center gap-1 shadow-md">
          <Star className="h-3 sm:h-4 w-3 sm:w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs sm:text-sm font-semibold text-gray-900">4.5</span>
        </div>

        {/* Overlay - Add to Cart */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center p-4 transition-all duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </button>
        </div> */}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 lg:p-5 flex-grow flex flex-col">
        {/* Product Name */}
        <Link
          to={`/product/${product.id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="block text-base sm:text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2 sm:mb-3 leading-tight"
        >
          {product.name}
        </Link>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3 sm:mb-4 flex-grow">
          Premium quality product with great features
        </p>

        {/* Price Section */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              ₹{parseFloat(product.price).toFixed(2)}
            </span>
            <span className="text-xs sm:text-sm text-gray-400 line-through">₹{(parseFloat(product.price) * 1.2).toFixed(2)}</span>
          </div>
          <div className="text-xs text-green-600 font-semibold">Save 17%</div>
        </div>

        {/* Stock & Availability */}
        <div className="flex items-center gap-2 mb-3 pb-2 sm:pb-3 border-b border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs sm:text-sm font-medium text-gray-700">In Stock (12+ items)</span>
        </div>

        {/* View Details Button */}
        <Link
          to={`/product/${product.id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full mb-2 py-2 sm:py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 text-center text-xs sm:text-sm transform hover:scale-105 active:scale-95"
        >
          View Details
        </Link>
        <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-xs sm:text-sm"
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            Add to Cart
          </button>
      </div>
    </div>
  );
}
