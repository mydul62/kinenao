"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  Heart,
  ShoppingBag,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  Grid2X2,
  List as ListIcon,
  X,
  Play,
  Zap,
  RotateCcw,
  Check,
  ArrowUpDown,
  Home,
  User,
  LayoutGrid,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Clock,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getCategoryIcon } from "@/components/header/CategoryMegaMenu";
import { toast } from "sonner";

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
  categories = [],
  brands = [],
  initialProducts = [],
  pagination,
  initialCategory = "",
  initialSubcat = "",
  initialSort = "newest",
  initialSearch = "",
}: ShopClientViewProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartSubtotal,
  } = useCart();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcat);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(initialSort || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Drawers
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Local Wishlist State
  const [wishlistIds, setWishlistIds] = useState<Record<string, boolean>>({});

  // Helper to count total products in category
  const getCategoryProductCount = (cat: any) => {
    if (!cat) return 0;
    const directCount =
      cat._count?.products !== undefined
        ? cat._count.products
        : cat.products?.length || 0;
    const childSum = (cat.childCategories || []).reduce(
      (sum: number, ch: any) =>
        sum + (ch._count?.products || ch.products?.length || 0),
      0
    );
    return directCount + childSum;
  };

  const currentCategory = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find(
      (c) => c.slug === selectedCategory || c.id === selectedCategory
    );
  }, [categories, selectedCategory]);

  const currentSubcategory = useMemo(() => {
    if (!selectedSubcategory) return null;
    return categories
      .flatMap((c) => c.childCategories || [])
      .find((s: any) => s.slug === selectedSubcategory || s.id === selectedSubcategory);
  }, [categories, selectedSubcategory]);

  // Subcategories of current selected category
  const currentSubcategories = useMemo(() => {
    if (currentCategory) {
      return currentCategory.childCategories || [];
    }
    return [];
  }, [currentCategory]);

  // Wishlist toggle handler
  const toggleWishlist = (productId: string, productName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistIds((prev) => {
      const newState = !prev[productId];
      if (newState) {
        toast.success(`"${productName}" উইশলিস্টে যুক্ত হয়েছে!`, {
          icon: <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />,
        });
      } else {
        toast.info(`"${productName}" উইশলিস্ট থেকে সরানো হয়েছে`);
      }
      return { ...prev, [productId]: newState };
    });
  };

  // Instant order / Buy Now
  const handleInstantBuy = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  // Filtered & Sorted Products
  const displayedProducts = useMemo(() => {
    let list = [...initialProducts];

    // Filter by category / subcategory
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

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.toLowerCase().includes(q)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    // In stock filter
    if (inStockOnly) {
      list = list.filter((p) => (p.stockQty || 0) > 0);
    }

    // Sorting
    if (sortBy === "price_asc") {
      list.sort(
        (a, b) =>
          (a.discountPrice !== null ? a.discountPrice : a.price) -
          (b.discountPrice !== null ? b.discountPrice : b.price)
      );
    } else if (sortBy === "price_desc") {
      list.sort(
        (a, b) =>
          (b.discountPrice !== null ? b.discountPrice : b.price) -
          (a.discountPrice !== null ? a.discountPrice : a.price)
      );
    } else if (sortBy === "discount_desc") {
      list.sort((a, b) => {
        const discA =
          a.discountPrice !== null ? ((a.price - a.discountPrice) / a.price) * 100 : 0;
        const discB =
          b.discountPrice !== null ? ((b.price - b.discountPrice) / b.price) * 100 : 0;
        return discB - discA;
      });
    } else if (sortBy === "bestseller") {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return list;
  }, [
    initialProducts,
    categories,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    inStockOnly,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSearchQuery("");
    setInStockOnly(false);
    setSortBy("newest");
    setIsMobileFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-slate-900 pb-20 md:pb-12 font-['Inter',sans-serif]">
      {/* ========================================================================= */}
      {/* 1. TOP SHOP CATALOG HEADER BANNER & CATEGORIES CARD RAIL                  */}
      {/* ========================================================================= */}
      <div className="w-full px-3 md:px-6 pt-4 pb-1">
        {/* Breadcrumbs & Title Card */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-xs text-[#5C685F] font-semibold mb-1">
                <Link href="/" className="hover:text-[#123524] transition-colors">
                  হোম
                </Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-[#123524] transition-colors">
                  শপ ক্যাটালগ
                </Link>
                {currentCategory && (
                  <>
                    <span>/</span>
                    <span className="text-[#131914] font-bold">{currentCategory.name}</span>
                  </>
                )}
                {currentSubcategory && (
                  <>
                    <span>/</span>
                    <span className="text-[#123524] font-extrabold">{currentSubcategory.name}</span>
                  </>
                )}
              </div>

              {/* Title & Count */}
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
                  {currentSubcategory
                    ? currentSubcategory.name
                    : currentCategory
                    ? currentCategory.name
                    : "সকল পণ্য ক্যাটালগ"}
                </h1>
                <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
                  {displayedProducts.length}টি পণ্য
                </span>
              </div>
              <p className="text-[#5C685F] text-xs sm:text-sm mt-1 max-w-2xl">
                {currentCategory?.description ||
                  "১০০% অরিজিনাল পণ্য, দ্রুত ক্যাশ অন ডেলিভারি ও সহজ রিটার্ন সুবিধা সহ কেনাকাটা করুন।"}
              </p>
            </div>

            {/* In-page Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8B958D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য, শাড়ি, ওয়ালেট খুঁজুন..."
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-[#F5F7F5] text-xs font-semibold text-[#131914] placeholder-[#8B958D] border border-[#E4E8E4] focus:outline-none focus:border-[#123524] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B958D] hover:text-[#131914] p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories / Subcategories Card Rail */}
          {categories.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-[#E4E8E4] overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C685F] mb-3 font-['Manrope']">
                {currentCategory && currentSubcategories.length > 0
                  ? "সাবক্যাটাগরি সমূহ:"
                  : "ক্যাটাগরি সমূহ:"}
              </p>
              <div className="w-full flex items-center gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1">
                {/* "সবগুলো" (All) Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                  }}
                  className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer transition-all group ${
                    !selectedCategory && !selectedSubcategory
                      ? "scale-105"
                      : "opacity-85 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xs transition-all ${
                      !selectedCategory && !selectedSubcategory
                        ? "border-2 border-[#a9762a] ring-2 ring-[#a9762a]/40 bg-[#123524] text-white"
                        : "bg-[#F5F7F5] border border-[#E4E8E4] text-[#123524] group-hover:border-[#123524]/40"
                    }`}
                  >
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs text-center font-bold tracking-tight ${
                      !selectedCategory && !selectedSubcategory
                        ? "text-[#123524] font-black"
                        : "text-[#5C685F]"
                    }`}
                  >
                    সবগুলো
                  </span>
                </button>

                {/* If a category is selected and has subcategories, show subcategories */}
                {currentCategory && currentSubcategories.length > 0
                  ? currentSubcategories.map((sub: any) => {
                      const isActive = selectedSubcategory === sub.slug || selectedSubcategory === sub.id;
                      const thumb =
                        sub.imageUrl ||
                        currentCategory.imageUrl ||
                        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200";
                      const count = getCategoryProductCount(sub);

                      return (
                        <button
                          key={sub.id || sub.slug}
                          type="button"
                          onClick={() => {
                            setSelectedSubcategory(isActive ? "" : sub.slug);
                          }}
                          className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer transition-all group ${
                            isActive ? "scale-105" : "opacity-85 hover:opacity-100"
                          }`}
                        >
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden transition-all relative shadow-xs ${
                              isActive
                                ? "border-2 border-[#a9762a] ring-2 ring-[#a9762a]/40 shadow-md"
                                : "border border-[#E4E8E4] bg-[#F5F7F5] group-hover:border-[#123524]/40"
                            }`}
                          >
                            <img
                              src={thumb}
                              alt={sub.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {count > 0 && (
                              <span className="absolute top-1 right-1 bg-[#123524] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white/60 shadow-xs">
                                {count}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] sm:text-xs text-center font-bold max-w-[84px] truncate ${
                              isActive ? "text-[#123524] font-black" : "text-[#5C685F]"
                            }`}
                          >
                            {sub.name}
                          </span>
                        </button>
                      );
                    })
                  : categories.map((cat: any) => {
                      const isActive = selectedCategory === cat.slug || selectedCategory === cat.id;
                      const thumb =
                        cat.imageUrl ||
                        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200";
                      const count = getCategoryProductCount(cat);

                      return (
                        <button
                          key={cat.id || cat.slug}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(isActive ? "" : cat.slug);
                            setSelectedSubcategory("");
                          }}
                          className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer transition-all group ${
                            isActive ? "scale-105" : "opacity-85 hover:opacity-100"
                          }`}
                        >
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden transition-all relative shadow-xs ${
                              isActive
                                ? "border-2 border-[#a9762a] ring-2 ring-[#a9762a]/40 shadow-md"
                                : "border border-[#E4E8E4] bg-[#F5F7F5] group-hover:border-[#123524]/40"
                            }`}
                          >
                            <img
                              src={thumb}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {count > 0 && (
                              <span className="absolute top-1 right-1 bg-[#123524] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white/60 shadow-xs">
                                {count}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] sm:text-xs text-center font-bold max-w-[84px] truncate ${
                              isActive ? "text-[#123524] font-black" : "text-[#5C685F]"
                            }`}
                          >
                            {cat.name}
                          </span>
                        </button>
                      );
                    })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN BODY SECTION (SIDEBAR + PRODUCTS GRID)                   */}
      {/* ========================================================================= */}
      <div className="w-full px-3 md:px-6 pt-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* --------------------------------------------------------------------- */}
          {/* DESKTOP SIDEBAR: Hidden on Mobile                                     */}
          {/* --------------------------------------------------------------------- */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <div className="bg-white rounded-3xl border border-[#e8e4db] p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 tracking-wide">
                  ক্যাটাগরি
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    রিসেট
                  </button>
                )}
              </div>

              {/* Subcategories quick trigger button */}
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-[#123524] hover:bg-emerald-100/80 font-extrabold text-xs transition-colors border border-emerald-200/80 cursor-pointer"
              >
                <span>সব ক্যাটাগরি ও সাব-ক্যাটাগরি</span>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>

              {/* Categories List */}
              <div className="space-y-1 pt-1">
                {categories.map((cat) => {
                  const isCurrent =
                    selectedCategory === cat.slug || selectedCategory === cat.id;
                  const Icon = getCategoryIcon(cat.name, cat.slug);
                  const count = getCategoryProductCount(cat);

                  return (
                    <div key={cat.id || cat.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(isCurrent ? "" : cat.slug);
                          setSelectedSubcategory("");
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-[#eaf4ee] text-[#123524] font-black border border-emerald-300/80 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-3.5 h-3.5 ${
                              isCurrent ? "text-[#123524]" : "text-slate-400"
                            }`}
                          />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {count}
                        </span>
                      </button>

                      {/* Subcategories list if category is active */}
                      {isCurrent && cat.childCategories && cat.childCategories.length > 0 && (
                        <div className="ml-4 pl-3 border-l-2 border-emerald-300 py-1 space-y-1 mt-1">
                          {cat.childCategories.map((sub: any) => {
                            const isSubActive =
                              selectedSubcategory === sub.slug || selectedSubcategory === sub.id;
                            const subCount = getCategoryProductCount(sub);

                            return (
                              <button
                                key={sub.id || sub.slug}
                                type="button"
                                onClick={() =>
                                  setSelectedSubcategory(isSubActive ? "" : sub.slug)
                                }
                                className={`w-full flex items-center justify-between py-1.5 px-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                                  isSubActive
                                    ? "bg-[#123524] text-white font-extrabold"
                                    : "text-slate-600 hover:text-[#123524] hover:bg-slate-50"
                                }`}
                              >
                                <span className="truncate">{sub.name}</span>
                                {subCount > 0 && (
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                      isSubActive
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {subCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* MAIN PRODUCTS AREA                                                    */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-9 space-y-4">
            {/* Breadcrumb & Category Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Link href="/" className="hover:text-[#123524] transition-colors">
                    হোম
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <Link href="/shop" className="hover:text-[#123524] transition-colors">
                    শপ ক্যাটালগ
                  </Link>
                  {currentCategory && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700">{currentCategory.name}</span>
                    </>
                  )}
                  {currentSubcategory && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[#123524] font-black">{currentSubcategory.name}</span>
                    </>
                  )}
                </nav>

                <h1 className="text-xl sm:text-2xl font-black text-[#123524] tracking-tight mt-1 font-['Manrope',sans-serif]">
                  {currentSubcategory
                    ? currentSubcategory.name
                    : currentCategory
                    ? currentCategory.name
                    : "সকল পণ্য কালেকশন"}
                </h1>
              </div>

              {/* Product Count Pill */}
              <div className="self-start sm:self-auto">
                <span className="inline-block bg-white px-3.5 py-1.5 rounded-full border border-[#e8e4db] text-xs font-black text-slate-700 shadow-2xs font-['Manrope']">
                  {displayedProducts.length} টি পণ্য
                </span>
              </div>
            </div>

            {/* STICKY TOOLBAR (Filter, Sort, View Toggle) */}
            <div className="sticky top-[108px] sm:top-[76px] z-30 bg-[#f6f3ec]/95 backdrop-blur-md py-1.5 transition-all">
              <div className="flex items-center gap-2">
                {/* 1. Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 px-4 rounded-2xl bg-white border text-xs font-black transition-all shadow-2xs cursor-pointer ${
                    activeFiltersCount > 0
                      ? "border-[#123524] text-[#123524] bg-emerald-50/60"
                      : "border-[#e8e4db] text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 text-[#123524]" />
                  <span>ফিল্টার</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4.5 h-4.5 rounded-full bg-[#123524] text-white text-[10px] flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* 2. Sort Dropdown */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-44 h-11 pl-3.5 pr-8 rounded-2xl bg-white border border-[#e8e4db] text-xs font-black text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#123524] shadow-2xs cursor-pointer"
                  >
                    <option value="newest">নতুন আগে</option>
                    <option value="price_asc">দাম: কম থেকে বেশি</option>
                    <option value="price_desc">দাম: বেশি থেকে কম</option>
                    <option value="discount_desc">সবচেয়ে বেশি ছাড়</option>
                    <option value="bestseller">জনপ্রিয় পণ্য</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* 3. In-Stock Fast Toggle */}
                <label className="hidden sm:flex items-center gap-2 h-11 px-3.5 rounded-2xl bg-white border border-[#e8e4db] text-xs font-bold text-slate-700 shadow-2xs cursor-pointer hover:border-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#123524] focus:ring-[#123524] w-3.5 h-3.5 accent-[#123524]"
                  />
                  <span>✓ স্টকে আছে</span>
                </label>

                {/* 4. Grid / List View Toggle */}
                <div className="flex items-center bg-white border border-[#e8e4db] rounded-2xl p-1 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-[#123524] text-white shadow-2xs"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="গ্রিড ভিউ"
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-[#123524] text-white shadow-2xs"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="লিস্ট ভিউ"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* EMPTY PRODUCTS STATE */}
            {displayedProducts.length === 0 && (
              <div className="bg-white rounded-3xl border border-[#e8e4db] p-8 sm:p-12 text-center space-y-3 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#123524] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-800">
                  কোনো পণ্য খুঁজে পাওয়া যায়নি
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  আপনার নির্বাচিত ফিল্টার বা সার্চ অনুযায়ী কোনো পণ্য নেই। ফিল্টার রিসেট করে আবার চেষ্টা করুন।
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#123524] hover:bg-[#1b4330] text-white text-xs font-black transition-colors cursor-pointer shadow-xs"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            )}

            {/* ================================================================= */}
            {/* PRODUCT CARDS (GRID VIEW: 2-Col Mobile, 3 Tablet, 4 Desktop)     */}
            {/* ================================================================= */}
            {displayedProducts.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayedProducts.map((product) => {
                  const displayPrice =
                    product.discountPrice !== null && product.discountPrice !== undefined
                      ? product.discountPrice
                      : product.price;
                  const originalPrice = product.price;
                  const hasDiscount =
                    product.discountPrice !== null &&
                    product.discountPrice !== undefined &&
                    product.price > product.discountPrice;
                  const discountPercent = hasDiscount
                    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
                    : 0;
                  const thumb =
                    product.thumbnail ||
                    (product.images && product.images[0]) ||
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400";
                  const isWishlisted = Boolean(wishlistIds[product.id]);
                  const hasVideo = Boolean(product.videoUrl);

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4db] shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between hover:border-[#123524]/30"
                    >
                      {/* Image Area */}
                      <div>
                        <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                          {/* Wishlist Heart Button (Top-Left) */}
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(product.id, product.name, e)}
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
                              src={thumb}
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
                          {/* Subcategory / Tag Tagline */}
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
                              ৳{displayPrice.toLocaleString()}
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
                              <span>৳{(originalPrice - displayPrice).toLocaleString()} সাশ্রয়</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons (Cart + Instant Order) */}
                      <div className="p-2.5 sm:p-3.5 pt-0 grid grid-cols-2 gap-1.5">
                        {/* 1. Add to Cart Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              discountPrice: product.discountPrice,
                              thumbnail: product.thumbnail || (product.images && product.images[0]) || "",
                            });
                            setIsCartOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>কার্ট</span>
                        </button>

                        {/* 2. Order Button (Forest Green CTA) */}
                        <button
                          type="button"
                          onClick={(e) => handleInstantBuy(product, e)}
                          className="w-full flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-[#123524] hover:bg-[#1b4d36] text-white text-[11px] font-black shadow-xs transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>অর্ডার</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================================================================= */}
            {/* PRODUCT CARDS (LIST VIEW)                                         */}
            {/* ================================================================= */}
            {displayedProducts.length > 0 && viewMode === "list" && (
              <div className="flex flex-col gap-3">
                {displayedProducts.map((product) => {
                  const displayPrice =
                    product.discountPrice !== null && product.discountPrice !== undefined
                      ? product.discountPrice
                      : product.price;
                  const originalPrice = product.price;
                  const hasDiscount =
                    product.discountPrice !== null &&
                    product.discountPrice !== undefined &&
                    product.price > product.discountPrice;
                  const discountPercent = hasDiscount
                    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
                    : 0;
                  const thumb =
                    product.thumbnail ||
                    (product.images && product.images[0]) ||
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400";
                  const isWishlisted = Boolean(wishlistIds[product.id]);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-[#e8e4db] p-3 flex flex-row items-center gap-3 sm:gap-4 shadow-2xs hover:shadow-md transition-all"
                    >
                      {/* Left Thumbnail */}
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <Link href={`/product/${product.slug || product.id}`}>
                          <img
                            src={thumb}
                            alt={product.name}
                            className="w-full h-full object-cover"
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
                          <p className="text-[10px] font-bold text-emerald-800">
                            {product.category?.name || "পণ্য"}
                          </p>
                          <Link href={`/product/${product.slug || product.id}`}>
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 hover:text-[#123524]">
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        <div className="flex items-baseline gap-2 font-['Manrope']">
                          <span className="text-sm sm:text-base font-black text-[#123524]">
                            ৳{displayPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              ৳{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart({
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                price: product.price,
                                discountPrice: product.discountPrice,
                                thumbnail: product.thumbnail || "",
                              });
                              setIsCartOpen(true);
                            }}
                            className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>কার্ট</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleInstantBuy(product, e)}
                            className="py-1.5 px-3 rounded-xl bg-[#123524] hover:bg-[#1b4d36] text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>অর্ডার করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE CATEGORY DRAWER                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCategoryDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b bg-[#123524] text-white">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" />
                  <h3 className="font-black text-sm">সকল ক্যাটাগরি তালিকা</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.name, cat.slug);
                  const isCurrent =
                    selectedCategory === cat.slug || selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id || cat.slug}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setSelectedSubcategory("");
                        setIsCategoryDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isCurrent
                          ? "bg-[#eaf4ee] text-[#123524] font-black border border-emerald-300"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#123524] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {getCategoryProductCount(cat)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. MOBILE FILTER BOTTOM SHEET DRAWER                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#123524]" />
                  <h3 className="font-extrabold text-sm text-slate-900">ফিল্টার অপশন</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. Sort Options */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    সাজান (Sort By)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "newest", label: "নতুন আগে" },
                      { id: "price_asc", label: "দাম: কম থেকে বেশি" },
                      { id: "price_desc", label: "দাম: বেশি থেকে কম" },
                      { id: "discount_desc", label: "সবচেয়ে বেশি ছাড়" },
                      { id: "bestseller", label: "জনপ্রিয় পণ্য" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSortBy(opt.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer border ${
                          sortBy === opt.id
                            ? "bg-[#123524] text-white border-[#123524]"
                            : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. In-Stock Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">
                      শুধু স্টকে থাকা পণ্য দেখুন
                    </span>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 text-[#123524] rounded accent-[#123524]"
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  রিসেট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="py-3 rounded-xl bg-[#123524] text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  ফিল্টার প্রয়োগ করুন ({displayedProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. SLIDING CART DRAWER                                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Cart Header */}
              <div className="flex h-16 items-center justify-between border-b px-5 bg-[#123524] text-white">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-sm tracking-wide">
                    আপনার শপিং কার্ট ({cartCount})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#123524] flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">আপনার কার্ট খালি</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      পছন্দের পণ্য কার্টে যুক্ত করে দ্রুত অর্ডার করুন।
                    </p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const price =
                      item.discountPrice !== null && item.discountPrice !== undefined
                        ? item.discountPrice
                        : item.price;
                    return (
                      <div
                        key={item.cartItemId || item.id}
                        className="flex gap-3 border border-slate-100 p-2.5 rounded-2xl bg-slate-50/50"
                      >
                        <img
                          src={item.thumbnail || "/placeholder.jpg"}
                          alt={item.name}
                          className="h-16 w-16 rounded-xl object-cover border bg-white shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="font-black text-xs text-slate-900 line-clamp-1 truncate">
                              {item.name}
                            </h4>
                            {item.variantName && (
                              <span className="inline-block text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-200">
                                {item.variantName}
                              </span>
                            )}
                            <p className="text-[11px] font-black text-[#123524] mt-0.5">
                              ৳{price.toLocaleString()} x {item.quantity}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.cartItemId || item.id, item.quantity - 1)
                                }
                                className="p-1 hover:bg-slate-100 cursor-pointer text-slate-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-black">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.cartItemId || item.id, item.quantity + 1)
                                }
                                className="p-1 hover:bg-slate-100 cursor-pointer text-slate-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.cartItemId || item.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50">
                  <div className="flex items-center justify-between font-black text-xs uppercase tracking-wider">
                    <span>মোট মূল্য:</span>
                    <span className="text-[#123524] text-base">
                      ৳{cartSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full block bg-[#123524] hover:bg-[#1b4d36] text-white font-black py-3.5 rounded-2xl text-center text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    অর্ডার সম্পন্ন করুন (Checkout)
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. BOTTOM MOBILE NAVIGATION BAR (Home / Categories / Cart / Account)     */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-xl md:hidden px-2 py-1.5 flex items-center justify-around">
        {/* Home */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-0.5 text-slate-600 hover:text-[#123524] transition-colors py-1 px-3"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">হোম</span>
        </Link>

        {/* Categories Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsCategoryDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-600 hover:text-[#123524] transition-colors py-1 px-3 cursor-pointer"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold">ক্যাটাগরি</span>
        </button>

        {/* Cart Trigger */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 text-slate-600 hover:text-[#123524] transition-colors py-1 px-3 cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute 0 top-0.5 right-2 w-4.5 h-4.5 rounded-full bg-[#f59e0b] text-[#123524] font-black text-[9px] flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-bold">কার্ট</span>
        </button>

        {/* Account */}
        <Link
          href={isAuthenticated ? (user?.role === "CUSTOMER" ? "/dashboard" : "/admin/dashboard") : "/login"}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-600 hover:text-[#123524] transition-colors py-1 px-3"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">একাউন্ট</span>
        </Link>
      </nav>
    </div>
  );
}
