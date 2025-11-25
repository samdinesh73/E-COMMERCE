import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageHelper";
import { X, Minus, Plus, Trash2 } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const total = getTotalPrice();

  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-lg text-gray-600 mb-6">Your cart is empty.</p>
            <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-semibold">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all group">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "assets/img/placeholder.png";
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-gray-900 truncate line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-bold text-black">
                          ₹{Math.round(item.price)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          ₹{Math.round(item.price * 1.2)}
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="inline-flex items-center bg-white border border-gray-300 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                          >
                            <Minus className="h-3 w-3 text-gray-600" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="w-10 text-center font-semibold text-gray-900 focus:outline-none border-0 bg-transparent text-sm"
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                          >
                            <Plus className="h-3 w-3 text-gray-600" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex flex-col items-end justify-center">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(Number(item.price) * Number(item.quantity)).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-20">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-black">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full px-4 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-900 transition-all mb-3"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/shop')}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all"
                >
                  Continue Shopping
                </button>

                {items.length > 0 && (
                  <button
                    onClick={() => clearCart()}
                    className="w-full px-4 py-2 text-gray-500 text-sm hover:text-red-600 transition-colors mt-4"
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
