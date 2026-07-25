"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, name }) => {
  const imagesList = images && images.length > 0 ? images : ["/file.svg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const activeImage = imagesList[currentIndex] || imagesList[0];

  return (
    <div className="space-y-4">
      {/* Main Image Showcase with Slider Controls */}
      <div className="relative aspect-square w-full rounded-3xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-sm group">
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-all duration-300"
        />

        {/* Left Arrow Button */}
        {imagesList.length > 1 && (
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer border border-slate-200"
            title="Previous Image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {imagesList.length > 1 && (
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer border border-slate-200"
            title="Next Image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Alternative Thumbnails Strip */}
      {imagesList.length > 1 && (
        <div className="flex gap-3 justify-center">
          {imagesList.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden transition-all cursor-pointer bg-white ${
                currentIndex === index
                  ? "border-[#1c3d5a] ring-2 ring-[#1c3d5a]/20 opacity-100 scale-105"
                  : "border-slate-200 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
