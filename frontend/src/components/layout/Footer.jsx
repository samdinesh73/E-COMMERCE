import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white text-black mt-auto border-t border-gray-100 mt-10">
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* About Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4">About Us</h4>
            <p className="text-gray-700 mb-4">
              Premium fashion apparel delivered with excellence. Your trusted online destination for quality and style.
            </p>
            <Link to="/about-us" className="text-gray-900 font-semibold hover:underline">
              Learn More →
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-700">
              <li><Link to="/" className="hover:underline hover:text-gray-900">Home</Link></li>
              <li><Link to="/shop" className="hover:underline hover:text-gray-900">Shop</Link></li>
              <li><Link to="/about-us" className="hover:underline hover:text-gray-900">About</Link></li>
              <li><Link to="/contact-us" className="hover:underline hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-700">
              <li><Link to="/how-to-return" className="hover:underline hover:text-gray-900">Returns</Link></li>
              <li><Link to="/privacy-policy" className="hover:underline hover:text-gray-900">Privacy</Link></li>
              <li><Link to="/terms-conditions" className="hover:underline hover:text-gray-900">Terms</Link></li>
              <li><Link to="/contact-us" className="hover:underline hover:text-gray-900">Help</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="text-gray-700 mb-3">
              📧 support@fashionhub.com<br />
              📞 +91 123-456-7890
            </p>
            <Link to="/contact-us" className="inline-block px-4 py-2 border border-gray-900 rounded hover:bg-gray-900 hover:text-white transition-colors text-sm font-semibold">
              Get in Touch
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center text-gray-600">
          <p>&copy; 2025 FashionHub. All rights reserved. | Made with ❤️</p>
        </div>
      </div>
    </footer>
  );
}
