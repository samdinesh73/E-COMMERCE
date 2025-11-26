import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants/config";
import { Trash2, AlertCircle, Loader, ShoppingCart, CheckCircle } from "lucide-react";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (from = fromDate, to = toDate) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/orders/admin/all-orders`;
      const params = new URLSearchParams();
      if (from) params.append("fromDate", from);
      if (to) params.append("toDate", to);
      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await axios.get(url);
      setOrders(response.data || []);
      setSelectedOrders(new Set());
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      const allIds = new Set(orders.map((order) => `${order.id}-${order.user_id ? "auth" : "guest"}`));
      setSelectedOrders(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.size === 0) return;

    setDeleting(true);
    setDeleteSuccess(false);

    try {
      const deletePromises = Array.from(selectedOrders).map((orderId) => {
        return axios.delete(`${API_BASE_URL}/orders/${orderId}`);
      });

      await Promise.all(deletePromises);

      setDeleteSuccess(true);
      setShowDeleteConfirm(false);
      setSelectedOrders(new Set());

      // Refresh orders
      setTimeout(() => {
        fetchOrders(fromDate, toDate);
        setDeleteSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Error deleting orders:", err);
      setError(err.response?.data?.error || "Failed to delete orders");
    } finally {
      setDeleting(false);
    }
  };

  const handleFilter = () => {
    fetchOrders(fromDate, toDate);
  };

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    fetchOrders("", "");
  };

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Filter Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Filter
            </button>
            <button
              onClick={handleClearFilter}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {deleteSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-700 font-medium">✓ Orders deleted successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-900">
            {selectedOrders.size} order{selectedOrders.size === 1 ? "" : "s"} selected
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No orders found</p>
          <p className="text-gray-500 text-sm mt-1">Orders will appear here when customers place them</p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && orders.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => {
                const isAuthOrder = order.user_id !== undefined;
                const orderType = isAuthOrder ? "Authenticated" : "Guest";
                const orderId = `${order.id}-${isAuthOrder ? "auth" : "guest"}`;
                const isSelected = selectedOrders.has(orderId);

                return (
                  <tr key={orderId} className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOrder(orderId)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/order/${order.id}`)}
                    >
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.full_name || order.customer_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-xs">
                      {order.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ₹{parseFloat(order.total_amount || order.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          order.status === "completed" || order.status === "success"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending" || order.status === "processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "cancelled" || order.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          isAuthOrder ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {orderType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => navigate(`/admin/order/${order.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {!loading && orders.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
          <p>
            Showing <span className="font-semibold text-gray-900">{orders.length}</span> total orders
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Orders?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {selectedOrders.size} order{selectedOrders.size === 1 ? "" : "s"}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
