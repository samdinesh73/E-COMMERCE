import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../constants/config";
import { ArrowLeft, Loader, AlertCircle, Save, Trash2, Calendar, User, Mail, Phone, MapPin, Package, ShoppingBag } from "lucide-react";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    payment_method: "",
    shipping_address: "",
    city: "",
    pincode: "",
    email: "",
    phone: "",
    full_name: ""
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/admin/order-detail/${orderId}`);
      setOrder(response.data.order);
      setItems(response.data.items || []);
      setFormData({
        status: response.data.order.status || "pending",
        payment_method: response.data.order.payment_method || "",
        shipping_address: response.data.order.shipping_address || "",
        city: response.data.order.city || "",
        pincode: response.data.order.pincode || "",
        email: response.data.order.email || response.data.order.guest_email || "",
        phone: response.data.order.phone || response.data.order.phone_number || "",
        full_name: response.data.order.full_name || response.data.order.guest_name || ""
      });
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/orders/admin/order/${orderId}`, formData);
      setOrder({
        ...order,
        ...formData
      });
      setEditing(false);
      alert("Order updated successfully!");
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/orders/admin/order/${orderId}`);
      alert("Order deleted successfully!");
      navigate("/admin");
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Orders
          </button>
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error || "Order not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Orders
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 sm:px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-gray-600 mt-1">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
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
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Customer Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Name</p>
                      <p className="text-gray-900 font-medium">
                        {order.full_name || order.guest_name || (order.user_id ? "Authenticated User" : "Guest Customer")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Email</p>
                      <p className="text-gray-900 font-medium">{order.email || order.guest_email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Phone</p>
                      <p className="text-gray-900 font-medium">{order.phone || order.phone_number || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Order Summary
                </h2>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Order ID</span>
                    <span className="font-semibold text-gray-900">#{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Amount</span>
                    <span className="font-semibold text-gray-900">₹{parseFloat(order.total_price || order.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Payment Method</span>
                    <span className="font-semibold text-gray-900">{order.payment_method || "-"}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-gray-700 font-medium">Status</span>
                    <span className={`font-semibold ${
                      order.status === "completed" ? "text-green-600" :
                      order.status === "pending" ? "text-yellow-600" :
                      order.status === "cancelled" ? "text-red-600" :
                      "text-blue-600"
                    }`}>
                      {order.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Shipping Information
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-900 font-medium mb-4">{order.shipping_address || "-"}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">City</p>
                    <p className="text-gray-900">{order.city || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Pincode</p>
                    <p className="text-gray-900">{order.pincode || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                Order Items
              </h2>
              {items && items.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Product Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Product ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product_name}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product_id}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">₹{parseFloat(item.price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No items in this order</p>
                </div>
              )}
            </div>

            {/* Edit Form Section */}
            {editing && (
              <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Order</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <input
                        type="text"
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                    <textarea
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    Edit Order
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete Order
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Order?</h3>
              <p className="text-gray-600 mb-6">This action cannot be undone. Are you sure?</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
