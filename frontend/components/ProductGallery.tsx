"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, name }) => {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full rounded-3xl border bg-muted/20 overflow-hidden shadow-sm">
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(max-w-768px) 100vw, 50vw"
          className="object-cover transition-all duration-300"
        />
      </div>

      {/* Alternative Thumbnails View Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`relative aspect-square rounded-xl border overflow-hidden hover:opacity-95 transition-all cursor-pointer ${
                activeImage === img ? "ring-2 ring-primary border-transparent" : "opacity-70"
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                sizes="(max-w-768px) 25vw, 10vw"
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
