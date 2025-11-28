import React from "react";
import { NAVIGATION_LINKS, API_BASE_URL } from "../../constants/config";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { ShoppingCart, Menu, X, Heart, LogOut, Settings, Home, ShoppingBag, User, Compass } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import LordIcon from "../ui/LordIcon";
import SideDrawer from "./SideDrawer";
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
  const [showHeader, setShowHeader] = React.useState(true);
  const [isDesktop, setIsDesktop] = React.useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
  const location = useLocation();
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path) => location.pathname === path;

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      if (window.innerWidth < 768) setShowHeader(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (!isDesktop) return;

    const lastY = { value: window.scrollY };

    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY.value && currentY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastY.value = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDesktop]);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className={`w-full bg-white/70 backdrop-blur-md border-b border-white/20 hidden md:block sticky top-0 z-40 transition-opacity duration-300 ${showHeader ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Breadcrumb + Hamburger */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button */}
              <button
                className="p-2 text-gray-700 hover:text-black hover:bg-white/40 rounded-lg transition-all duration-300"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Breadcrumb */}
              {/* <div className="flex items-center gap-2 text-sm text-gray-600 min-w-fit">
                <Link to="/" className="hover:text-black transition-colors">Home</Link>
                {location.pathname !== "/" && (
                  <>
                    <span>/</span>
                    <span className="text-gray-900 font-medium capitalize">
                      {location.pathname.split("/")[1].replace(/([A-Z])/g, " $1")}
                    </span>
                  </>
                )}
              </div> */}
            </div>

            {/* Center: Logo */}
            <Link to="/" className="flex items-center gap-3 group absolute left-1/2 -translate-x-1/2">
              <img src="./assets/img/1114.jpg" alt="Logo" className="h-12 w-auto object-contain" />
            </Link>

            {/* Right Section: Wishlist, Cart & Auth */}
            <div className="flex items-center gap-4">
              {/* Wishlist Icon */}
              <Link 
                to="/wishlist" 
                className="relative p-2 text-gray-700 hover:text-black hover:bg-white/40 rounded-lg transition-all duration-300 group"
                title="Wishlist"
              >
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link 
                to="/cart" 
                className="relative p-2 text-gray-700 hover:text-black hover:bg-white/40 rounded-lg transition-all duration-300 group"
                title="Cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Auth Section with Avatar Dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-black transition-all border border-gray-300">
                      {user?.avatar ? (
                        // If avatar looks like an image path or url, show it; if it's emoji, show as fallback
                        (typeof user.avatar === 'string' && (user.avatar.startsWith('http') || user.avatar.startsWith('/') || user.avatar.includes('uploads') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(user.avatar))) ? (
                          <AvatarImage src={user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`}`} />
                        ) : (
                          <AvatarFallback className="bg-white text-3xl text-center">{user.avatar}</AvatarFallback>
                        )
                      ) : (
                        <>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`} />
                          <AvatarFallback className="bg-black text-white font-semibold">{getInitials(user.name)}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 z-[999]">
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
              {user?.role === 'admin' && (
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-20 px-2">
          <button 
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group text-gray-600 hover:bg-gray-100"
          >
            <Compass className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
            <span className="text-xs font-medium mt-1">Explore</span>
          </button>
          
          {/* Shop */}
          <Link 
            to="/shop" 
            onClick={scrollToTop}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group ${
              isActive('/shop') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className={`h-6 w-6 transition-all duration-300 group-hover:scale-110 ${isActive('/shop') ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-medium mt-1">Shop</span>
          </Link>

          {/* Home */}
          <Link 
            to="/" 
            onClick={scrollToTop}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group ${
              isActive('/') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className={`h-6 w-6 transition-all duration-300 group-hover:scale-110 ${isActive('/') ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>
 

          {/* Wishlist */}
          <Link 
            to="/wishlist" 
            onClick={scrollToTop}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group relative ${
              isActive('/wishlist') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className={`h-6 w-6 transition-all duration-300 group-hover:scale-110 ${isActive('/wishlist') ? 'animate-bounce' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
            <span className="text-xs font-medium mt-1">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link 
            to="/cart" 
            onClick={scrollToTop}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group relative ${
              isActive('/cart') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart className={`h-6 w-6 transition-all duration-300 group-hover:scale-110 ${isActive('/cart') ? 'animate-bounce' : ''}`} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
            <span className="text-xs font-medium mt-1">Cart</span>
          </Link>

          {/* Categories/Browse */}
          

          {/* Account/Explore */}
          {user ? (
            <Link 
              to="/myaccount" 
              onClick={scrollToTop}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group ${
                isActive('/myaccount') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className={`h-6 w-6 transition-all duration-300 group-hover:scale-110 ${isActive('/myaccount') ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-medium mt-1">Account</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              onClick={scrollToTop}
              className="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group text-gray-600 hover:bg-gray-100"
            >
              <User className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
              <span className="text-xs font-medium mt-1">Sign In</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Add padding to body to prevent content overlap with bottom nav on mobile */}
      <style>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 80px;
          }
        }
      `}</style>

      {/* Side Drawer for Categories */}
      <SideDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}