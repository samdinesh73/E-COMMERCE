import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const HoverCardSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const cards = [
    {
      id: 1,
      title: "Improved Flexibility",
      description: "Enhance your range of motion and mobility",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=600&fit=crop",
      link: "View More",
      color: "bg-blue-100"
    },
    {
      id: 2,
      title: "Stress Reduction",
      description: "Find peace and calm in your daily routine",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=600&fit=crop",
      link: "View More",
      color: "bg-gray-200"
    },
    {
      id: 3,
      title: "Stress Reduction",
      description: "Find peace and calm in your daily routine",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=600&fit=crop",
      link: "View More",
      color: "bg-gray-200"
    },
    {
      id: 4,
      title: "Join Our Yoga Class Today!",
      description: "Transform your body and mind with expert guidance",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=600&fit=crop",
      link: "Join now",
      color: "bg-amber-900"
    }
  ];

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Discover Our Collection
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
            Explore our range of premium products and services designed to enhance your lifestyle
          </p>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 h-auto lg:h-96 justify-center items-stretch">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`relative overflow-hidden rounded-2xl transition-all duration-500 ease-out cursor-pointer group flex-1
                ${hoveredIndex === index ? "lg:flex-[1.8]" : ""}
              `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background Image */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 group-hover:bg-black/50" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white">
                {/* Top Section */}
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
                    {card.title}
                  </h3>
                  {hoveredIndex === index && (
                    <p className="text-sm sm:text-base text-gray-200 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {card.description}
                    </p>
                  )}
                </div>

                {/* Bottom Section */}
                <div
                  className={`flex items-center justify-between transition-all duration-500 ${
                    hoveredIndex === index ? "opacity-100" : "opacity-0 lg:opacity-100"
                  }`}
                >
                  <a
                    href="#"
                    className="text-sm sm:text-base font-semibold text-white hover:text-gray-200 transition-colors flex items-center gap-2"
                  >
                    {card.link}
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-90 group-hover:-translate-y-1" />
                  </a>
                </div>
              </div>

              {/* Hover State Indicator (Mobile) */}
              {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 lg:scale-x-100 group-hover:scale-x-100 transition-transform duration-500 origin-left" /> */}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .group:hover ~ .group {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
};

export default HoverCardSection;
