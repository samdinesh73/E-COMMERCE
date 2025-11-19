import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart, Zap, Shield, Truck } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white text-black">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-20 pb-8 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Experience Shopping
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                  Like Never Before
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-lg leading-relaxed">
                Discover our curated collection of premium products with unbeatable prices. Shop with confidence and enjoy fast delivery.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-8">
              <Link to="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3">
                  <ShoppingCart className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                  Start Shopping
                </Button>
              </Link>
              <Link to="/shop" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3 border-gray-400 hover:bg-gray-100"
                >
                  Browse Catalog
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-300">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-black">10K+</p>
                <p className="text-gray-600 text-xs sm:text-sm">Products</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-black">50K+</p>
                <p className="text-gray-600 text-xs sm:text-sm">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-black">24/7</p>
                <p className="text-gray-600 text-xs sm:text-sm">Support</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Gradient background shapes */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-transparent rounded-3xl opacity-20 blur-3xl"></div>
              
              {/* Product showcase box */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-300 rounded-3xl p-12 space-y-6">
                <div className="space-y-4">
                  <div className="h-64 bg-gradient-to-b from-blue-200 to-blue-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="h-24 w-24 text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-black">Premium Products</h3>
                    <p className="text-gray-600">Handpicked items just for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {/* Feature 1 */}
            <div className="group hover:bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl transition-all duration-300 border border-transparent hover:border-gray-300">
              <div className="flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-lg bg-blue-100 mb-3 sm:mb-4 group-hover:bg-blue-200">
                <Zap className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-black">Fast Checkout</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Complete your purchase in seconds with our streamlined checkout process.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group hover:bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl transition-all duration-300 border border-transparent hover:border-gray-300">
              <div className="flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-lg bg-blue-100 mb-3 sm:mb-4 group-hover:bg-blue-200">
                <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-black">Secure Payment</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Your payment information is encrypted and secure with us.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group hover:bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl transition-all duration-300 border border-transparent hover:border-gray-300">
              <div className="flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-lg bg-blue-100 mb-3 sm:mb-4 group-hover:bg-blue-200">
                <Truck className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-black">Fast Shipping</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Get your orders delivered quickly to your doorstep.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group hover:bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl transition-all duration-300 border border-transparent hover:border-gray-300">
              <div className="flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-lg bg-blue-100 mb-3 sm:mb-4 group-hover:bg-blue-200">
                <ShoppingCart className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-black">Easy Returns</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Not satisfied? Return items hassle-free within 30 days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-black">Trending Now</h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Check out our most popular items this season</p>
        </div>

        {/* Product Cards Placeholder */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="group bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative h-40 sm:h-48 lg:h-64 bg-gradient-to-b from-blue-200 to-blue-100 flex items-center justify-center overflow-hidden">
                <ShoppingCart className="h-12 sm:h-16 lg:h-20 w-12 sm:w-16 lg:w-20 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-black line-clamp-1 text-xs sm:text-sm lg:text-base">Premium Product {item}</h3>
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                  High-quality item with amazing features
                </p>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-black">₹4,999</p>
                  <Button size="sm" className="px-2 sm:px-3 text-xs sm:text-sm">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link to="/shop">
            <Button size="lg" className="px-6 sm:px-8 text-sm sm:text-base">
              View All Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-300 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-black">Stay Updated</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Subscribe to get special offers and updates about new products
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
            />
            <Button className="text-sm sm:text-base px-4 sm:px-6">Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
