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
import OrderList from "../../components/admin/OrderList";
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
          <div className={(tab === "orders" || tab === "users" || tab === "categories") ? "w-full" : "w-full"}>
            {/* Main Content */}
            <div className="w-full">
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
                      <p className="text-gray-600">Manage orders from authenticated and guest checkouts</p>
                    </div>

                    <OrderList />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Popup for Edit and Delete */}
        {selected && (tab === "edit" || tab === "delete") && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
                <h3 className="text-xl font-bold text-gray-900">
                  {tab === "edit" ? "Edit Product" : "Delete Product"}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {tab === "edit" && selected && (
                  <EditProductForm
                    product={selected}
                    onSaved={(updated) => {
                      setSelected(updated);
                    }}
                    onCancel={() => setSelected(null)}
                  />
                )}

                {tab === "delete" && selected && (
                  <DeleteProductConfirm
                    product={selected}
                    onDeleted={() => {
                      setSelected(null);
                      setTab("list");
                    }}
                    onCancel={() => setSelected(null)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
