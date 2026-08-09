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
  };
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
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

  const hasVariants = product.variants && product.variants.length > 0;
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

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 group ${className}`}
    >
      {/* Image Showcase Container */}
      <Link
        href={`/product/${product.slug || product.id}`}
        className="relative w-full aspect-square rounded-[18px] overflow-hidden bg-slate-50 mb-3 border border-slate-100 block"
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Video Indicator Badge */}
        {hasVideo && (
          <div className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Film className="w-3 h-3 text-emerald-400" />
            <span>ভিডিও</span>
          </div>
        )}

        {/* Promotional Badge Pill */}
        {product.customBadge ? (
          <span className="absolute top-2.5 right-2.5 z-10 bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm uppercase max-w-[120px] truncate">
            {product.customBadge}
          </span>
        ) : discountPercent > 0 ? (
          <span className="absolute top-2.5 right-2.5 z-10 bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm uppercase">
            {discountPercent}% OFF
          </span>
        ) : null}

        {/* Variant count badge */}
        {hasVariants && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {product.variants!.length} টি কালার
          </div>
        )}
      </Link>

      {/* Info Container */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Category breadcrumb pill */}
          {product.category && (
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {product.category.name}
            </span>
          )}

          {/* Product Title */}
          <Link
            href={`/product/${product.slug || product.id}`}
            className="block font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mt-0.5"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Rating */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-emerald-700 tracking-tight">
              ৳{price.toLocaleString()}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-slate-400 line-through font-semibold">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions Button Row */}
        <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              addedSuccess
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            {adding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : addedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" /> কার্টে যুক্ত
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> কার্ট
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={buyingNow}
            className="py-2 px-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>অর্ডার করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
