import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import HomePage from "./pages/HomePage";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import LoginSignup from "./pages/LoginSignup";
import MyAccount from "./pages/MyAccount";
import Wishlist from "./pages/Wishlist";
import CategoryPage from "./pages/CategoryPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrderDetail from "./pages/admin/OrderDetail";
import UserDetail from "./pages/admin/UserDetail";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen bg-white text-black">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/order/:orderId"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <OrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/user/:userId"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <UserDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<LoginSignup />} />
                  <Route path="/myaccount" element={<MyAccount />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;