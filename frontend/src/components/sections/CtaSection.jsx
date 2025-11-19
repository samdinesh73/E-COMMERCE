import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart, Zap, Shield, Truck } from "lucide-react";

export default function CtaSection() {
  return (
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
  )};