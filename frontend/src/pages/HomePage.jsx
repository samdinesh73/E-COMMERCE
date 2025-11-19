import React from "react";
import HeroSection from "../components/sections/HeroSection";
import CategoriesSection from "../components/sections/CategoriesSection";
import RecentProducts from "../components/sections/RecentProducts";

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <RecentProducts />
    </div>
  );
}
