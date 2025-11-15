import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageHelper";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const [showOverlay, setShowOverlay] = useState(false);

  // Handle image path - support both uploaded images (/uploads/...) and static paths (assets/img/...)
  const imageUrl = getImageUrl(product.image);

  return (
    <div className="card overflow-hidden">
      {/* Image Container */}
      <Link
        to={`/product/${product.id}`}
        className="block relative h-60 bg-gray-100 overflow-hidden group cursor-pointer"
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.src = "assets/img/placeholder.png";
          }}
        />

        {/* Overlay */}
        {showOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-200">
            <AddToCartButton product={product} />
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link
          to={`/product/${product.id}`}
          className="block text-lg font-semibold text-black truncate hover:opacity-70 transition-opacity"
        >
          {product.name}
        </Link>
        <p className="text-2xl font-bold text-black my-2">
          ₹ {product.price}
        </p>
        <Link
          to={`/product/${product.id}`}
          className="block w-full py-2 bg-black text-white rounded font-semibold hover:opacity-90 transition-opacity text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function AddToCartButton({ product }) {
  const { addToCart } = useCart();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        addToCart(product, 1);
      }}
      className="px-6 py-2 bg-white text-black rounded font-semibold hover:opacity-90 transition-opacity duration-150"
    >
      Add to Cart
    </button>
  );
}
