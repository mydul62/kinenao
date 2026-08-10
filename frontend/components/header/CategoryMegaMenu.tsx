"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Sparkles,
  Shirt,
  Baby,
  ShoppingBag,
  Heart,
  Gem,
  Watch,
  Smartphone,
  Home,
  Leaf,
  UtensilsCrossed,
  Tag,
  ChevronRight,
  ArrowRight,
  Package,
  Layers,
} from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  parentId?: string | null;
  childCategories?: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
  }>;
  children?: CategoryItem[];
  _count?: {
    products?: number;
    childCategories?: number;
  };
}

interface ProductPreviewItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  thumbnail?: string | null;
  images?: string[];
  customBadge?: string | null;
}

interface CategoryMegaMenuProps {
  categories: CategoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Returns an appropriate Lucide icon for each category based on Bengali/English keywords
 */
export function getCategoryIcon(name: string = "", slug: string = "") {
  const s = (name + " " + slug).toLowerCase();
  if (s.includes("শাড়ি") || s.includes("saree") || s.includes("sari")) return Sparkles;
  if (s.includes("থ্রি-পিস") || s.includes("three-piece") || s.includes("three piece") || s.includes("dress") || s.includes("clothing")) return Shirt;
  if (s.includes("বাচ্চা") || s.includes("kids") || s.includes("baby") || s.includes("খেলনা") || s.includes("toy")) return Baby;
  if (s.includes("ব্যাগ") || s.includes("bag") || s.includes("পাম্প") || s.includes("pump") || s.includes("purse")) return ShoppingBag;
  if (s.includes("প্রেম") || s.includes("couple") || s.includes("লাভ") || s.includes("love")) return Heart;
  if (s.includes("জুয়েলারি") || s.includes("jewelry") || s.includes("jewellery") || s.includes("এক্সেসরিজ") || s.includes("ornament") || s.includes("gem")) return Gem;
  if (s.includes("ঘড়ি") || s.includes("watch") || s.includes("ব্যাগেল") || s.includes("bangle")) return Watch;
  if (s.includes("ইলেকট্রনিক্স") || s.includes("electronics") || s.includes("গ্যাজেট") || s.includes("gadget") || s.includes("phone")) return Smartphone;
  if (s.includes("হোম") || s.includes("home") || s.includes("ডেকোর") || s.includes("decor") || s.includes("living")) return Home;
  if (s.includes("অর্গানিক") || s.includes("organic") || s.includes("খাদ্য") || s.includes("food") || s.includes("grocery") || s.includes("oil")) return Leaf;
  if (s.includes("কিচেন") || s.includes("kitchen") || s.includes("রান্না") || s.includes("cook") || s.includes("utensil")) return UtensilsCrossed;
  return Tag;
}

export default function CategoryMegaMenu({
  categories = [],
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: CategoryMegaMenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [previewCache, setPreviewCache] = useState<Record<string, ProductPreviewItem[]>>({});
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [fetchErrorCategory, setFetchErrorCategory] = useState<string | null>(null);

  // Initialize active category when menu opens or categories load
  useEffect(() => {
    if (categories.length > 0 && (!activeCategoryId || !categories.some((c) => c.id === activeCategoryId))) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // Find active category
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || categories[0] || null;
  }, [categories, activeCategoryId]);

  // Subcategories for active category (supports childCategories or children)
  const activeSubcategories = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.childCategories || activeCategory.children || [];
  }, [activeCategory]);

  // Fetch preview products whenever active category changes (cached)
  useEffect(() => {
    if (!isOpen || !activeCategory) return;

    const catId = activeCategory.id;
    const catSlug = activeCategory.slug;

    // If already in cache, skip API call
    if (previewCache[catId]) return;

    let isMounted = true;
    setLoadingCategory(catId);
    setFetchErrorCategory(null);

    // Efficient preview query: limit=4
    api
      .get(`/products?categoryId=${catId || catSlug}&limit=4`)
      .then((res) => {
        if (!isMounted) return;
        const productsList = res.data?.data?.products || res.data?.data || [];
        setPreviewCache((prev) => ({
          ...prev,
          [catId]: productsList.slice(0, 4),
        }));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(`Error loading preview products for category ${catSlug}:`, err);
        setFetchErrorCategory(catId);
      })
      .finally(() => {
        if (isMounted) setLoadingCategory(null);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeCategory, previewCache]);

  if (!isOpen || categories.length === 0) return null;

  const ActiveIcon = activeCategory ? getCategoryIcon(activeCategory.name, activeCategory.slug) : Tag;
  const currentPreviewProducts = activeCategory ? previewCache[activeCategory.id] || [] : [];
  const isLoading = activeCategory ? loadingCategory === activeCategory.id : false;
  const hasError = activeCategory ? fetchErrorCategory === activeCategory.id : false;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 w-[96vw] max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      <div className="grid grid-cols-12 min-h-[420px] max-h-[580px]">
        {/* LEFT COLUMN: Categories Navigation List */}
        <div className="col-span-4 bg-slate-50/70 border-r border-slate-200/80 p-3.5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                সকল ক্যাটাগরি ({categories.length})
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                LIVE
              </span>
            </div>

            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name, cat.slug);
              const isActive = activeCategoryId === cat.id;
              const subCount = (cat.childCategories?.length || cat.children?.length || 0);

              return (
                <div
                  key={cat.id || cat.slug}
                  onMouseEnter={() => setActiveCategoryId(cat.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-primary shadow-sm border border-slate-200/80 scale-[1.01]"
                      : "text-slate-700 hover:bg-white/80 hover:text-slate-900"
                  }`}
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 min-w-0 flex-1"
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-200/60 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <span
                      className={`text-xs font-extrabold truncate ${
                        isActive ? "text-primary font-black" : "text-slate-800"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {subCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {subCount} সাব
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? "text-primary translate-x-0.5" : "text-slate-400 opacity-40 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom All Shop Link */}
          <div className="pt-3 border-t border-slate-200/80 mt-2 px-1">
            <Link
              href="/shop"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-primary text-white text-xs font-black transition-colors shadow-xs"
            >
              <Package className="w-3.5 h-3.5" />
              <span>সকল পণ্য এক্সপ্লোর করুন</span>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Category Showcase (Subcategories + Product Preview) */}
        <div className="col-span-8 p-6 flex flex-col justify-between overflow-y-auto bg-white">
          {activeCategory && (
            <div className="space-y-5">
              {/* Header with Title & Direct View All Link */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <ActiveIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      {activeCategory.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {activeCategory.description || "এক্সক্লুসিভ কালেকশন ও লেটেস্ট ট্রেন্ড"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/category/${activeCategory.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline group"
                >
                  <span>View All {activeCategory.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Subcategories Section (if present) */}
              {activeSubcategories.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <Layers className="w-3 h-3 text-primary" />
                    <span>সাব-ক্যাটাগরি সমূহ</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeSubcategories.map((sub: any) => (
                      <Link
                        key={sub.id || sub.slug}
                        href={`/category/${activeCategory.slug}?sub=${sub.slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-700 border border-slate-200/80 transition-all hover:border-primary/30 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        <span>{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Preview Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    পণ্য প্রিভিউ (শীর্ষ পণ্যসমূহ)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {currentPreviewProducts.length} টি দেখানো হচ্ছে
                  </span>
                </div>

                {/* Loading Skeleton State */}
                {isLoading && (
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-100 p-2.5 space-y-2 bg-slate-50/50 animate-pulse"
                      >
                        <div className="aspect-square w-full rounded-xl bg-slate-200" />
                        <div className="h-3 w-3/4 bg-slate-200 rounded" />
                        <div className="h-3 w-1/2 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {!isLoading && hasError && (
                  <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-100 text-center space-y-2">
                    <p className="text-xs font-bold text-rose-700">
                      পণ্য লোড করতে সাময়িক সমস্যা হয়েছে।
                    </p>
                    <Link
                      href={`/category/${activeCategory.slug}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-xs font-black text-rose-800 underline"
                    >
                      ক্যাটাগরি পেজে সরাসরি দেখুন <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !hasError && currentPreviewProducts.length === 0 && (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-500">
                      এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য যোগ করা হয়নি।
                    </p>
                    <Link
                      href={`/category/${activeCategory.slug}`}
                      onClick={onClose}
                      className="inline-block text-xs font-black text-primary hover:underline"
                    >
                      ক্যাটাগরি ব্রাউজ করুন →
                    </Link>
                  </div>
                )}

                {/* Product Grid */}
                {!isLoading && !hasError && currentPreviewProducts.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {currentPreviewProducts.map((prod) => {
                      const displayPrice =
                        prod.discountPrice !== null && prod.discountPrice !== undefined
                          ? prod.discountPrice
                          : prod.price;
                      const hasDiscount =
                        prod.discountPrice !== null &&
                        prod.discountPrice !== undefined &&
                        prod.discountPrice < prod.price;
                      const thumb =
                        prod.thumbnail || (prod.images && prod.images[0]) || "/placeholder.jpg";

                      return (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.slug || prod.id}`}
                          onClick={onClose}
                          className="group/prod flex flex-col rounded-2xl border border-slate-200/80 bg-white p-2.5 transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
                        >
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                            <img
                              src={thumb}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover/prod:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {hasDiscount && (
                              <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs">
                                ছাড়
                              </span>
                            )}
                          </div>

                          <h4 className="text-[11px] font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover/prod:text-primary transition-colors min-h-[28px]">
                            {prod.name}
                          </h4>

                          <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100">
                            <span className="text-xs font-black text-slate-900">
                              ৳{displayPrice.toLocaleString()}
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ৳{prod.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Full Action Bar */}
          {activeCategory && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
              <span className="text-[11px] font-bold text-slate-500">
                ক্যাটাগরির সকল পণ্য দেখতে চান?
              </span>

              <Link
                href={`/category/${activeCategory.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-rose-700 text-white text-xs font-black transition-all shadow-sm hover:shadow group"
              >
                <span>View All {activeCategory.name}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
