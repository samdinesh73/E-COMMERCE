import React from "react";

export default function HeroSection() {
  return (
    <section className="relative bg-white text-black py-20">
      {/* Content */}
      <div className="container-app relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-slide-down">
          Welcome to ShopDB
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto text-gray-700">
          Discover premium products presented simply and clearly.
        </p>
        <button className="px-8 py-3 border border-black text-black font-bold rounded-full hover:bg-black hover:text-white transition-all duration-200">
          Shop Now
        </button>
      </div>
    </section>
  );
}
