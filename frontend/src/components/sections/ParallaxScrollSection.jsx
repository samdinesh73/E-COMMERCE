import React, { useState, useEffect, useRef } from "react";

const ParallaxScrollSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  // Content data for each scroll section
  const contentData = [
    {
      id: 1,
      image: "./assets/img/Polo_Pima.jpg",
      title: "What is Our Premium Collection?",
      description: "We've been part of your lifestyle for more than 25 years, quietly delivering premium quality products from trusted manufacturers to families across our regions.\n\nFor us, our brand isn't just a name. It's a daily connection between our artisans and your family. A commitment to bring fresh, natural products just the way it's meant to be. No shortcuts. No additives. Just honest, wholesome quality straight from our producers' hands to your home.",
      features: ["Handpicked Selection", "Quality Assured", "Sustainably Sourced"]
    },
    {
      id: 2,
      image: "./assets/img/Henly_Pima.jpg",
      title: "Experience True Craftsmanship",
      description: "Every product in our collection represents years of expertise and dedication to perfection. From sourcing to delivery, we maintain the highest standards.\n\nOur team works tirelessly to ensure that each item meets our rigorous quality requirements. We believe in transparency, sustainability, and supporting local artisans who create exceptional products.",
      features: ["Latest Trends", "Designer Selection", "Timeless Classics"]
    },
    {
      id: 3,
      image: "./assets/img/Hi_Neck.jpg",
      title: "Your Trust is Our Priority",
      description: "Customer satisfaction is at the heart of everything we do. We pride ourselves on delivering not just products, but experiences that create lasting memories.\n\nWith fast delivery, easy returns, and round-the-clock support, we ensure your shopping journey is as smooth as possible. Because your happiness is our success.",
      features: ["Fast Delivery", "Easy Returns", "24/7 Support"]
    }
  ];

  // Scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerTop = containerRect.top;
        const containerHeight = containerRect.height;
        const windowHeight = window.innerHeight;

        // Calculate scroll progress (0 to 1)
        const scrollProgress = Math.max(
          0,
          Math.min(1, (windowHeight - containerTop) / (containerHeight + windowHeight))
        );

        // Image changes when second set of text reaches top
        // First image: 0 to 0.33, Second image: 0.33 to 0.66, Third image: 0.66 to 1
        const index = Math.floor(scrollProgress * contentData.length);
        const activeIdx = Math.min(index, contentData.length - 1);

        setActiveIndex(activeIdx);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-white py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout - Sticky Image on Top */}
        <div className="lg:hidden">
          {/* Sticky Image for Mobile */}
          <div className="sticky top-0 z-10 w-full h-80 sm:h-80 bg-gray-50 rounded-lg overflow-hidden mb-4 p-0">
            <div className="relative h-full w-full flex items-center justify-center">
              {contentData.map((item, index) => (
                <div
                  key={item.id}
                  className="absolute inset-0 transition-opacity duration-500 flex items-center justify-center"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Text Content for Mobile */}
          <div className="space-y-12">
            {contentData.map((item, index) => (
              <div
                key={item.id}
                className="h-half flex flex-col justify-center pb-16"
              >
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {item.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-6">
                  {item.description}
                </p>

                {/* Features List */}
                {/* <div className="space-y-2 mb-6">
                  {item.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-0.5"></div>
                      <span className="text-gray-700 font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                </div> */}

                {/* CTA Button */}
                <button className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm w-fit">
                  Shop Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 min-h-screen lg:min-h-fit">
          {/* Left Side - Scrollable Text Content */}
          <div className="flex flex-col justify-center py-12 lg:py-20">
            <div className="space-y-32">
              {contentData.map((item, index) => (
                <div
                  key={item.id}
                  className="min-h-screen lg:min-h-fit flex flex-col justify-center"
                >
                  {/* Title */}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line mt-4">
                    {item.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mt-6">
                    {item.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-0.5"></div>
                        <span className="text-gray-700 font-medium text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base mt-6 w-fit">
                    Shop Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Fixed Image */}
          <div className="hidden lg:block sticky top-20 h-120 w-120 aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <div className="relative h-full w-full flex items-center justify-center">
              {/* Image transitions with fade */}
              {contentData.map((item, index) => (
                <div
                  key={item.id}
                  className="absolute inset-0 transition-opacity duration-500 flex items-center justify-center"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      {/* <div className="flex justify-center gap-2 py-6 sm:py-8 bg-white">
        {contentData.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === idx ? "bg-blue-600 w-8" : "bg-gray-300 w-2"
            }`}
          ></div>
        ))}
      </div> */}
    </section>
  );
};

export default ParallaxScrollSection;
