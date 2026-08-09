"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Check, Zap, Film, Star } from "lucide-react";
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
    images?: string[];
    videoUrl?: string | null;
    variants?: any[];
    brand?: { name?: string; logoUrl?: string } | null;
    category?: { name?: string; slug?: string } | null;
    stockQty?: number;
    reservedStockQty?: number;
    customBadge?: string | null;
    rating?: number;
    reviewsCount?: number;
    weight?: number;
    unit?: string;
  };
  viewMode?: "grid" | "list";
  className?: string;
}

export default function ProductCard({
  product,
  viewMode = "grid",
  className = "",
}: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const price =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;

  const originalPrice = product.price;

  const discountPercent =
    product.discountPrice !== null && product.discountPrice !== undefined && product.price > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const colorVariants = product.variants?.filter((v: any) => Boolean(v.colorName || v.colorCode)) || [];
  const sizeVariants = product.variants?.filter((v: any) => Boolean(v.size)) || [];
  
  let variantBadgeText: string | null = null;
  if (colorVariants.length > 1) {
    variantBadgeText = `${colorVariants.length} টি কালার`;
  } else if (sizeVariants.length > 1) {
    variantBadgeText = `${sizeVariants.length} টি সাইজ`;
  } else if (product.variants && product.variants.length > 1) {
    variantBadgeText = `${product.variants.length} টি অপশন`;
  }

  const hasVideo = Boolean(product.videoUrl);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAdding(true);
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || "",
      });
      setAdding(false);
      setAddedSuccess(true);
      toast.success(`"${product.name}" কার্টে যুক্ত হয়েছে!`);
      setTimeout(() => setAddedSuccess(false), 1800);
    }, 300);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setBuyingNow(true);
    router.push(`/product/${product.slug || product.id}`);
  };

  const imageSrc =
    product.thumbnail ||
    (product.images && product.images.length > 0 ? product.images[0] : "") ||
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop";

  // List View Layout for Mobile / Wide Browsing
  if (viewMode === "list") {
    return (
      <div
        className={`bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-row items-center gap-3 sm:gap-4 hover:shadow-lg hover:border-emerald-300/80 transition-all duration-300 group ${className}`}
      >
        {/* Left Thumbnail */}
        <Link
          href={`/product/${product.slug || product.id}`}
          className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 block"
        >
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {discountPercent > 0 && (
            <span className="absolute top-1.5 left-1.5 z-10 bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </Link>

        {/* Right Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
          <div>
            <div className="flex items-center gap-2">
              {product.category && (
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
                  {product.category.name}
                </span>
              )}
              {product.customBadge && (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  {product.customBadge}
                </span>
              )}
            </div>
            <Link
              href={`/product/${product.slug || product.id}`}
              className="block font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mt-0.5"
            >
              {product.name}
            </Link>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-black text-emerald-700">
                ৳{price.toLocaleString()}
              </span>
              {discountPercent > 0 && (
                <span className="text-[11px] text-slate-400 line-through font-semibold">
                  ৳{originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                {adding ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : addedSuccess ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <ShoppingBag className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">কার্ট</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buyingNow}
                className="py-1.5 px-3 rounded-lg text-[11px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Zap className="w-3 h-3 fill-white" />
                <span>অর্ডার</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout (Optimized for 2-column mobile + desktop)
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl sm:rounded-[22px] p-2.5 sm:p-3.5 flex flex-col justify-between hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 group ${className}`}
    >
      {/* Image Showcase Container */}
      <Link
        href={`/product/${product.slug || product.id}`}
        className="relative w-full aspect-square rounded-xl sm:rounded-[18px] overflow-hidden bg-slate-50 mb-2 sm:mb-3 border border-slate-100 block"
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Video Indicator Badge */}
        {hasVideo && (
          <div className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1">
            <Film className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            <span>ভিডিও</span>
          </div>
        )}

        {/* Promotional Badge Pill */}
        {product.customBadge ? (
          <span className="absolute top-2 right-2 z-10 bg-emerald-700 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase max-w-[110px] truncate">
            {product.customBadge}
          </span>
        ) : discountPercent > 0 ? (
          <span className="absolute top-2 right-2 z-10 bg-emerald-700 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase">
            {discountPercent}% OFF
          </span>
        ) : null}

        {/* Variant count badge (Only if real colors/sizes/options exist) */}
        {variantBadgeText && (
          <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
            {variantBadgeText}
          </div>
        )}
      </Link>

      {/* Info Container */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Category breadcrumb pill */}
          {product.category && (
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate block">
              {product.category.name}
            </span>
          )}

          {/* Product Title */}
          <Link
            href={`/product/${product.slug || product.id}`}
            className="block font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mt-0.5 min-h-[2rem]"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Rating */}
        <div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base md:text-lg font-black text-emerald-700 tracking-tight">
              ৳{price.toLocaleString()}
            </span>
            {discountPercent > 0 && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-semibold">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions Button Row - Mobile Perfected */}
        <div className="pt-2 grid grid-cols-2 gap-1.5 sm:gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              addedSuccess
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            {adding ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
            ) : addedSuccess ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">কার্টে</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>কার্ট</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={buyingNow}
            className="py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
            <span>অর্ডার</span>
          </button>
        </div>
      </div>
    </div>
  );
}
