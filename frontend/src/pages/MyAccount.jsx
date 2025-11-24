import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";
import { ChevronDown } from "lucide-react";

export default function MyAccount() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await resp.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!token) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="container-app py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <button onClick={handleLogout} className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800">
          Logout
        </button>
      </div>

      {/* User Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-semibold">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">User ID</label>
              <p className="font-semibold text-sm text-gray-500">#{user?.id}</p>
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-2 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === "pending").length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                ₹ {orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>

        {loading && <p className="text-center py-8 text-gray-600">Loading orders...</p>}

        {error && <p className="text-center py-8 text-red-600">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No orders yet.</p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Order Header - Clickable to expand */}
                <button
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  className="w-full px-4 py-4 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex-1 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Order ID</p>
                        <p className="font-semibold">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Date</p>
                        <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Amount</p>
                        <p className="font-semibold">₹ {Number(order.total_price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Payment</p>
                        <p className="font-semibold capitalize">{order.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Status</p>
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-600 transition-transform ${
                      expandedOrderId === order.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Order Details - Expanded View */}
                {expandedOrderId === order.id && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-4">
                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-700">
                        {order.shipping_address}, {order.city} - {order.pincode}
                      </p>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Items</h4>
                      <div className="space-y-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold">{item.name}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold">₹ {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                              </div>

                              {/* Show Variations if present */}
                              {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Variations:</p>
                                  <div className="space-y-1">
                                    {Object.entries(item.selectedVariations).map(([type, variation]) => (
                                      <div key={type} className="text-xs text-gray-600">
                                        <span className="font-medium">{type}:</span> {variation.variation_value || variation.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">No items in this order</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
