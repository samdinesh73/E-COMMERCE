import React from "react";
import { NAVIGATION_LINKS } from "../../constants/config";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { ShoppingCart, Menu, X, Heart } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const cart = useCart();
  const { user } = useAuth();
  const { getWishlistCount } = useWishlist();
  const totalItems = cart.getTotalItems();
  const wishlistCount = getWishlistCount();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-black hover:text-gray-600 transition-colors">
            <span></span>
            <span>Sellerrocket</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
              Home
            </Link>
            <Link to="/shop" className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
              Shop
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors font-semibold text-red-600 hover:text-red-700">
                Admin
              </Link>
            )}
          </div>

          {/* Right Section: Cart & Auth */}
          <div className="flex items-center gap-4">
            {/* Wishlist Button */}
            <Link 
              to="/wishlist" 
              className="relative px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center gap-2 group"
            >
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full group-hover:bg-red-700">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link 
              to="/cart" 
              className="relative px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center gap-2 group"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="ml-2 bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full group-hover:bg-gray-800">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Links */}
            {user ? (
              <Link 
                to="/myaccount" 
                className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors truncate max-w-[120px]"
              >
                {user.name}
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)} 
              className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              onClick={() => setIsOpen(false)} 
              className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            >
              Shop
            </Link>
            <Link 
              to="/wishlist" 
              onClick={() => setIsOpen(false)} 
              className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Heart className="h-5 w-5" />
              Wishlist
              {wishlistCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {user?.role === "admin" && (
              <Link 
                to="/admin" 
                onClick={() => setIsOpen(false)} 
                className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors font-semibold text-red-600 hover:text-red-700"
              >
                Admin
              </Link>
            )}
            {user && (
              <Link 
                to="/myaccount" 
                onClick={() => setIsOpen(false)} 
                className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                My Account
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}