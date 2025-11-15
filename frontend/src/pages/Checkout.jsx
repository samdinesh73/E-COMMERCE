import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageHelper";

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
  const [method, setMethod] = useState("razorpay");
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", pincode: "" });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const total = getTotalPrice();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const saveOrder = async (paymentMethod) => {
    try {
      const resp = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          total_price: total,
          shipping_address: form.address,
          city: form.city,
          pincode: form.pincode,
          payment_method: paymentMethod,
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
      // 1) Call backend to create Razorpay order
      const resp = await fetch(`${API_URL}/payments/razorpay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(total * 100) }), // amount in paise
      });
      if (!resp.ok) throw new Error("Failed to create payment order");
      const data = await resp.json();

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Unable to load Razorpay script. Please try again later.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || data.key || "",
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ShopDB",
        description: "Order Payment",
        order_id: data.id,
        handler: async function (response) {
          try {
            // Save order after successful payment
            await saveOrder("razorpay");
            clearCart();
            alert("Payment successful! Order placed.");
            navigate("/myaccount");
          } catch (err) {
            alert("Payment successful but failed to save order: " + err.message);
          }
        },
        prefill: {
          name: form.name,
          contact: form.phone,
        },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill name, phone and address");
      return;
    }

    if (method === "cod") {
      handleCOD();
    } else {
      handleRazorpay();
    }
  };

  if (!token) {
    return null; // Redirect handled by useEffect
  }

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
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
