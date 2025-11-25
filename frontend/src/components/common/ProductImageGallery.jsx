import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";

export default function ProductImageGallery({ mainImage, additionalImages = [] }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  // Combine main image with additional images
  const allImages = [
    {
      path: mainImage,
      angle: "Main View",
      type: "main",
    },
    ...(additionalImages || []).map((img) => ({
      path: img.image_path,
      angle: img.angle_description || "Product View",
      type: "additional",
    })),
  ];

  const currentImage = allImages[selectedImageIndex];

  const handlePrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (!touchStart) return;
    
    const distance = touchStart - touchEndX;
    const threshold = 50; // Minimum swipe distance in pixels

    if (Math.abs(distance) < threshold) {
      setTouchStart(null);
      return;
    }

    // Swiped left - show next image
    if (distance > 0) {
      handleNext();
    }
    // Swiped right - show previous image
    else {
      handlePrevious();
    }

    setTouchStart(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display */}
      <div className="relative w-full bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-8 border border-gray-100"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: 'grab' }}
      >
        <div className="aspect-square flex items-center justify-center rounded-lg overflow-hidden">
          <img
            src={getImageUrl(currentImage.path)}
            alt={currentImage.angle}
            className="w-full h-full object-contain select-none"
            onError={(e) => {
              e.target.src = "assets/img/placeholder.png";
            }}
            draggable="false"
          />
        </div>

        {/* Navigation Arrows - Only show if multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black bg-opacity-50 text-white text-xs sm:text-sm rounded-full font-medium">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          </>
        )}

        {/* Angle label */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded-full font-medium">
          {currentImage.angle}
        </div>

        {/* Touch swipe indicator - only on mobile */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:hidden text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-40 rounded-full">
            ← Swipe →
          </div>
        )}
      </div>

      {/* Thumbnails - Only show if multiple images */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 transition-all overflow-hidden ${
                selectedImageIndex === idx
                  ? "border-blue-600 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label={`View ${img.angle}`}
            >
              <img
                src={getImageUrl(img.path)}
                alt={img.angle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "assets/img/placeholder.png";
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Image info */}
      {/* {allImages.length > 1 && (
        <div className="text-center text-xs sm:text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-900">
              {allImages.length} image{allImages.length !== 1 ? "s" : ""}
            </span>
            {" available - Click arrows or thumbnails to view"}
          </p>
        </div>
      )} */}
    </div>
  );
}
