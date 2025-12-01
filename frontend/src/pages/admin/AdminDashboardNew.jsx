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
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
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
  BarChart3,
  Home,
} from "lucide-react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
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
          axios.get(`${API_BASE_URL}/orders/admin/all-orders`).catch(() => ({
            data: [],
          })),
          axios.get(`${API_BASE_URL}/users/admin/all-users`).catch(() => ({
            data: [],
          })),
        ]);

        const totalRevenue = (ordersRes.data || []).reduce((sum, order) => {
          return sum + parseFloat(order.total_amount || order.amount || 0);
        }, 0);

        setStats({
          totalProducts: productsRes.data.length || 0,
          totalOrders: ordersRes.data.length || 0,
          totalUsers: usersRes.data.length || 0,
          revenue: totalRevenue,
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
    { id: "delete", label: "Delete Product", icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage your store
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              Back to Store
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Products */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Products in catalog
                  </p>
                </CardContent>
              </Card>

              {/* Total Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Orders
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-slate-600 mt-1">Orders received</p>
                </CardContent>
              </Card>

              {/* Total Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{stats.revenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Total revenue</p>
                </CardContent>
              </Card>
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
                    variant="outline"
                    className="justify-start"
                    onClick={() => setTab("create")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setTab("list")}
                  >
                    <List className="h-4 w-4 mr-2" />
                    View Products
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setTab("orders")}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Orders
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setTab("coupons")}
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Manage Coupons
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
              <CardTitle>
                {tabs.find((t) => t.id === tab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Product Tabs */}
              {(tab === "create" || tab === "list" || tab === "edit" || tab === "delete") && (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full my-8">
            <CardHeader>
              <CardTitle>
                {tab === "edit" ? "Edit Product" : "Delete Product"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tab === "edit" && <EditProductForm product={selected} />}
              {tab === "delete" && (
                <DeleteProductConfirm product={selected} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation - Horizontal Scrollable */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-3">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <Button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  variant={tab === t.id ? "default" : "ghost"}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed navigation */}
      <div className="h-20" />
    </div>
  );
}
