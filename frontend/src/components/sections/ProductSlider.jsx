import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { API_BASE_URL } from "../../constants/config";
import ProductCard from "../common/ProductCard";

export default function ProductSlider() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return Math.max(0, products.length - itemsPerPage);
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - itemsPerPage);
      if (prev >= maxIndex) {
        return 0;
      }
      return prev + 1;
    });
  };

  // Auto-scroll with smooth loop
  useEffect(() => {
    if (!isAutoPlay || products.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, products.length - itemsPerPage);
        if (prev >= maxIndex) {
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, products.length, itemsPerPage]);

  // Resume autoplay after 10 seconds of no interaction
  useEffect(() => {
    if (isAutoPlay) return;

    const timeout = setTimeout(() => {
      setIsAutoPlay(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isAutoPlay]);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-24">
            <Loader className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  return (
    <section 
      className="py-16 sm:py-20 lg:py-24 bg-white"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 flex items-center justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Featured Products
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Discover our curated collection of premium items
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 sm:p-2.5 bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white rounded-lg transition-all duration-300"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 sm:p-2.5 bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white rounded-lg transition-all duration-300"
              aria-label="Next products"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Gradient overlays for cleaner edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 lg:w-16 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 lg:w-16 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

          {/* Products Carousel */}
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {[...Array(Math.ceil(products.length / itemsPerPage))].map(
                (_, groupIndex) => (
                  <div
                    key={`group-${groupIndex}`}
                    className="min-w-full flex"
                  >
                    {products
                      .slice(
                        groupIndex * itemsPerPage,
                        groupIndex * itemsPerPage + itemsPerPage
                      )
                      .map((product) => (
                        <div
                          key={product.id}
                          className={` ${
                            itemsPerPage === 1
                              ? "w-full"
                              : itemsPerPage === 2
                              ? "w-1/2"
                              : itemsPerPage === 3
                              ? "w-1/3"
                              : "w-1/4"
                          }`}
                        >
                          <div className="px-2 sm:px-3 lg:px-4 py-2">
                            <div className="transition-transform duration-300 hover:scale-105">
                              <ProductCard product={product} />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="lg:hidden flex items-center justify-between absolute -bottom-16 left-0 right-0">
            <button
              onClick={handlePrevious}
              className="p-2 bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white rounded-lg transition-all duration-300"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({
                length: Math.ceil(products.length / itemsPerPage),
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrentIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    currentIndex === index
                      ? "bg-blue-600 w-6"
                      : "bg-gray-300 w-1.5 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="p-2 bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white rounded-lg transition-all duration-300"
              aria-label="Next products"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop Indicators */}
        <div className="hidden lg:flex justify-center items-center gap-2 mt-12">
          {Array.from({
            length: Math.ceil(products.length / itemsPerPage),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlay(false);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-500 ${
                currentIndex === index
                  ? "bg-blue-600 w-8"
                  : "bg-gray-300 w-2 hover:bg-blue-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="flex items-center justify-center gap-6 mt-12 lg:mt-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Slide {currentIndex + 1} of {Math.ceil(products.length / itemsPerPage)}
            </p>
          </div>
          {isAutoPlay && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-xs text-blue-700 font-medium">Auto-playing</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
