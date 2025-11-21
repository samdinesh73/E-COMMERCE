import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants/config";
import { Loader, AlertCircle, ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingCart, TrendingUp } from "lucide-react";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/admin/user-detail/${userId}`);
      setUserDetail(response.data);
    } catch (err) {
      console.error("Error fetching user detail:", err);
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Users
          </button>
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error || "User not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, orders, totalOrders, totalRevenue } = userDetail;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Users
        </button>

        {/* User Header */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600">User ID: #{user.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900 break-all">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{parseFloat(totalRevenue || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-medium text-gray-900">{new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No orders yet</p>
              <p className="text-gray-500 text-sm mt-1">This user hasn't placed any orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/admin/order/${order.id}`)}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.full_name || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.phone || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-xs">
                        {order.address || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₹{parseFloat(order.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.payment_method || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          order.status === "completed" || order.status === "success"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending" || order.status === "processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "cancelled" || order.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
