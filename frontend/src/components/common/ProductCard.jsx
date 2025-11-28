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
  const [allImages, setAllImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showWishlistMessage, setShowWishlistMessage] = useState(false);

  // Fetch all product images on component mount
  useEffect(() => {
    const fetchAllImages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${product.id}/images`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Fetched images for product ${product.id}:`, data);
          // Handle both direct array and nested images object
          const images = Array.isArray(data) ? data : (data.images || []);
          console.log(`Processed images:`, images);
          if (images.length > 0) {
            setAllImages(images);
            console.log(`Set all images:`, images);
          }
        }
      } catch (err) {
        console.error("Error fetching product images:", err);
      }
    };

    fetchAllImages();
  }, [product.id]);

  // Auto-loop through all images every 3 seconds
  useEffect(() => {
    const total = 1 + allImages.length; // primary + additional
    if (total > 1) {
      const loopTimer = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % total);
      }, 3000);
      return () => clearInterval(loopTimer);
    }
  }, [allImages]);

  // Handle image paths - support both uploaded images (/uploads/...) and static paths (assets/img/...)
  const imageUrl = getImageUrl(product.image);
  const currentAdditionalImage = allImages.length > 0 ? allImages[currentImageIndex] : null;
  const currentAdditionalImageUrl = currentAdditionalImage ? getImageUrl(currentAdditionalImage.image_path) : null;

  // Advance to the next image (used on hover)
  const advanceImage = () => {
    const total = 1 + allImages.length;
    if (total > 1) {
      setCurrentImageIndex(prev => (prev + 1) % total);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromWishlist(product.id);
      setShowWishlistMessage(true);
    } else {
      addToWishlist(product);
      setShowWishlistMessage(true);
    }
    // Hide message after 2 seconds
    setTimeout(() => setShowWishlistMessage(false), 2000);
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
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Image Container - Separate Section with Rounding */}
      <div
        className="relative group w-full overflow-hidden bg-gray-100 cursor-pointer aspect-[9/14] rounded-lg sm:rounded-xl"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onMouseEnter={advanceImage}
      >
        <Link to={`/product/${product.id}`} className="block w-full h-full relative">
          {/* Layered images for fade animation: primary first, then additional images */}
          {(() => {
            const displayUrls = [imageUrl, ...allImages.map(img => getImageUrl(img.image_path))];
            return displayUrls.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`${product.name} - ${idx === 0 ? 'primary' : `image ${idx}`}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
                onError={(e) => { e.target.src = 'assets/img/placeholder.png'; }}
                style={{ zIndex: idx === currentImageIndex ? 20 : 10 }}
              />
            ));
          })()}
        </Link>

        {/* Favorite Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 sm:top-2 sm:right-2 z-20 rounded-full  transition-all duration-300 ${
            isFavorite
              ? " text-black"
              : " text-gray-600 hover:text-black"
          }`}
        >
          <Heart
            className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? "fill-current" : ""}`}
          />
        </button>

        {/* Mobile Add-to-cart Button (below wishlist) */}
        <button
          onClick={handleAddToCartClick}
          className="sm:hidden absolute top-10 right-2 z-20 text-black-600 rounded-full shadow-md   transition-all duration-300"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>

        {/* Add-to-cart button (shows on hovering the image - desktop only) */}
        <div className="hidden sm:block absolute left-0 right-0 bottom-3 z-40 px-3">
          <button
            onClick={handleAddToCartClick}
            className="pointer-events-auto opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-white/80 text-black px-4 py-2 rounded-md text-sm font-semibold w-full flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </button>
        </div>

        {/* Wishlist Popup Message with Celebration */}
        {showWishlistMessage && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg sm:rounded-xl z-20 pointer-events-none">
            {/* Celebration Sprinkles */}
            <div className="absolute inset-0 rounded-lg sm:rounded-xl overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `fadeUpSprinkle 2s ease-out forwards`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>

            {/* Popup Box with Fade-in Animation */}
            <div className="bg-white px-4 py-3 rounded-lg shadow-xl text-center animate-fadeIn">
              <p className="text-xs sm:text-sm font-normal text-gray-800">
                {isFavorite ? "Added to Wishlist! ❤️" : "Removed from Wishlist"}
              </p>
            </div>

            {/* CSS Animations */}
            <style>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: scale(0.8);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              
              @keyframes fadeUpSprinkle {
                from {
                  opacity: 1;
                  transform: translateY(0) translateX(0) scale(1);
                }
                to {
                  opacity: 0;
                  transform: translateY(-30px) translateX(${Math.random() * 40 - 20}px) scale(0);
                }
              }
              
              .animate-fadeIn {
                animation: fadeIn 0.4s ease-out;
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Product Info - Separate Section */}
      <div className="flex flex-col">
        {/* Product Name */}
        <Link
          to={`/product/${product.id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="block text-sm sm:text-base font-medium text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors leading-tight"
        >
          {product.name}
        </Link>

        {/* Brand/Category */}
        {/* <p className="text-xs sm:text-sm text-gray-500">
          {product.brand || "Product"}
        </p> */}

        {/* Price Section */}
        <div className="flex items-center gap-2 pt-1">
          <span className="font-semibold text-black" style={{ fontSize: '0.8rem' }}>
            ₹{parseFloat(product.price).toFixed(2)}
          </span>
          <span style={{ fontSize: '0.7rem' }} className=" text-gray-400 line-through">₹{(parseFloat(product.price) * 1.2).toFixed(2)}</span>
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