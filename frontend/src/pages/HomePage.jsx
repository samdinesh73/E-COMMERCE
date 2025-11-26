import React from "react";
import BannerSlider from "../components/sections/BannerSlider";
import HeroSection from "../components/sections/HeroSection";
import CategoriesSection from "../components/sections/CategoriesSection";
import CategoryProductsTabs from "../components/sections/CategoryProductsTabs";
import RecentProducts from "../components/sections/RecentProducts";
import CtaSection from "../components/sections/CtaSection";
import FeatureProduct from "../components/sections/FeatureProduct";
import FeaturesSection from "../components/sections/FeaturesSection";
import ProductSlider from "../components/sections/ProductSlider";


export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <BannerSlider />
      <HeroSection />
      <CategoriesSection />
      <CategoryProductsTabs />
      <FeaturesSection/>
      <ProductSlider />
      <RecentProducts />

      <CtaSection/>
      {/* <FeatureProduct/> */}
      
    </div>
  );
}
