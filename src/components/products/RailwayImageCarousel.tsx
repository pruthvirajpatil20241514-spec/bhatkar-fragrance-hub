/**
 * Product Image Carousel (Railway Storage URLs)
 * Displays 3-4 images side-scrollable carousel
 */

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImage {
  id: number;
  image_url: string;
  alt_text?: string;
  image_order: number;
  is_thumbnail?: boolean;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

export default function ProductImageCarousel({
  images,
  productName,
  className = "",
}: ProductImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sort images by order
  const sortedImages = [...images].sort(
    (a, b) => (a.image_order || 0) - (b.image_order || 0)
  );

  if (sortedImages.length === 0) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg aspect-square flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📷</div>
          <p className="text-gray-600">No images available</p>
          <p className="text-sm text-gray-500">Images will appear here</p>
        </div>
      </div>
    );
  }

  // Get display range (show 3-4 images per frame)
  const imagesPerFrame = 4;
  const displayedImages = sortedImages.slice(selectedIndex, selectedIndex + imagesPerFrame);

  const handlePrevious = () => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (selectedIndex + imagesPerFrame < sortedImages.length) {
      setSelectedIndex((prev) => prev + 1);
    }
  };

  const canScrollLeft = selectedIndex > 0;
  const canScrollRight = selectedIndex + imagesPerFrame < sortedImages.length;

  return (
    <div className={className}>
      {/* Main Image Display */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square mb-4">
        <img
          src={sortedImages[0]?.image_url}
          alt={sortedImages[0]?.alt_text || productName}
          className="w-full h-full object-cover"
        />

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
          1 / {sortedImages.length}
        </div>

        {/* Thumbnail on Hover */}
        {sortedImages[0]?.is_thumbnail && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Main
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="space-y-3">
          {/* Scroll Indicators */}
          {sortedImages.length > imagesPerFrame && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 font-medium">
                {selectedIndex + 1}-{Math.min(selectedIndex + imagesPerFrame, sortedImages.length)} of{" "}
                {sortedImages.length}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevious}
                  disabled={!canScrollLeft}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canScrollRight}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Thumbnail Grid */}
          <div
            ref={scrollContainerRef}
            className="grid grid-cols-4 gap-2 overflow-x-auto"
          >
            {displayedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(selectedIndex + index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex + index === 0
                    ? "border-orange-500 shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text || `${productName} - Image ${image.image_order}`}
                  className="w-full h-full object-cover"
                />

                {/* Thumbnail Badge */}
                {image.is_thumbnail && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">★</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Scrollbar Indicator */}
          {sortedImages.length > imagesPerFrame && (
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${((selectedIndex + imagesPerFrame) / sortedImages.length) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Loading State for Cloudinary URLs */}
      <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
        <div className="w-1 h-1 bg-green-500 rounded-full" />
        <span>Images stored on Railway Object Storage</span>
      </div>
    </div>
  );
}
