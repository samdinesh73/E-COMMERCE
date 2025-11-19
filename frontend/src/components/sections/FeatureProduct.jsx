import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart, Zap, Shield, Truck } from "lucide-react";

export default function FeatureProduct() {
  return (
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
  )}