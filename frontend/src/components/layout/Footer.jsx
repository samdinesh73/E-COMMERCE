import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white text-black mt-auto border-t border-gray-100">
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* About Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4">About Us</h4>
            <p className="text-gray-700">
              ShopDB is your trusted online shopping destination for quality products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-700">
              <li><a href="#home" className="hover:underline">Home</a></li>
              <li><a href="#products" className="hover:underline">Products</a></li>
              <li><a href="#about" className="hover:underline">About</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4 text-gray-700">
              <a href="#facebook" className="hover:underline">Facebook</a>
              <a href="#twitter" className="hover:underline">Twitter</a>
              <a href="#instagram" className="hover:underline">Instagram</a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-700">
              📧 info@shopdb.com<br />
              📞 +91 1234567890
            </p>
          </div>
        </div>

        <div className="pt-6 text-center text-gray-600">
          <p>&copy; 2025 ShopDB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
