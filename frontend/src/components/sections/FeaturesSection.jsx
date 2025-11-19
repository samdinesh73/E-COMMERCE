import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart, Zap, Shield, Truck } from "lucide-react";

export default function FeaturesSection() {
  return (
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
  )
}

