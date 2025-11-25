import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageHelper";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import CartDrawer from "./CartDrawer";
import { ShoppingCart, Heart, Star, Zap } from "lucide-react";
import { API_BASE_URL, ENDPOINTS } from "../../constants/config";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);
  const [secondaryImage, setSecondaryImage] = useState(null);
  const [showSecondary, setShowSecondary] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch additional images on component mount
  useEffect(() => {
    const fetchAdditionalImages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${product.id}/images`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Fetched images for product ${product.id}:`, data);
          // Handle both direct array and nested images object
          const images = Array.isArray(data) ? data : (data.images || []);
          console.log(`Processed images:`, images);
          if (images.length > 0) {
            setSecondaryImage(images[0]);
            console.log(`Set secondary image:`, images[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching product images:", err);
      }
    };

    fetchAdditionalImages();
  }, [product.id]);

  // Handle image path - support both uploaded images (/uploads/...) and static paths (assets/img/...)
  const imageUrl = getImageUrl(product.image);
  const secondaryImageUrl = secondaryImage ? getImageUrl(secondaryImage.image_path) : null;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawerOpen(true);
  };

  const handleAddToCartFromDrawer = (product, quantity, variations) => {
    addToCart(product, quantity, variations);
  };

  return (
    <div className="group bg-white rounded-lg sm:rounded-xl border border-gray-300 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div
        className="relative w-full flex-shrink-0 overflow-hidden bg-gray-100 cursor-pointer aspect-[3/4]"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onMouseEnter={() => setShowSecondary(true)}
        onMouseLeave={() => setShowSecondary(false)}
      >
        <Link to={`/product/${product.id}`} className="block w-full h-full relative">
          {/* Primary Image */}
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              showSecondary ? "opacity-0" : "opacity-100"
            }`}
            onError={(e) => {
              e.target.src = "assets/img/placeholder.png";
            }}
          />

          {/* Secondary Image - Shows on hover with animation */}
          {secondaryImageUrl && (
            <img
              src={secondaryImageUrl}
              alt={`${product.name} - alternate view`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                showSecondary ? "opacity-100" : "opacity-0"
              }`}
              onError={(e) => {
                e.target.src = "assets/img/placeholder.png";
              }}
            />
          )}
        </Link>

        {/* Favorite Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full shadow-md transition-all duration-300 ${
            isFavorite
              ? "bg-black text-white"
              : "bg-white text-gray-600 hover:bg-black hover:text-white"
          }`}
        >
          <Heart
            className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? "fill-current" : ""}`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col">
        {/* Product Name */}
        <Link
          to={`/product/${product.id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="block text-sm sm:text-base font-bold text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors mb-2 leading-tight"
        >
          {product.name}
        </Link>

        {/* Price Section */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold text-black">
            ₹{parseFloat(product.price).toFixed(2)}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 line-through">₹{(parseFloat(product.price) * 1.2).toFixed(2)}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCartClick}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            Add
          </button>
          <Link
            to={`/product/${product.id}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-900 transition-all duration-300 text-center text-xs sm:text-sm"
          >
            View
          </Link>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={product}
        onAddToCart={handleAddToCartFromDrawer}
      />
    </div>
  );
}