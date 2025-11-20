import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart, Zap, Shield, Truck } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white text-black">
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
                    {/* <ShoppingCart className="h-24 w-24 text-blue-400" /> */}
                    <img src="../assets/img/heroimage.jpg" alt="" />
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
     
     

    
    </div>
  );
}
