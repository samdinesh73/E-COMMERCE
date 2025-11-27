import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageHelper";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    removeFromWishlist(product.id);
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
            >
              <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Heart className="h-6 sm:h-8 w-6 sm:w-8 text-red-600 fill-red-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl p-8 sm:p-12 text-center border border-gray-100">
            <Heart className="h-12 sm:h-16 w-12 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-normal text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Add products to your wishlist to save them for later
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-normal text-sm sm:text-base"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div>
            {/* Wishlist Items List */}
            <div className="flex flex-col divide-y divide-gray-100 gap-4 mb-6 sm:mb-8">
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg sm:rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4 p-3 sm:p-4">
                    {/* Product Image */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 overflow-hidden rounded-md group cursor-pointer flex-shrink-0">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onClick={() => navigate(`/product/${product.id}`)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-400 text-xs sm:text-sm">No image</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3
                        className="text-sm sm:text-base lg:text-lg font-normal text-gray-900 line-clamp-2 mb-1 sm:mb-2 cursor-pointer hover:text-blue-600"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">
                        {product.description
                          ? product.description.substring(0, 60) + "..."
                          : "No description"}
                      </p>

                      {/* Price */}
                      <div className="mb-2">
                        <p className="text-base sm:text-lg font-normal text-gray-900">
                          ₹{parseFloat(product.price).toFixed(2)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-normal text-xs sm:text-sm"
                        >
                          <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5" />
                          <span className="hidden sm:inline">Add to Cart</span>
                        </button>
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-normal"
                        >
                          <Heart className="h-4 sm:h-5 w-4 sm:w-5 fill-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg sm:rounded-lg p-4 sm:p-6 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <p className="text-gray-600 text-sm sm:text-base">
                Total items: <span className="font-normal text-gray-900">{wishlist.length}</span>
              </p>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-4">
                <button
                  onClick={() => navigate("/shop")}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-normal text-sm sm:text-base"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={clearWishlist}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-normal text-sm sm:text-base"
                >
                  Clear Wishlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
