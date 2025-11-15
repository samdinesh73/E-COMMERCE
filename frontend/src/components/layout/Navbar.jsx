import React from "react";
import { NAVIGATION_LINKS } from "../../constants/config";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const cart = useCart();
  const { user } = useAuth();
  const totalItems = cart.getTotalItems();

  return (
    <nav className="sticky top-0 z-50 bg-white text-black border-b border-gray-200">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 text-2xl font-bold cursor-pointer">
            <span>🛍️</span>
            <span>SellerRocket</span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {NAVIGATION_LINKS.map((link) => (
              <li key={link.label}>
                {link.href.startsWith("/") && !link.href.includes("#") ? (
                  <Link to={link.href} className="hover:opacity-80 transition-opacity duration-300">{link.label}</Link>
                ) : (
                  <a href={link.href} className="hover:opacity-80 transition-opacity duration-300">{link.label}</a>
                )}
              </li>
            ))}
            <li>
              <Link to="/admin" className="hover:opacity-80 transition-opacity duration-300">Admin</Link>
            </li>
          </ul>

          {/* Right Section: Cart & Auth */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Link to="/cart" className="px-4 py-2 bg-white text-black border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">
              🛒 Cart ({totalItems})
            </Link>

            {/* Auth Links */}
            {user ? (
              <Link to="/myaccount" className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200">
                {user.name}
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-xl"
              onClick={() => setIsOpen(!isOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <ul className="md:hidden pb-4 flex flex-col gap-2">
            {NAVIGATION_LINKS.map((link) => (
              <li key={link.label}>
                {link.href.startsWith("/") && !link.href.includes("#") ? (
                  <Link to={link.href} onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-100 rounded transition-colors duration-200">{link.label}</Link>
                ) : (
                  <a href={link.href} onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-100 rounded transition-colors duration-200">{link.label}</a>
                )}
              </li>
            ))}
            <li>
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-100 rounded transition-colors duration-200">Admin</Link>
            </li>
            <li>
              {user ? (
                <Link to="/myaccount" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-100 rounded transition-colors duration-200">My Account</Link>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-100 rounded transition-colors duration-200">Sign In</Link>
              )}
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

