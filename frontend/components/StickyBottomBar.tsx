"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Loader2, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface StickyBottomBarProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    thumbnail?: string | null;
    stockQty?: number;
    reservedStockQty?: number;
  };
}

export default function StickyBottomBar({ product }: StickyBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling down 280px
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const currentPrice = product.discountPrice !== null && product.discountPrice !== undefined
    ? product.discountPrice
    : product.price;

  const handleAdd = () => {
    setAdding(true);
    setTimeout(() => {
      addToCart(product);
      setAdding(false);
      setAdded(true);
      toast.success(`"${product.name}" added to cart!`);
      setTimeout(() => setAdded(false), 1800);
    }, 300);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 max-w-xl w-[92%] md:w-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      {/* Product Thumbnail & Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <img
          src={product.thumbnail || "/file.svg"}
          alt={product.name}
          className="w-11 h-11 rounded-xl object-cover border border-slate-100 flex-shrink-0"
        />
        <div className="min-w-0">
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 truncate leading-snug">
            {product.name}
          </h4>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-slate-900 font-extrabold text-xs sm:text-sm">
              {currentPrice}Tk
            </span>
            {product.discountPrice && (
              <span className="text-slate-400 line-through text-[11px]">
                {product.price}Tk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add To Cart Button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={adding}
        className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap uppercase tracking-wider ${
          added
            ? "bg-emerald-700 text-white"
            : "bg-[#1c3d5a] hover:bg-[#11273c] text-white"
        }`}
      >
        {adding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Adding...
          </>
        ) : added ? (
          <>
            <Check className="w-4 h-4" /> Added
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" /> ADD TO CART
          </>
        )}
      </button>
    </div>
  );
}
