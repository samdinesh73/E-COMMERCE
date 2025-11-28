import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";
import { Loader, ChevronRight } from "lucide-react";

export default function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to load orders");
      const data = await resp.json();
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="container-app py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {loading && (
        <div className="py-12 flex justify-center">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      )}

      {error && (
        <div className="py-8">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="py-8 text-center text-gray-600">No orders found.</div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => navigate(`/order/${order.id}`)}
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
                      <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status && (order.status.charAt(0).toUpperCase() + order.status.slice(1))}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
