"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Check, Zap, Play, Heart, Tag } from "lucide-react";
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
  const [isWishlisted, setIsWishlisted] = useState(false);

  const price =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;

  const originalPrice = product.price;

  const hasDiscount =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.price > product.discountPrice;

  const discountPercent =
    hasDiscount && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

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
    }, 250);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setBuyingNow(true);
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      thumbnail: product.thumbnail || (product.images && product.images[0]) || "",
    });
    router.push("/checkout");
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => {
      const next = !prev;
      if (next) {
        toast.success(`"${product.name}" উইশলিস্টে যুক্ত হয়েছে!`, {
          icon: <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />,
        });
      } else {
        toast.info(`"${product.name}" উইশলিস্ট থেকে সরানো হয়েছে`);
      }
      return next;
    });
  };

  const imageSrc =
    product.thumbnail ||
    (product.images && product.images.length > 0 ? product.images[0] : "") ||
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400";

  // List View Layout
  if (viewMode === "list") {
    return (
      <div
        className={`bg-white rounded-2xl border border-[#e8e4db] p-3 flex flex-row items-center gap-3 sm:gap-4 shadow-2xs hover:shadow-md transition-all hover:border-[#123524]/30 group ${className}`}
      >
        {/* Left Thumbnail */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          <Link href={`/product/${product.slug || product.id}`}>
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
              loading="lazy"
            />
          </Link>
          {hasDiscount && (
            <span className="absolute top-1 left-1 bg-[#123524] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs font-['Manrope']">
              {discountPercent}% ছাড়
            </span>
          )}
        </div>

        {/* Right Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-1">
          <div>
            <p className="text-[10px] font-extrabold text-emerald-800 truncate">
              {product.category?.name || "পণ্য"}
            </p>
            <Link href={`/product/${product.slug || product.id}`}>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 group-hover:text-[#123524] transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-baseline gap-2 font-['Manrope']">
            <span className="text-sm sm:text-base font-black text-[#123524]">
              ৳{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-semibold">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {adding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : addedSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
              <span>কার্ট</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={buyingNow}
              className="py-1.5 px-3 rounded-xl bg-[#123524] hover:bg-[#1b4d36] text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>অর্ডার</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout
  return (
    <div
      className={`group bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4db] shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between hover:border-[#123524]/30 ${className}`}
    >
      {/* Top Image Area */}
      <div>
        <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
          {/* Wishlist Heart Button (Top-Left) */}
          <button
            type="button"
            onClick={toggleWishlist}
            className="absolute top-2 left-2 z-10 w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-700 hover:text-rose-600 transition-transform active:scale-90 shadow-xs cursor-pointer"
            aria-label="উইশলিস্টে যুক্ত করুন"
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Discount Tag Badge (Top-Right) */}
          {hasDiscount && (
            <span className="absolute top-0 right-0 z-10 bg-[#123524] text-white font-black text-[10px] sm:text-[11px] px-2 py-1 rounded-bl-xl shadow-xs font-['Manrope']">
              {discountPercent}% ছাড়
            </span>
          )}

          {/* Product Thumbnail */}
          <Link href={`/product/${product.slug || product.id}`} className="block w-full h-full">
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
              loading="lazy"
            />
          </Link>

          {/* Video Tag (Bottom-Left) */}
          {hasVideo && (
            <div className="absolute bottom-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>ভিডিও</span>
            </div>
          )}
        </div>

        {/* Dotted border separator */}
        <div className="border-b border-dashed border-slate-200" />

        {/* Content Area */}
        <div className="p-2.5 sm:p-3.5 space-y-1.5">
          {/* Subcategory / Category Tagline */}
          <p className="text-[10px] font-extrabold text-emerald-800 truncate">
            {product.category?.name || "ফ্যাশন"}
          </p>

          {/* Product Title */}
          <Link href={`/product/${product.slug || product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-[#123524] transition-colors min-h-[32px]">
              {product.name}
            </h3>
          </Link>

          {/* Price & Original Strikethrough */}
          <div className="flex items-baseline gap-1.5 pt-0.5 font-['Manrope']">
            <span className="text-sm sm:text-base font-black text-[#123524]">
              ৳{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-semibold">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Savings Line Tag */}
          {hasDiscount && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md w-fit">
              <Tag className="w-2.5 h-2.5" />
              <span>৳{(originalPrice - price).toLocaleString()} সাশ্রয়</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons (Cart + Instant Order) */}
      <div className="p-2.5 sm:p-3.5 pt-0 grid grid-cols-2 gap-1.5">
        {/* 1. Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className="w-full flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold transition-all cursor-pointer"
        >
          {adding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : addedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>যুক্ত</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>কার্ট</span>
            </>
          )}
        </button>

        {/* 2. Order Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={buyingNow}
          className="w-full flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-[#123524] hover:bg-[#1b4d36] text-white text-[11px] font-black shadow-xs transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>অর্ডার</span>
        </button>
      </div>
    </div>
  );
}
