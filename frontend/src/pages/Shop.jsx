import React from "react";
import ProductList from "../components/sections/ProductList";

export default function Shop() {
  return (
    <div className="min-h-screen bg-white py-10">
      <div className="container-app">
        <h1 className="text-3xl font-bold mb-6">Shop</h1>
        <p className="text-gray-700 mb-6">Browse all available products below.</p>
        <ProductList />
      </div>
    </div>
  );
}
