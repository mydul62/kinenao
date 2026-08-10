"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, MessageCircle } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName?: string;
  name?: string;
  onWhatsAppClick?: () => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  name,
  onWhatsAppClick,
}) => {
  const displayName = productName || name || "Product image";
  const imagesList =
    images && images.length > 0
      ? images.filter(Boolean)
      : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? 1 : (prev + 1) % imagesList.length));
  };

  const activeImage = imagesList[currentIndex] || imagesList[0];

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWhatsAppClick) {
      onWhatsAppClick();
    } else {
      window.open(
        `https://wa.me/8801700000000?text=${encodeURIComponent(
          `হ্যালো, আমি "${displayName}" পণ্যটি সম্পর্কে জানতে আগ্রহী।`
        )}`,
        "_blank"
      );
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 items-start w-full">
      {/* 1. Thumbnail Strip (Vertical column on desktop, horizontal row on mobile) */}
      {imagesList.length > 1 && (
        <div className="flex md:flex-col gap-2 sm:gap-2.5 overflow-x-auto md:overflow-y-auto w-full md:w-20 md:max-h-[480px] pb-1 md:pb-0 scrollbar-none shrink-0">
          {imagesList.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 shrink-0 rounded-2xl border-2 overflow-hidden transition-all cursor-pointer bg-white ${
                currentIndex === index
                  ? "border-[#0d8a4e] ring-2 ring-[#0d8a4e]/30 shadow-md scale-102"
                  : "border-slate-200/90 opacity-75 hover:opacity-100 hover:border-slate-300"
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

      {/* 2. Main Showcase Image Card */}
      <div className="relative aspect-square w-full flex-1 rounded-3xl border border-[#e8e4db] bg-white overflow-hidden shadow-xs group">
        <Image
          src={activeImage}
          alt={displayName}
          fill
          priority
          sizes="(max-width: 860px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-104"
        />

        {/* Counter Pill (Top-Left) */}
        <div className="absolute top-3.5 left-3.5 z-10 bg-black/65 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs">
          {currentIndex + 1}/{imagesList.length}
        </div>

        {/* Fullscreen / Zoom Button (Top-Right) */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer border border-slate-200"
          title="বড় করে দেখুন (Zoom)"
        >
          <Maximize2 className="w-4 h-4 text-slate-700" />
        </button>

        {/* Floating Chat / WhatsApp FAB (Bottom-Right of image) */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="absolute bottom-3.5 right-3.5 z-10 w-11 h-11 rounded-full bg-[#0d8a4e] hover:bg-[#0a7240] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title="হোয়াটসঅ্যাপে মেসেজ দিন"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
            1
          </span>
        </button>

        {/* Left Arrow Button */}
        {imagesList.length > 1 && (
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all hover:scale-110 cursor-pointer border border-slate-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all hover:scale-110 cursor-pointer border border-slate-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            title="পরবর্তী ছবি"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        )}
      </div>

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
