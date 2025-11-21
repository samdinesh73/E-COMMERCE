import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants/config";
import ProductUploadForm from "../../components/admin/ProductUploadForm";
import AdminProductList from "../../components/admin/AdminProductList";
import EditProductForm from "../../components/admin/EditProductForm";
import DeleteProductConfirm from "../../components/admin/DeleteProductConfirm";
import UserList from "../../components/admin/UserList";
import CategoryManager from "../../components/admin/CategoryManager";
import { Plus, List, Edit2, Trash2, Package, Users, ShoppingCart, TrendingUp, Loader, AlertCircle, Tag } from "lucide-react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/orders/admin/all-orders`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/users/admin/all-users`).catch(() => ({ data: [] }))
        ]);

        // Calculate revenue from orders
        const totalRevenue = (ordersRes.data || []).reduce((sum, order) => {
          return sum + parseFloat(order.total_amount || order.amount || 0);
        }, 0);

        setStats({
          totalProducts: productsRes.data.length || 0,
          totalOrders: ordersRes.data.length || 0,
          totalUsers: usersRes.data.length || 0,
          revenue: totalRevenue
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    if (tab === "dashboard") {
      fetchStats();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "orders") {
      fetchOrders();
    }
  }, [tab]);

  const fetchOrders = async (from = fromDate, to = toDate) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      // Build query string with optional date filters
      let url = `${API_BASE_URL}/orders/admin/all-orders`;
      const params = new URLSearchParams();
      if (from) params.append("fromDate", from);
      if (to) params.append("toDate", to);
      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await axios.get(url);
      setOrders(response.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrdersError("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "create", label: "Create Product", icon: Plus },
    { id: "list", label: "All Products", icon: List },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "users", label: "Users", icon: Users },
    { id: "edit", label: "Edit Product", icon: Edit2 },
    { id: "delete", label: "Delete Product", icon: Trash2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage your e-commerce store</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            {tabs.map((tabItem) => {
              const Icon = tabItem.icon;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => {
                    setTab(tabItem.id);
                    setSelected(null);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    tab === tabItem.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tabItem.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-medium text-sm">Total Products</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                  </div>
                  <Package className="h-12 w-12 text-blue-100" />
                </div>
                <p className="text-sm text-green-600 mt-4">✓ Active products</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-medium text-sm">Total Orders</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-12 w-12 text-green-100" />
                </div>
                <p className="text-sm text-green-600 mt-4">✓ All time orders</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-medium text-sm">Total Users</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-12 w-12 text-purple-100" />
                </div>
                <p className="text-sm text-gray-600 mt-4">Registered users</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-medium text-sm">Total Revenue</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">₹0</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-orange-100" />
                </div>
                <p className="text-sm text-gray-600 mt-4">This month</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setTab("create")}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <Plus className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-semibold text-gray-900">Create New Product</p>
                  <p className="text-sm text-gray-600 mt-1">Add a new product to your store</p>
                </button>

                <button
                  onClick={() => setTab("list")}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <List className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-semibold text-gray-900">View All Products</p>
                  <p className="text-sm text-gray-600 mt-1">Manage your product inventory</p>
                </button>

                <button
                  onClick={() => setTab("edit")}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <Edit2 className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="font-semibold text-gray-900">Edit Products</p>
                  <p className="text-sm text-gray-600 mt-1">Update product details</p>
                </button>

                <button
                  onClick={() => setTab("delete")}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
                >
                  <Trash2 className="h-6 w-6 text-red-600 mb-2" />
                  <p className="font-semibold text-gray-900">Delete Products</p>
                  <p className="text-sm text-gray-600 mt-1">Remove products from store</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {tab !== "dashboard" && (
          <div className={(tab === "orders" || tab === "users" || tab === "categories") ? "w-full" : "grid grid-cols-1 lg:grid-cols-3 gap-8"}>
            {/* Main Content */}
            <div className={(tab === "orders" || tab === "users" || tab === "categories") ? "w-full" : "lg:col-span-2"}>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                {tab === "create" && <ProductUploadForm />}
                {(tab === "list" || tab === "edit" || tab === "delete") && (
                  <AdminProductList
                    onEdit={(p) => {
                      setSelected(p);
                      setTab("edit");
                    }}
                    onDelete={(p) => {
                      setSelected(p);
                      setTab("delete");
                    }}
                  />
                )}

                {/* Categories Tab */}
                {tab === "categories" && <CategoryManager />}

                {/* Users Tab */}
                {tab === "users" && <UserList />}

                {/* Orders Tab */}
                {tab === "orders" && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">All Orders</h2>
                      <p className="text-gray-600">Orders from authenticated and guest checkouts</p>
                    </div>

                    {/* Date Range Filter */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                          <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                          <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => fetchOrders(fromDate, toDate)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Filter
                          </button>
                          <button
                            onClick={() => {
                              setFromDate("");
                              setToDate("");
                              fetchOrders("", "");
                            }}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    {ordersLoading && (
                      <div className="flex justify-center items-center py-12">
                        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                      </div>
                    )}

                    {ordersError && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-red-700">{ordersError}</p>
                      </div>
                    )}

                    {!ordersLoading && orders.length === 0 && (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No orders yet</p>
                        <p className="text-gray-500 text-sm mt-1">Orders will appear here when customers place them</p>
                      </div>
                    )}

                    {!ordersLoading && orders.length > 0 && (
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Order ID</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Customer Name</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Phone</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Address</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => {
                              // Determine if this is a login_orders or orders table entry
                              const isAuthOrder = order.user_id !== undefined;
                              const orderType = isAuthOrder ? "Authenticated" : "Guest";
                              
                              return (
                                <tr 
                                  key={`${orderType}-${order.id}`} 
                                  onClick={() => navigate(`/admin/order/${order.id}`)}
                                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {order.full_name || order.customer_name || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-xs">
                                    {order.email || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {order.phone || order.phone_number || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-xs">
                                    {order.address || order.shipping_address || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                    ₹{parseFloat(order.total_amount || order.amount || 0).toFixed(2)}
                                  </td>
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
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                      isAuthOrder 
                                        ? "bg-blue-100 text-blue-700" 
                                        : "bg-gray-100 text-gray-700"
                                    }`}>
                                      {orderType}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {!ordersLoading && orders.length > 0 && (
                      <div className="mt-4 text-sm text-gray-600">
                        <p>Showing <span className="font-semibold text-gray-900">{orders.length}</span> total orders</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Only show for product management tabs */}
            {tab !== "orders" && (
              <div>
                {tab === "edit" && selected && (
                  <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Product</h3>
                    <EditProductForm
                      product={selected}
                      onSaved={(updated) => {
                        setSelected(updated);
                      }}
                      onCancel={() => setSelected(null)}
                    />
                  </div>
                )}

                {tab === "delete" && selected && (
                  <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Product</h3>
                    <DeleteProductConfirm
                      product={selected}
                      onDeleted={() => {
                        setSelected(null);
                        setTab("list");
                      }}
                      onCancel={() => setSelected(null)}
                    />
                  </div>
                )}

                {!selected && (tab === "edit" || tab === "delete") && (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <p className="text-sm text-gray-600">
                      Select a product from the list to {tab === "edit" ? "edit" : "delete"} it
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
