"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Check, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    thumbnail?: string | null;
    brand?: { name?: string; logoUrl?: string } | null;
    category?: { name?: string } | null;
    stockQty?: number;
    reservedStockQty?: number;
  };
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const price = product.discountPrice !== null && product.discountPrice !== undefined
    ? product.discountPrice
    : product.price;

  const originalPrice = product.price;

  const discountPercent =
    product.discountPrice !== null && product.discountPrice !== undefined && product.price > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAdding(true);
    setTimeout(() => {
      addToCart(product);
      setAdding(false);
      setAddedSuccess(true);
      toast.success(`"${product.name}" added to cart!`);
      setTimeout(() => setAddedSuccess(false), 1800);
    }, 300);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setBuyingNow(true);
    setTimeout(() => {
      addToCart(product);
      setBuyingNow(false);
      router.push("/checkout");
    }, 300);
  };

  // Get brand initial or logo
  const brandInitial = product.brand?.name
    ? product.brand.name.substring(0, 2).toUpperCase()
    : "HT";

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-[26px] p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-xl hover:border-slate-300 transition-all duration-300 group ${className}`}
    >
      {/* Top Image Showcase Container */}
      <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-slate-50 mb-3 border border-slate-100">
        {/* Brand Logo Badge (Top Left) */}
        <div className="absolute top-2.5 left-2.5 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-100 overflow-hidden">
          {product.brand?.logoUrl ? (
            <img src={product.brand.logoUrl} alt="" className="w-6 h-6 object-contain" />
          ) : (
            <span className="font-black text-[11px] tracking-tighter text-[#009669]">
              {brandInitial}
            </span>
          )}
        </div>

        {/* Dynamic Promotional Badge Pill (Top Right) */}
        {(product as any).customBadge ? (
          <span className="absolute top-2.5 right-2.5 z-10 bg-[#009669] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm tracking-wide uppercase max-w-[120px] truncate">
            {(product as any).customBadge}
          </span>
        ) : discountPercent > 0 ? (
          <span className="absolute top-2.5 right-2.5 z-10 bg-[#009669] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm tracking-wide uppercase">
            {discountPercent}% OFF
          </span>
        ) : (product as any).promotionalBadges?.length > 0 ? (
          <span className="absolute top-2.5 right-2.5 z-10 bg-[#6C5CE7] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase">
            {(product as any).promotionalBadges[0]}
          </span>
        ) : null}

        {/* Product Image Link */}
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.thumbnail || "/file.svg"}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Product Information (Centered Alignment) */}
      <div className="flex-1 flex flex-col items-center text-center justify-between space-y-2 mb-3">
        {/* Product Title */}
        <Link
          href={`/product/${product.slug}`}
          className="font-extrabold text-base md:text-lg text-[#1e293b] hover:text-[#009669] transition-colors line-clamp-2 leading-snug px-1"
        >
          {product.name}
        </Link>

        {/* Price Row */}
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-[#1e293b] font-extrabold text-base md:text-lg">
            {price}Tk
          </span>
          {discountPercent > 0 && (
            <span className="text-slate-400 line-through text-xs md:text-sm font-normal">
              {originalPrice}Tk
            </span>
          )}
        </div>
      </div>

      {/* Dual Action Buttons Side-by-Side (Grid 2) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* ADD TO CART Button (Navy) */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || buyingNow}
          className={`w-full font-extrabold text-[10px] sm:text-xs py-2.5 px-1.5 rounded-xl flex items-center justify-center gap-1 transition-all shadow-sm active:scale-[0.98] cursor-pointer uppercase tracking-wider whitespace-nowrap ${
            addedSuccess
              ? "bg-emerald-700 text-white"
              : "bg-[#1c3d5a] hover:bg-[#11273c] text-white"
          }`}
        >
          {adding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : addedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" /> ADDED
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" /> ADD TO CART
            </>
          )}
        </button>

        {/* ORDER NOW (অর্ডার করুন) Button (Vibrant Green) */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={adding || buyingNow}
          className="w-full bg-[#009669] hover:bg-[#007f59] text-white font-black text-[10px] sm:text-xs py-2.5 px-1.5 rounded-xl flex items-center justify-center gap-1 transition-all shadow-md shadow-[#009669]/20 active:scale-[0.98] cursor-pointer uppercase tracking-wider whitespace-nowrap"
        >
          {buyingNow ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" /> ORDER NOW
            </>
          )}
        </button>
      </div>
    </div>
  );
}
