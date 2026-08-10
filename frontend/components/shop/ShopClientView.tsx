"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/CategorySidebar";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Filter,
  X,
  Grid2X2,
  List,
  Tag,
  ArrowUpDown,
  Check,
} from "lucide-react";

interface ShopClientViewProps {
  categories: any[];
  brands: any[];
  initialProducts: any[];
  pagination: any;
  initialCategory?: string;
  initialSubcat?: string;
  initialSort?: string;
  initialSearch?: string;
}

export default function ShopClientView({
  categories,
  brands,
  initialProducts,
  pagination,
  initialCategory = "",
  initialSubcat = "",
  initialSort = "newest",
  initialSearch = "",
}: ShopClientViewProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcat);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(initialSort || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const currentCategory = categories.find(
    (c) => c.slug === selectedCategory || c.id === selectedCategory
  );

  // Client-side filtering & sorting on server-provided dataset
  const displayedProducts = useMemo(() => {
    let list = [...initialProducts];

    if (selectedSubcategory) {
      const selectedSub = categories
        .flatMap((c) => c.childCategories || [])
        .find((s: any) => s.slug === selectedSubcategory || s.id === selectedSubcategory);

      list = list.filter(
        (p) =>
          p.categoryId === selectedSubcategory ||
          (selectedSub && p.categoryId === selectedSub.id) ||
          p.category?.slug === selectedSubcategory ||
          p.category?.id === selectedSubcategory ||
          (selectedSub && p.category?.name === selectedSub.name) ||
          (p.tags && p.tags.toLowerCase().includes(selectedSubcategory.toLowerCase())) ||
          (p.slug && p.slug.toLowerCase().includes(selectedSubcategory.toLowerCase()))
      );
    } else if (selectedCategory) {
      const parentCat = categories.find(
        (c) => c.slug === selectedCategory || c.id === selectedCategory
      );
      const childIds = (parentCat?.childCategories || []).map((ch: any) => ch.id);
      const childSlugs = (parentCat?.childCategories || []).map((ch: any) => ch.slug);

      list = list.filter(
        (p) =>
          p.categoryId === selectedCategory ||
          (parentCat && p.categoryId === parentCat.id) ||
          p.category?.slug === selectedCategory ||
          p.category?.id === selectedCategory ||
          childIds.includes(p.categoryId) ||
          childIds.includes(p.category?.id) ||
          childSlugs.includes(p.category?.slug) ||
          p.category?.parentId === (parentCat?.id || selectedCategory) ||
          (p.tags && parentCat && p.tags.toLowerCase().includes(parentCat.name.toLowerCase())) ||
          (p.tags && parentCat && p.tags.toLowerCase().includes(parentCat.slug.toLowerCase()))
      );
    }

    if (inStockOnly) {
      list = list.filter((p) => (p.stockQty || 0) > 0);
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === "bestseller") {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return list;
  }, [initialProducts, selectedCategory, selectedSubcategory, inStockOnly, sortBy]);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setInStockOnly(false);
    setSortBy("newest");
    setIsMobileFilterOpen(false);
  };

  return (
    <div className="w-full px-[4px] sm:px-2 py-3 space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1">
        <Link href="/" className="hover:text-emerald-700 font-semibold transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-bold text-slate-800">Shop Catalog</span>
        {currentCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-extrabold text-emerald-700">{currentCategory?.name}</span>
          </>
        )}
      </nav>

      {/* Horizontal Category Carousel on Mobile */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("");
              setSelectedSubcategory("");
            }}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              !selectedCategory
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            সব ক্যাটাগরি (All)
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => {
                  setSelectedCategory(isSelected ? "" : cat.slug);
                  setSelectedSubcategory("");
                }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 2-Column Desktop Layout & Single-Column Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DESKTOP SIDEBAR: Hidden on Mobile */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24">
          <CategorySidebar
            categories={categories}
            activeCategorySlug={selectedCategory || currentCategory?.slug}
            activeSubcategorySlug={selectedSubcategory}
            onSelectSubcategory={(subSlug) => setSelectedSubcategory(subSlug || "")}
          />
        </div>

        {/* RIGHT MAIN AREA */}
        <div className="lg:col-span-9 space-y-4">
          {/* Sticky Compact Control Bar - Attached on Top during scroll on Desktop & Mobile */}
          <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-md transition-all">
            {/* Left: Mobile Drawer Trigger + Item Count */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>ক্যাটাগরি মেনু</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-emerald-700 text-[10px] font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <p className="text-xs sm:text-sm font-bold text-slate-700 hidden xs:block">
                মোট <span className="text-emerald-700 font-black">{displayedProducts.length}</span>{" "}
                টি পণ্য
              </p>
            </div>

            {/* Right: Controls (In Stock + Sort + View Mode) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl cursor-pointer select-none transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
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

          {/* Products Grid / List */}
          {displayedProducts.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Tag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                বর্তমানে এই ফিল্টারে কোনো পণ্য পাওয়া যায়নি। ফিল্টার রিসেট করে সব পণ্য দেখুন।
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

      {/* Slide-Up Mobile Category & Filter Drawer */}
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
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">ক্যাটাগরি ও ফিল্টার মেনু</h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      ক্যাটাগরি বা ফিল্টার নির্বাচন করুন
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

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* 1. All Categories List */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                    সকল ক্যাটাগরি ({categories.length})
                  </h4>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedSubcategory("");
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        !selectedCategory
                          ? "bg-emerald-600 text-white font-extrabold"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>সকল পণ্য (All Catalog)</span>
                      {!selectedCategory && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id || cat.slug}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(isSelected ? "" : cat.slug);
                            setSelectedSubcategory("");
                            setIsMobileFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600 text-white font-extrabold"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Stock Filter */}
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

                {/* 3. Sorting */}
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
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsMobileFilterOpen(false);
                        }}
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
              </div>

              {/* Drawer Footer */}
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
