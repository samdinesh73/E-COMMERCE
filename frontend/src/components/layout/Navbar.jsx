import React from "react";
import { NAVIGATION_LINKS } from "../../constants/config";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { ShoppingCart, Menu, X, Heart, LogOut, Settings, Home, ShoppingBag, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const cart = useCart();
  const { user, logout } = useAuth();
  const { getWishlistCount } = useWishlist();
  const totalItems = cart.getTotalItems();
  const wishlistCount = getWishlistCount();

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-bold text-white group-hover:shadow-lg transition-all duration-300">
              S
            </div>
            <span className="text-2xl font-black text-black tracking-tight group-hover:text-gray-700 transition-colors duration-300">
              Sellerrocket
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link to="/shop" className="px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Shop
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-all duration-300 font-bold text-sm flex items-center gap-2 border border-gray-300">
                ⚙️ Admin
              </Link>
            )}
          </div>

          {/* Right Section: Cart & Auth */}
          <div className="flex items-center gap-3">
            {/* Wishlist Button */}
            <Link 
              to="/wishlist" 
              className="relative px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-300 flex items-center gap-2 group font-medium text-sm"
            >
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="ml-2 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full group-hover:shadow-lg transition-all duration-300">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link 
              to="/cart" 
              className="relative px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-black transition-all duration-300 flex items-center gap-2 group font-medium text-sm"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="ml-2 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full group-hover:shadow-lg transition-all duration-300">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Section with Avatar Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-black transition-all border border-gray-300">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                    <AvatarFallback className="bg-black text-white font-semibold">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200">
                  <DropdownMenuLabel className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-black leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-gray-600">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem asChild>
                    <Link to="/myaccount" className="flex items-center cursor-pointer text-gray-700 hover:text-black hover:bg-gray-50">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/myaccount" className="flex items-center cursor-pointer text-gray-700 hover:text-black hover:bg-gray-50">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-md text-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200 pt-4">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)} 
              className="block px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link 
              to="/shop" 
              onClick={() => setIsOpen(false)} 
              className="block px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop
            </Link>
            <Link 
              to="/wishlist" 
              onClick={() => setIsOpen(false)} 
              className="block px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Wishlist
              {wishlistCount > 0 && (
                <span className="ml-2 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {user?.role === "admin" && (
              <Link 
                to="/admin" 
                onClick={() => setIsOpen(false)} 
                className="block px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-all duration-300 font-bold border border-gray-300"
              >
                ⚙️ Admin
              </Link>
            )}
            {user && (
              <Link 
                to="/myaccount" 
                onClick={() => setIsOpen(false)} 
                className="block px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                My Account
              </Link>
            )}
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}