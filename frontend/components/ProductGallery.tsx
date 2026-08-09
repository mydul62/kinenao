"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName?: string;
  name?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  name,
}) => {
  const displayName = productName || name || "Product image";
  const imagesList = images && images.length > 0 ? images.filter(Boolean) : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const activeImage = imagesList[currentIndex] || imagesList[0];

  return (
    <div className="space-y-3.5">
      {/* Main Showcase Image */}
      <div className="relative aspect-square w-full rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm group">
        <Image
          src={activeImage}
          alt={displayName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Counter Badge */}
        <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
          {currentIndex + 1} / {imagesList.length}
        </div>

        {/* Fullscreen / Zoom Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer border border-slate-200"
          title="বড় করে দেখুন (Zoom)"
        >
          <Maximize2 className="w-4 h-4 text-slate-700" />
        </button>

        {/* Left Arrow Button */}
        {imagesList.length > 1 && (
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110 cursor-pointer border border-slate-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            title="পূর্ববর্তী ছবি"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {/* Right Arrow Button */}
        {imagesList.length > 1 && (
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110 cursor-pointer border border-slate-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            title="পরবর্তী ছবি"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        )}
      </div>

      {/* Alternative Thumbnails Strip */}
      {imagesList.length > 1 && (
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
          {imagesList.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl border-2 overflow-hidden transition-all cursor-pointer bg-white ${
                currentIndex === index
                  ? "border-emerald-600 ring-2 ring-emerald-300 shadow-md scale-105"
                  : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
              }`}
            >
              <Image
                src={img}
                alt={`${displayName} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full h-[75vh] flex items-center justify-center">
            <img
              src={activeImage}
              alt={displayName}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />

            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
