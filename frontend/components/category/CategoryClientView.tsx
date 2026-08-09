"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/CategorySidebar";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Sparkles,
  Layers,
  Check,
  Filter,
  X,
  Grid2X2,
  List,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  CheckCircle2,
  ArrowUpDown,
} from "lucide-react";

interface CategoryClientViewProps {
  category: any;
  categories: any[];
  initialProducts: any[];
  initialSubcat?: string | null;
  initialSort?: string;
}

export default function CategoryClientView({
  category,
  categories,
  initialProducts,
  initialSubcat = null,
  initialSort = "newest",
}: CategoryClientViewProps) {
  const router = useRouter();

  const [activeSubcat, setActiveSubcat] = useState<string | null>(initialSubcat);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(initialSort || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const subcategories = category?.childCategories || [];

  // Filter & Sort products instantly on client without refetch delay
  const displayedProducts = useMemo(() => {
    let list = [...initialProducts];

    // Subcategory filtering
    if (activeSubcat) {
      list = list.filter(
        (p) =>
          p.categoryId === activeSubcat ||
          p.category?.slug === activeSubcat ||
          p.category?.id === activeSubcat ||
          (p.tags && p.tags.toLowerCase().includes(activeSubcat.toLowerCase())) ||
          (p.slug && p.slug.toLowerCase().includes(activeSubcat.toLowerCase()))
      );
    }

    // In-stock filtering
    if (inStockOnly) {
      list = list.filter((p) => (p.stockQty || 0) > 0);
    }

    // Sorting
    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === "bestseller") {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return list;
  }, [initialProducts, activeSubcat, inStockOnly, sortBy]);

  const activeFiltersCount =
    (activeSubcat ? 1 : 0) + (inStockOnly ? 1 : 0) + (sortBy !== "newest" ? 1 : 0);

  const resetAllFilters = () => {
    setActiveSubcat(null);
    setInStockOnly(false);
    setSortBy("newest");
    setIsMobileFilterOpen(false);
  };

  return (
    <div className="w-full px-[4px] sm:px-2 py-3 space-y-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        <Link href="/" className="hover:text-emerald-700 font-semibold transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link href="/shop" className="hover:text-emerald-700 font-semibold transition-colors">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">
          {category?.name || "Category"}
        </span>
        {activeSubcat && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {subcategories.find((s: any) => s.slug === activeSubcat || s.id === activeSubcat)?.name ||
                activeSubcat}
            </span>
          </>
        )}
      </nav>

      {/* Dynamic Category Hero Banner (Server Rendered Context) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 text-white p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-md border border-emerald-800/40">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Featured Category</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
              {category?.name || "Category"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium line-clamp-2">
              {category?.description ||
                "১০০% খাঁটি ও সেরা মানের কালেকশন সরাসরি আমাদের স্টোর থেকে দ্রুত হোম ডেলিভারি"}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <span className="block text-base sm:text-lg font-black text-emerald-300">
                {displayedProducts.length}
              </span>
              <span className="text-[10px] text-emerald-100 font-medium">পণ্য উপলব্ধ</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="block text-base sm:text-lg font-black text-amber-300">
                {subcategories.length}
              </span>
              <span className="text-[10px] text-emerald-100 font-medium">সাব-ক্যাটাগরি</span>
            </div>
          </div>
        </div>

        {/* Freshness & Trust Badges Strip */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-xs font-bold text-emerald-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>১০০% অথেনটিক পণ্য</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>সারা দেশে হোম ডেলিভারি</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>ক্যাশ অন ডেলিভারি</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>সহজ রিটার্ন পলিসি</span>
          </div>
        </div>
      </div>

      {/* Subcategories Visual Cards Grid */}
      {subcategories.length > 0 && (
        <div className="mb-5 sm:mb-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>সাব-ক্যাটাগরি সমূহ</span>
              <span className="text-slate-400 text-xs font-semibold">({subcategories.length})</span>
            </h2>
            {activeSubcat && (
              <button
                type="button"
                onClick={() => setActiveSubcat(null)}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                সবগুলো দেখুন (Reset Filter)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {/* All Products in Category Card */}
            <button
              type="button"
              onClick={() => setActiveSubcat(null)}
              className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                activeSubcat === null
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-md scale-102"
                  : "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 shadow-2xs hover:border-emerald-300"
              }`}
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl font-black mb-2 transition-transform group-hover:scale-105 ${
                  activeSubcat === null
                    ? "bg-white/20 text-white"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                ✦
              </div>
              <span className="text-xs sm:text-sm font-extrabold line-clamp-1">সবগুলো</span>
              <span
                className={`text-[10px] font-medium mt-0.5 ${
                  activeSubcat === null ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                {initialProducts.length} টি পণ্য
              </span>
            </button>

            {/* Subcategory Cards */}
            {subcategories.map((sub: any) => {
              const isSelected = activeSubcat === sub.slug || activeSubcat === sub.id;
              const subImage =
                sub.imageUrl ||
                category?.imageUrl ||
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop";

              return (
                <button
                  key={sub.id || sub.slug}
                  type="button"
                  onClick={() => setActiveSubcat(isSelected ? null : sub.slug)}
                  className={`group flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-md scale-102"
                      : "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 shadow-2xs hover:border-emerald-300"
                  }`}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 mb-2 border border-slate-100 transition-transform group-hover:scale-105 shadow-2xs">
                    <img
                      src={subImage}
                      alt={sub.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold line-clamp-1">{sub.name}</span>
                  <span
                    className={`text-[10px] font-medium mt-0.5 ${
                      isSelected ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    সাব-ক্যাটাগরি
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DESKTOP SIDEBAR: Hidden on Mobile */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24">
          <CategorySidebar
            categories={categories}
            activeCategorySlug={category?.slug}
            activeSubcategorySlug={activeSubcat}
            onSelectSubcategory={(subSlug) => setActiveSubcat(subSlug)}
          />
        </div>

        {/* MAIN PRODUCT AREA */}
        <div className="lg:col-span-9 space-y-4">
          {/* Sticky Compact Mobile Control Bar */}
          <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-xs">
            {/* Left: Mobile Drawer Trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>ক্যাটাগরি ও ফিল্টার</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-emerald-700 text-[10px] font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <p className="text-xs sm:text-sm font-bold text-slate-700 hidden xs:block">
                মোট <span className="text-emerald-700 font-black">{displayedProducts.length}</span> টি
                পণ্য
              </p>
            </div>

            {/* Right: Controls (In Stock + Sort + View Toggle) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <label className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>স্টকে আছে</span>
              </label>

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-xl px-2 sm:px-2.5 py-1.5">
                <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="newest">নতুন পণ্য</option>
                  <option value="bestseller">জনপ্রিয়</option>
                  <option value="price_asc">দাম: কম থেকে বেশি</option>
                  <option value="price_desc">দাম: বেশি থেকে কম</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-emerald-700 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Grid View"
                >
                  <Grid2X2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-emerald-700 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Pill Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-1">
              <span className="text-[11px] font-bold text-slate-400">ফিল্টার:</span>
              {activeSubcat && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-emerald-200">
                  <span>
                    {subcategories.find((s: any) => s.slug === activeSubcat || s.id === activeSubcat)
                      ?.name || activeSubcat}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveSubcat(null)}
                    className="hover:bg-emerald-200/60 rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-emerald-200">
                  <span>স্টকে আছে</span>
                  <button
                    type="button"
                    onClick={() => setInStockOnly(false)}
                    className="hover:bg-emerald-200/60 rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-extrabold text-rose-600 hover:underline ml-1 cursor-pointer"
              >
                ক্লিয়ার করুন
              </button>
            </div>
          )}

          {/* Products Grid / List Display from Database */}
          {displayedProducts.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Tag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ডাটাবেজে বর্তমানে এই সাব-ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি। অন্য ক্যাটাগরি ব্রাউজ
                করুন।
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                সব ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : viewMode === "list" ? (
            <div className="flex flex-col gap-3">
              {displayedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} viewMode="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
              {displayedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} viewMode="grid" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-Up Mobile Filter & Category Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-black backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden border-t border-slate-200"
            >
              {/* Sheet Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">ক্যাটাগরি ও ফিল্টার মেনু</h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      সাব-ক্যাটাগরি বা অন্য ক্যাটাগরি ব্রাউজ করুন
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-xs font-bold text-rose-600 hover:underline px-2 py-1 cursor-pointer"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sheet Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* 1. Subcategories Quick Selector */}
                {subcategories.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                      বর্তমান ক্যাটাগরির সাব-ক্যাটাগরি
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSubcat(null)}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer ${
                          activeSubcat === null
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        <span>সবগুলো পণ্য</span>
                        {activeSubcat === null && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {subcategories.map((sub: any) => {
                        const isSelected = activeSubcat === sub.slug || activeSubcat === sub.id;
                        return (
                          <button
                            key={sub.id || sub.slug}
                            type="button"
                            onClick={() => setActiveSubcat(isSelected ? null : sub.slug)}
                            className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Stock Filter Toggle */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      ইন-স্টক পণ্য শুধু দেখুন
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      যেগুলো স্টকে আছে সেগুলো দেখাবে
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 3. Sort Options */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                    সর্টিং ক্রম
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "newest", label: "নতুন পণ্য" },
                      { id: "bestseller", label: "বেস্ট সেলার" },
                      { id: "price_asc", label: "দাম: কম থেকে বেশি" },
                      { id: "price_desc", label: "দাম: বেশি থেকে কম" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSortBy(opt.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer ${
                          sortBy === opt.id
                            ? "bg-emerald-50 text-emerald-700 border-emerald-400 font-black"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Switch to other Database Categories */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                    অন্যান্য ক্যাটাগরি ব্রাউজ করুন ({categories.length})
                  </h4>
                  <div className="space-y-1">
                    {categories.map((cat) => {
                      const isActive = cat.slug === category?.slug || cat.id === category?.id;
                      return (
                        <Link
                          key={cat.id || cat.slug}
                          href={`/category/${cat.slug}`}
                          onClick={() => setIsMobileFilterOpen(false)}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors ${
                            isActive
                              ? "bg-emerald-600 text-white font-extrabold"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sheet Apply Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  ফিল্টার প্রয়োগ করুন ({displayedProducts.length} টি পণ্য)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
