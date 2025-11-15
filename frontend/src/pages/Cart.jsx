import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageHelper";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const total = getTotalPrice();

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Your cart is empty.</p>
          <button onClick={() => navigate('/shop')} className="mt-4 px-4 py-2 bg-black text-white rounded">Go to Shop</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded">
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">₹ {item.price}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-1 border">-</button>
                      <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border px-2 py-1" />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-600">Remove</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹ {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold text-black text-lg mb-4">
              <span>Total</span>
              <span>₹ {total.toFixed(2)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full px-4 py-2 bg-black text-white rounded mb-2">Proceed to Checkout</button>
            <button onClick={() => clearCart()} className="w-full px-4 py-2 border rounded">Clear Cart</button>
          </aside>
        </div>
      )}
    </div>
  );
}
