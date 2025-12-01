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
import ColorManager from "../../components/admin/ColorManager";
import CouponManager from "../../components/admin/CouponManager";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "../../components/ui";
import {
  Plus,
  List,
  Edit2,
  Trash2,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Loader,
  AlertCircle,
  Tag,
  Palette,
  Ticket,
  Home,
} from "lucide-react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/orders/admin/all-orders`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/users/admin/all-users`).catch(() => ({ data: [] }))
        ]);

        const totalRevenue = (ordersRes.data || []).reduce((sum, order) => {
          return sum + parseFloat(order.total_amount || order.amount || 0);
        }, 0);

        setStats({
          totalProducts: productsRes.data.length || 0,
          totalOrders: ordersRes.data.length || 0,
          totalUsers: usersRes.data.length || 0,
          revenue: totalRevenue
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "create", label: "Create Product", icon: Plus },
    { id: "list", label: "All Products", icon: List },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "colors", label: "Colors", icon: Palette },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "users", label: "Users", icon: Users },
    { id: "edit", label: "Edit Product", icon: Edit2 },
    { id: "delete", label: "Delete Product", icon: Trash2 }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your store products, orders, and users
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              ← Back to Store
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Products */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Total Products
                    </CardTitle>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.totalProducts}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Products in your catalog
                    </p>
                  </CardContent>
                </Card>

                {/* Total Orders */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Total Orders
                    </CardTitle>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.totalOrders}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Orders received
                    </p>
                  </CardContent>
                </Card>

                {/* Total Users */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Total Users
                    </CardTitle>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.totalUsers}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Registered users
                    </p>
                  </CardContent>
                </Card>

                {/* Revenue */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Total Revenue
                    </CardTitle>
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      ₹{stats.revenue.toFixed(2)}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Total revenue earned
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Access frequently used features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setTab("create")}
                    className="justify-start h-auto py-4 flex-col items-start gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Add Product</div>
                      <div className="text-xs opacity-75">
                        Create a new product
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTab("list")}
                    className="justify-start h-auto py-4 flex-col items-start gap-2"
                  >
                    <List className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">View Products</div>
                      <div className="text-xs opacity-75">
                        See all products
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTab("orders")}
                    className="justify-start h-auto py-4 flex-col items-start gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">View Orders</div>
                      <div className="text-xs opacity-75">
                        Manage orders
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTab("coupons")}
                    className="justify-start h-auto py-4 flex-col items-start gap-2"
                  >
                    <Ticket className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Manage Coupons</div>
                      <div className="text-xs opacity-75">
                        Create discounts
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other Tabs */}
        {tab !== "dashboard" && (
          <Card>
            <CardHeader>
              <CardTitle>{tabs.find((t) => t.id === tab)?.label}</CardTitle>
              <CardDescription>
                Manage and organize your store content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Product Tabs */}
              {(tab === "create" ||
                tab === "list" ||
                tab === "edit" ||
                tab === "delete") && (
                <div className="space-y-6">
                  {tab === "create" && <ProductUploadForm />}
                  {tab === "list" && (
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
                </div>
              )}

              {/* Category Manager */}
              {tab === "categories" && <CategoryManager />}

              {/* Color Manager */}
              {tab === "colors" && <ColorManager />}

              {/* Coupon Manager */}
              {tab === "coupons" && <CouponManager />}

              {/* User List */}
              {tab === "users" && <UserList />}

              {/* Orders */}
              {tab === "orders" && (
                <div className="space-y-4">
                  <OrderList />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Popup for Edit and Delete */}
      {selected && (tab === "edit" || tab === "delete") && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto rounded-lg">
            {tab === "edit" && (
              <EditProductForm 
                product={selected} 
                onSaved={() => setTab("list")}
                onCancel={() => setTab("list")}
              />
            )}
            {tab === "delete" && (
              <DeleteProductConfirm 
                product={selected}
                onDeleted={() => setTab("list")}
                onCancel={() => setTab("list")}
              />
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation - Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-3 scrollbar-hide">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <Button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  variant={isActive ? "default" : "ghost"}
                  className={`flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed navigation */}
      <div className="h-24" />
    </div>
  );
}
