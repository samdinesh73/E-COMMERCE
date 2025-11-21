import React from "react";
import HeroSection from "../components/sections/HeroSection";
import CategoriesSection from "../components/sections/CategoriesSection";
import RecentProducts from "../components/sections/RecentProducts";
import CtaSection from "../components/sections/CtaSection";
import FeatureProduct from "../components/sections/FeatureProduct";
import FeaturesSection from "../components/sections/FeaturesSection";
import ProductSlider from "../components/sections/ProductSlider";


export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <FeaturesSection/>
      <ProductSlider />
      <RecentProducts />

      <CtaSection/>
      {/* <FeatureProduct/> */}
      
    </div>
  );
}
