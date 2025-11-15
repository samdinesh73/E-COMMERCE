import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HeroSection from "./components/sections/HeroSection";
import ProductList from "./components/sections/ProductList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import LoginSignup from "./pages/LoginSignup";
import MyAccount from "./pages/MyAccount";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-white text-black">
            <Navbar />
            <main className="px-4 py-6">
              <Routes>
                <Route path="/" element={<Shop />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<LoginSignup />} />
                <Route path="/myaccount" element={<MyAccount />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

