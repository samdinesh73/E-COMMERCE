import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";

export default function MyAccount() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Payment Method</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Address</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">#{order.id}</td>
                    <td className="py-3 px-4">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold">₹ {Number(order.total_price).toFixed(2)}</td>
                    <td className="py-3 px-4 capitalize">{order.payment_method}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {order.city}, {order.pincode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
