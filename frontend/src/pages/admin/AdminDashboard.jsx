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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
  Calendar,
  TrendingDown,
  BarChart3,
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
  const [allOrders, setAllOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/orders/admin/all-orders`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/users/admin/all-users`).catch(() => ({ data: [] }))
        ]);

        const orders = ordersRes.data || [];
        const totalRevenue = orders.reduce((sum, order) => {
          return sum + parseFloat(order.total_amount || order.amount || 0);
        }, 0);

        setStats({
          totalProducts: productsRes.data.length || 0,
          totalOrders: orders.length || 0,
          totalUsers: usersRes.data.length || 0,
          revenue: totalRevenue
        });

        setAllOrders(orders);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Filter orders by date range and generate chart data
  const generateChartData = () => {
    setLoading(true);
    let filtered = allOrders;

    if (startDate || endDate) {
      filtered = allOrders.filter(order => {
        const orderDate = order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : null;
        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        return true;
      });
    }

    // Group by date and calculate stats
    const groupedData = {};
    filtered.forEach(order => {
      const date = order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = { date, orders: 0, revenue: 0 };
      }
      groupedData[date].orders += 1;
      groupedData[date].revenue += parseFloat(order.total_amount || order.amount || 0);
    });

    const data = Object.values(groupedData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        revenue: parseFloat(item.revenue.toFixed(2))
      }));
    setChartData(data);
    setLoading(false);
  };

  // Initialize chart with all data on first render
  useEffect(() => {
    if (allOrders.length > 0) {
      generateChartData();
    }
  }, [allOrders]);

  // Handle date changes
  const handleDateChange = () => {
    generateChartData();
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    const resetData = Object.values(
      allOrders.reduce((acc, order) => {
        const date = order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, orders: 0, revenue: 0 };
        }
        acc[date].orders += 1;
        acc[date].revenue += parseFloat(order.total_amount || order.amount || 0);
        return acc;
      }, {})
    )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        revenue: parseFloat(item.revenue.toFixed(2))
      }));
    setChartData(resetData);
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
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

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div className="space-y-6 pb-24">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                📊 Analytics Dashboard
              </h2>
              <p className="text-slate-600">Track your sales and revenue performance</p>
            </div>

            {/* Date Range Selector */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Filter by Date Range
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={handleDateChange}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md"
                    >
                      Apply Filter
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1 border-slate-200 hover:bg-slate-50"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Cards */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 font-medium mb-1">
                          Total Orders
                        </p>
                        <p className="text-4xl font-bold text-blue-600">
                          {chartData.reduce((sum, day) => sum + day.orders, 0)}
                        </p>
                      </div>
                      <div className="text-5xl opacity-10">📦</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 font-medium mb-1">
                          Total Revenue
                        </p>
                        <p className="text-4xl font-bold text-amber-600">
                          ₹{chartData.reduce((sum, day) => sum + parseFloat(day.revenue), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-5xl opacity-10">💰</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 font-medium mb-1">
                          Avg Revenue/Day
                        </p>
                        <p className="text-4xl font-bold text-green-600">
                          ₹{chartData.length > 0 ? (chartData.reduce((sum, day) => sum + parseFloat(day.revenue), 0) / chartData.length).toFixed(2) : 0}
                        </p>
                      </div>
                      <div className="text-5xl opacity-10">📈</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : chartData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders Trend */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Orders Trend
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Daily order count over selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "2px solid #10b981",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            color: "#1e293b"
                          }}
                          formatter={(value) => [`${value} orders`, "Count"]}
                          labelStyle={{ color: '#1e293b' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: "#10b981", r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
                          name="Orders"
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Revenue Trend */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-amber-600" />
                      Revenue Trend
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Daily revenue (₹) over selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "2px solid #f59e0b",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            color: "#1e293b"
                          }}
                          formatter={(value) => [`₹${value.toFixed(2)}`, "Revenue"]}
                          labelStyle={{ color: '#1e293b' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                          dataKey="revenue"
                          fill="url(#colorRevenue)"
                          name="Revenue (₹)"
                          radius={[12, 12, 0, 0]}
                          isAnimationActive={true}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-lg text-slate-600 font-medium">
                    No orders found for the selected date range
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Try adjusting your date filters or check back later
                  </p>
                </CardContent>
              </Card>
            )}
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
