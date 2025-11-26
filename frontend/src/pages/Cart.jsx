import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageHelper";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { API_BASE_URL } from "../constants/config";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const total = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            {items.length} item{items.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2 font-semibold">Your cart is empty</p>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-semibold text-sm sm:text-base"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items - Mobile First */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Single row layout - Image left (portrait), details right */}
                  <div className="flex gap-0">
                    {/* Left side - Image in portrait size */}
                    <div className="flex-shrink-0 w-32 h-48 bg-gray-100">
                      {/* Show variation image if selected variation has images */}
                      {item.selectedVariations && Object.values(item.selectedVariations).some(v => v && v.images && v.images.length > 0) ? (
                        (() => {
                          const variationWithImage = Object.values(item.selectedVariations).find(v => v && v.images && v.images.length > 0);
                          return (
                            <img
                              src={`${API_BASE_URL}/${variationWithImage.images[0].image_path}`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = getImageUrl(item.image);
                              }}
                            />
                          );
                        })()
                      ) : (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "assets/img/placeholder.png";
                          }}
                        />
                      )}
                    </div>

                    {/* Right side - Details */}
                    <div className="flex-1 flex flex-col p-3 sm:p-4">
                      {/* Badge */}
                      {/* <div className="mb-2">
                        <span className="inline-block text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          NEW DROP
                        </span>
                      </div> */}

                      {/* Title */}
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2">
                        {item.name}
                      </h3>

                      {/* Selected Variations - Display if any */}
                      {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                        <div className="mb-2 text-xs sm:text-sm">
                          {Object.entries(item.selectedVariations).map(([type, variation]) => (
                            <div key={type} className="flex gap-2 text-gray-700">
                              <span className="font-semibold capitalize text-gray-900">{type}:</span>
                              <span>{variation.variation_value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-2">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-lg sm:text-xl font-bold text-black">
                            ₹{Math.round(item.price)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            ₹{Math.round(item.price * 1.2)}
                          </span>
                          <span className="text-xs font-bold text-green-600">
                            {Math.round(((item.price * 1.2 - item.price) / (item.price * 1.2)) * 100)}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Lowest price in 30 days</p>
                      </div>

                      {/* Variations/Details - if available */}
                      {item.variations && Object.keys(item.variations).length > 0 && (
                        <div className="mb-2 text-xs sm:text-sm space-y-1">
                          {Object.entries(item.variations).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="font-semibold text-gray-700 capitalize">
                                {key}:
                              </span>
                              <span className="text-gray-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Return/Stock Info */}
                      {/* <div className="flex flex-col gap-1 text-xs mb-3 text-gray-600">
                        <p>📦 14 days return available</p>
                        <p className="text-red-600 font-semibold">⚠️ 1 items left</p>
                      </div> */}

                      {/* Quantity Selector and Remove Button */}
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-3 w-3 text-gray-600" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.id,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-10 text-center font-semibold text-gray-900 focus:outline-none border border-gray-300 bg-white rounded py-1 text-xs"
                          min="1"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-3 w-3 text-gray-600" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto px-3 py-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded transition-all font-medium text-xs flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-auto text-xs sm:text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-bold text-gray-900">
                          ₹{(Number(item.price) * Number(item.quantity)).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary - Sticky sidebar on desktop, below on mobile */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-20">
                <h3 className="text-lg font-bold text-gray-900 mb-4 sm:mb-6">
                  Order Summary
                </h3>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span className="font-semibold text-gray-900">₹{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold text-gray-900">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 sm:pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl sm:text-3xl font-bold text-black">
                      ₹{total.toFixed(0)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full px-4 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-900 transition-all mb-3 text-sm sm:text-base"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate("/shop")}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all text-sm sm:text-base"
                >
                  Continue Shopping
                </button>

                {items.length > 0 && (
                  <button
                    onClick={() => clearCart()}
                    className="w-full px-4 py-2 text-gray-500 text-xs sm:text-sm hover:text-red-600 transition-colors mt-3 sm:mt-4"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
