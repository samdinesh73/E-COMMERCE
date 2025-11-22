import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageHelper";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";

// Simple helper to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.querySelector("script[data-razorpay]") || window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.setAttribute("data-razorpay", "1");
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("cod");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "" });
  const [isGuest, setIsGuest] = useState(!token);
  const total = getTotalPrice();

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const saveOrder = async (paymentMethod) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add auth header if user is logged in
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          total_price: total,
          shipping_address: form.address,
          city: form.city,
          pincode: form.pincode,
          payment_method: paymentMethod,
          // For authenticated users
          ...(token && {
            full_name: form.name,
            email: form.email,
            phone: form.phone,
          }),
          // For guest users
          ...(!token && {
            guest_name: form.name,
            guest_email: form.email,
            phone: form.phone,
          }),
          items,
        }),
      });

      if (!resp.ok) throw new Error("Failed to save order");
      return await resp.json();
    } catch (err) {
      console.error("Save order error:", err);
      throw err;
    }
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      await saveOrder("cod");
      clearCart();
      alert("Order placed successfully with Cash on Delivery!");
      navigate("/myaccount");
    } catch (err) {
      alert("Failed to place COD order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      console.log('📋 Creating Razorpay order...');
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.PAYMENTS_RAZORPAY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(total * 100) }),
      });
      
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || `Server error: ${resp.status}`);
      }

      const data = await resp.json();

      if (!data.id) {
        throw new Error("Invalid order data from server");
      }

      console.log(`✅ Order created: ${data.id}`);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Unable to load Razorpay script");
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "",
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ShopDB",
        description: "Order Payment",
        order_id: data.id,
        handler: async function (response) {
          try {
            console.log('💳 Payment received from Razorpay:', response.razorpay_payment_id);
            
            // Verify payment signature on backend
            const verifyResp = await fetch(`${API_BASE_URL}${ENDPOINTS.PAYMENTS_RAZORPAY_VERIFY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResp.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResp.json();
            console.log('✅ Payment verified:', verifyData.payment_id);

            // Save order after successful payment verification
            await saveOrder("razorpay");
            clearCart();
            alert("Payment successful! Order placed.");
            navigate("/myaccount");
          } catch (err) {
            console.error('Payment handler error:', err);
            alert("Payment processing error: " + err.message);
          }
        },
        prefill: {
          name: form.name,
          contact: form.phone,
          email: form.email,
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      alert("Payment initialization failed: " + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      alert("Please fill name, email, phone and address");
      return;
    }

    if (method === "cod") {
      handleCOD();
    } else {
      handleRazorpay();
    }
  };

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Your cart is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Guest / User Toggle */}
            {!token && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={isGuest} 
                    onChange={(e) => setIsGuest(e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Continue as Guest</span>
                </label>
                <p className="text-xs text-gray-600 mt-2">
                  {isGuest ? "No account needed" : "Sign in to track orders"}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email || ""} 
                  onChange={handleChange} 
                  className="w-full border px-3 py-2 rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="w-full border px-3 py-2 rounded" />
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="w-full border px-3 py-2 rounded" />
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <label className="flex items-center gap-2">
                  <input type="radio" name="method" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} /> Razorpay
                </label>
                <label className="flex items-center gap-2 mt-2">
                  <input type="radio" name="method" checked={method === "cod"} onChange={() => setMethod("cod")} /> Cash on Delivery
                </label>
              </div>

              <div className="mt-6 flex gap-4">
                <button type="submit" disabled={loading} className="px-6 py-3 bg-black text-white rounded">
                  {loading ? "Processing..." : `Pay ₹ ${total.toFixed(2)}`}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border rounded">Back</button>
              </div>
            </form>
          </div>

          <aside className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <img src={getImageUrl(it.image)} alt={it.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
                  </div>
                  <div>₹ {(Number(it.price) * Number(it.quantity)).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹ {total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
