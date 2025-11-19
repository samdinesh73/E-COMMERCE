import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageHelper";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const total = getTotalPrice();

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center border border-gray-200">
            <p className="text-base sm:text-lg text-gray-600 mb-6">Your cart is empty.</p>
            <button onClick={() => navigate('/shop')} className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">Go to Shop</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">₹ {item.price}</p>
                      <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1 border border-gray-300 rounded-lg w-fit">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-1 text-sm hover:bg-gray-100">−</button>
                          <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))} className="w-12 text-center border-0 bg-transparent text-sm" />
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-sm hover:bg-gray-100">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium">Remove</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">₹ {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="p-4 sm:p-6 border border-gray-200 rounded-lg bg-white h-fit sticky top-4">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Order Summary</h3>
              <div className="flex justify-between mb-2 text-sm sm:text-base">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 text-sm sm:text-base border-b border-gray-200 pb-4">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base sm:text-lg mb-6">
                <span>Total</span>
                <span>₹ {total.toFixed(2)}</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-2 font-medium text-sm sm:text-base">Proceed to Checkout</button>
              <button onClick={() => clearCart()} className="w-full px-4 py-2 sm:py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base">Clear Cart</button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
