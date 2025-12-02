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
  const { items, getTotalPrice, getFinalTotal, getDiscountAmount, appliedCoupon, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("cod");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "", state: "Tamil Nadu", country: "India" });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
    // Fetch addresses if logged in
    useEffect(() => {
      if (token) {
        fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((resp) => resp.json())
          .then((data) => {
            setAddresses(data.addresses || []);
            // Pre-select default address
            if (data.addresses && data.addresses.length > 0) {
              const defaultAddr = data.addresses.find(a => a.is_default) || data.addresses[0];
              setSelectedAddressId(defaultAddr.id);
            }
            // Auto-fill form from user profile
            if (data.user) {
              setForm(f => ({
                ...f,
                name: data.user.name || "",
                email: data.user.email || "",
                phone: data.user.phone || ""
              }));
            }
          });
      }
    }, [token]);
  const [isGuest, setIsGuest] = useState(!token);
  const subtotal = getTotalPrice();
  const discount = getDiscountAmount();
  const total = getFinalTotal();

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Save new address if user has none
  const saveNewAddress = async () => {
    if (!token) return;
    const resp = await fetch(`${API_BASE_URL}/users/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        address_line: form.address,
        city: form.city,
        state: form.state || "Tamil Nadu",
        pincode: form.pincode,
        country: form.country || "India",
        is_default: true,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      setAddresses([data]);
      setSelectedAddressId(data.id);
      setShowAddressForm(false);
      return data.id;
    }
    return null;
  };

  const saveOrder = async (paymentMethod) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add auth header if user is logged in
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Use selected address if available
      let shipping_address = form.address;
      let city = form.city;
      let pincode = form.pincode;
      if (token && addresses.length > 0 && selectedAddressId) {
        const addr = addresses.find(a => a.id === selectedAddressId);
        if (addr) {
          shipping_address = addr.address_line;
          city = addr.city;
          pincode = addr.pincode;
        }
      }
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          total_price: total,
          subtotal: subtotal,
          discount_amount: discount,
          coupon_id: appliedCoupon?.coupon?.id || null,
          shipping_address,
          city,
          pincode,
          payment_method: paymentMethod,
          ...(token && {
            full_name: form.name,
            email: form.email,
            phone: form.phone,
          }),
          ...(!token && {
            guest_name: form.name,
            guest_email: form.email,
            phone: form.phone,
          }),
          items: items.map(item => ({
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            selectedVariations: item.selectedVariations || {}
          })),
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
      const orderData = await saveOrder("cod");
      clearCart();
      navigate("/thank-you", {
        state: {
          order: orderData,
          items: items,
        },
      });
    } catch (err) {
      alert("Failed to place COD order: " + err.message);
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
            const orderData = await saveOrder("razorpay");
            clearCart();
            navigate("/thank-you", {
              state: {
                order: orderData,
                items: items,
              },
            });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      alert("Please fill name, email, phone");
      return;
    }
    // If no addresses, save new address first
    if (token && addresses.length === 0) {
      if (!form.address || !form.city || !form.pincode) {
        alert("Please fill address, city, pincode");
        return;
      }
      const addrId = await saveNewAddress();
      setSelectedAddressId(addrId);
    }
    if (method === "cod") {
      handleCOD();
    } else {
      handleRazorpay();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-app py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
          <button 
            onClick={() => navigate('/cart')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to Cart
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 container-app">
          <div className="inline-block">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add items before checking out</p>
            <button 
              onClick={() => navigate('/shop')}
              className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="container-app py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest / User Toggle */}
              {!token && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isGuest} 
                      onChange={(e) => setIsGuest(e.target.checked)}
                      className="w-5 h-5 accent-black rounded cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900">Continue as Guest</span>
                  </label>
                  <p className="text-xs text-gray-600 mt-2 ml-8">
                    {isGuest ? "✓ Fast checkout without registration" : "Sign in to save addresses & track orders"}
                  </p>
                </div>
              )}

              {/* Address selection logic */}
              {token && addresses.length > 0 && !showAddressForm ? (
                <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  {/* Step 1: Delivery Address */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold">1</span>
                      <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {addresses.map(addr => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                            selectedAddressId === addr.id
                              ? 'border-black bg-black/3 shadow-md'
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                        >
                          {/* Radio Button */}
                          <div className="absolute top-4 right-4">
                            <input 
                              type="radio" 
                              name="selectedAddress" 
                              checked={selectedAddressId === addr.id} 
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="w-5 h-5 accent-black cursor-pointer"
                            />
                          </div>

                          {/* Default Badge */}
                          {addr.is_default && (
                            <span className="inline-block px-3 py-1 bg-black text-white rounded-full text-xs font-bold mb-3 uppercase tracking-wide">Default</span>
                          )}

                          {/* Address Content */}
                          <div className="pr-10">
                            <p className="font-bold text-gray-900">{user?.name}</p>
                            <p className="text-sm text-gray-700 mt-2">{addr.address_line}</p>
                            <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                            <p className="text-xs text-gray-500">{addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setShowAddressForm(true)}
                    className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-900 font-semibold hover:bg-gray-50 transition-colors duration-200"
                  >
                    + Add New Address
                  </button>

                  {/* Step 2: Contact Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold">2</span>
                      <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                        <input 
                          name="name" 
                          value={form.name} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={form.email || ""} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                        <input 
                          name="phone" 
                          value={form.phone} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                          placeholder="+91 00000 00000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Payment Method */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold">3</span>
                      <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200" 
                        style={{borderColor: method === "razorpay" ? '#000' : '#e5e7eb', backgroundColor: method === "razorpay" ? '#f3f4f6' : '#fff'}}>
                        <input 
                          type="radio" 
                          name="method" 
                          checked={method === "razorpay"} 
                          onChange={() => setMethod("razorpay")}
                          className="w-5 h-5 accent-black cursor-pointer"
                        />
                        <span className="ml-3 font-semibold text-gray-900">💳 Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200" 
                        style={{borderColor: method === "cod" ? '#000' : '#e5e7eb', backgroundColor: method === "cod" ? '#f3f4f6' : '#fff'}}>
                        <input 
                          type="radio" 
                          name="method" 
                          checked={method === "cod"} 
                          onChange={() => setMethod("cod")}
                          className="w-5 h-5 accent-black cursor-pointer"
                        />
                        <span className="ml-3 font-semibold text-gray-900">🚚 Cash on Delivery</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 pt-6 flex gap-4">
                    <button 
                      type="submit" 
                      disabled={loading || !selectedAddressId} 
                      className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? "Processing..." : `Place Order • ₹${total.toFixed(2)}`}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => navigate('/cart')} 
                      className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                    >
                      Back
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Address form (shown if no addresses or adding new) */}
              {(!token || addresses.length === 0 || showAddressForm) && (
                <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  {/* Delivery Address Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold">1</span>
                      <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                        <input 
                          name="name" 
                          value={form.name} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                          <input 
                            type="email" 
                            name="email" 
                            value={form.email || ""} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                          <input 
                            name="phone" 
                            value={form.phone} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                            placeholder="+91 00000 00000"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Street Address</label>
                        <textarea 
                          name="address" 
                          value={form.address} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                          placeholder="Enter street address, apartment, etc."
                          rows="3"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                          <input 
                            name="city" 
                            value={form.city} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Pincode</label>
                          <input 
                            name="pincode" 
                            value={form.pincode} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                            placeholder="600000"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">State</label>
                          <input 
                            name="state" 
                            value={form.state} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Country</label>
                          <input 
                            name="country" 
                            value={form.country} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full text-sm font-bold">2</span>
                      <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200" 
                        style={{borderColor: method === "razorpay" ? '#000' : '#e5e7eb', backgroundColor: method === "razorpay" ? '#f3f4f6' : '#fff'}}>
                        <input 
                          type="radio" 
                          name="method" 
                          checked={method === "razorpay"} 
                          onChange={() => setMethod("razorpay")}
                          className="w-5 h-5 accent-black cursor-pointer"
                        />
                        <span className="ml-3 font-semibold text-gray-900">💳 Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200" 
                        style={{borderColor: method === "cod" ? '#000' : '#e5e7eb', backgroundColor: method === "cod" ? '#f3f4f6' : '#fff'}}>
                        <input 
                          type="radio" 
                          name="method" 
                          checked={method === "cod"} 
                          onChange={() => setMethod("cod")}
                          className="w-5 h-5 accent-black cursor-pointer"
                        />
                        <span className="ml-3 font-semibold text-gray-900">🚚 Cash on Delivery</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 pt-6 flex gap-4">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? "Processing..." : `Place Order • ₹${total.toFixed(2)}`}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => showAddressForm ? setShowAddressForm(false) : navigate('/cart')} 
                      className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                    >
                      {showAddressForm ? "Cancel" : "Back"}
                    </button>
                  </div>
                </form>
              )}
          </div>

            {/* Order Summary Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto border-b border-gray-200 pb-6">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-start gap-4">
                      <img 
                        src={getImageUrl(it.image)} 
                        alt={it.name} 
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm line-clamp-2">{it.name}</div>
                        <div className="text-xs text-gray-600 mt-1">Qty: <span className="font-medium">{it.quantity}</span></div>
                        <div className="text-sm font-bold text-gray-900 mt-2">₹{(Number(it.price) * Number(it.quantity)).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm bg-green-50 border border-green-200 p-3 rounded-lg">
                      <span className="text-green-700 font-semibold">Discount ({appliedCoupon?.coupon?.code})</span>
                      <span className="text-green-700 font-bold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-black">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-base leading-none">🔒</span>
                    <span>Secure payment with 256-bit encryption</span>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
