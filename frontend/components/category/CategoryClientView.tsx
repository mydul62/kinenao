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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getCategoryIcon } from "@/components/header/CategoryMegaMenu";
import { toast } from "sonner";

interface CategoryClientViewProps {
  category: any;
  categories: any[];
  initialProducts: any[];
  initialSubcat?: string | null;
  initialSort?: string;
}

export default function CategoryClientView({
  category,
  categories = [],
  initialProducts = [],
  initialSubcat = null,
  initialSort = "newest",
}: CategoryClientViewProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartSubtotal,
    formattedReservationTimer,
    isReservationExpired,
    resetReservationTimer,
  } = useCart();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubcat, setActiveSubcat] = useState<string | null>(initialSubcat);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(initialSort || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [expandedDrawerCats, setExpandedDrawerCats] = useState<Record<string, boolean>>({
    [category?.id || category?.slug || ""]: true,
  });
  const [wishlistIds, setWishlistIds] = useState<Record<string, boolean>>({});

  // Subcategories from category
  const subcategories = useMemo(() => {
    return category?.childCategories || category?.children || [];
  }, [category]);

  // Wishlist toggle
  const toggleWishlist = (productId: string, productName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistIds((prev) => {
      const isFav = Boolean(prev[productId]);
      if (isFav) {
        toast.info(`"${productName}" উইশলিস্ট থেকে সরানো হয়েছে`);
      } else {
        toast.success(`"${productName}" উইশলিস্টে যুক্ত হয়েছে!`);
      }
      return { ...prev, [productId]: !isFav };
    });
  };

  // Drawer category accordion toggle
  const toggleDrawerCategory = (catId: string) => {
    setExpandedDrawerCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Direct Order / Buy Now Action
  const handleDirectOrder = (product: any, e: React.MouseEvent) => {
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
    router.push(`/product/${product.slug || product.id}#order-form`);
  };

  // Add to Cart with Toast
  const handleAddToCart = (product: any, e: React.MouseEvent) => {
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
    toast.success(`"${product.name}" কার্টে যুক্ত হয়েছে!`);
  };

  // Filter & Sort Products
  const displayedProducts = useMemo(() => {
    let list = [...initialProducts];

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.toLowerCase().includes(q))
      );
    }

    // Subcategory filtering
    if (activeSubcat) {
      const selectedSub = subcategories.find(
        (s: any) => s.slug === activeSubcat || s.id === activeSubcat
      );
      list = list.filter((p) => {
        return (
          p.categoryId === activeSubcat ||
          (selectedSub && p.categoryId === selectedSub.id) ||
          p.category?.slug === activeSubcat ||
          p.category?.id === activeSubcat ||
          (selectedSub && p.category?.name === selectedSub.name) ||
          (p.tags && p.tags.toLowerCase().includes(activeSubcat.toLowerCase())) ||
          (p.slug && p.slug.toLowerCase().includes(activeSubcat.toLowerCase()))
        );
      });
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
    } else if (sortBy === "discount_desc") {
      list.sort((a, b) => {
        const discA = a.discountPrice ? ((a.price - a.discountPrice) / a.price) * 100 : 0;
        const discB = b.discountPrice ? ((b.price - b.discountPrice) / b.price) * 100 : 0;
        return discB - discA;
      });
    } else if (sortBy === "bestseller") {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return list;
  }, [initialProducts, searchQuery, activeSubcat, inStockOnly, sortBy, subcategories]);

  const activeFiltersCount =
    (activeSubcat ? 1 : 0) + (inStockOnly ? 1 : 0) + (sortBy !== "newest" ? 1 : 0);

  const resetAllFilters = () => {
    setActiveSubcat(null);
    setInStockOnly(false);
    setSortBy("newest");
    setSearchQuery("");
    setIsMobileFilterOpen(false);
  };

  const getCategoryProductCount = (cat: any) => {
    if (!cat) return 0;
    let count = cat._count?.products ?? 0;
    const childrenList = cat.childCategories || cat.children || [];
    if (childrenList.length > 0) {
      const childSum = childrenList.reduce(
        (acc: number, ch: any) => acc + (ch._count?.products ?? ch.productsCount ?? 0),
        0
      );
      if (childSum > 0) {
        count = Math.max(count, (cat._count?.directProducts ?? 0) + childSum, childSum);
      }
    }
    return count;
  };

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-slate-900 pb-20 md:pb-12 font-['Inter',sans-serif]">
      {/* ========================================================================= */}
      {/* CATEGORY HEADER BANNER & SUBCATEGORIES FILTER RAIL                        */}
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
                  ক্যাটাগরি
                </Link>
                <span>/</span>
                <span className="text-[#131914] font-bold">{category?.name}</span>
              </div>

              {/* Title & Count */}
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
                  {category?.name}
                </h1>
                <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
                  {displayedProducts.length}টি পণ্য
                </span>
              </div>
              {category?.description && (
                <p className="text-[#5C685F] text-xs sm:text-sm mt-1 max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>

            {/* In-page Category Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8B958D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${category?.name || "পণ্য"} খুঁজুন...`}
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

          {/* Subcategories Card Rail */}
          {subcategories.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-[#E4E8E4] overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C685F] mb-3 font-['Manrope']">
                সাবক্যাটাগরি সমূহ:
              </p>
              <div className="w-full flex items-center gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1">
                {/* "সবগুলো" (All) Card */}
                <button
                  type="button"
                  onClick={() => setActiveSubcat(null)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer transition-all group ${
                    activeSubcat === null ? "scale-105" : "opacity-85 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xs transition-all ${
                      activeSubcat === null
                        ? "border-2 border-[#a9762a] ring-2 ring-[#a9762a]/40 bg-[#123524] text-white"
                        : "bg-[#F5F7F5] border border-[#E4E8E4] text-[#123524] group-hover:border-[#123524]/40"
                    }`}
                  >
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs text-center font-bold tracking-tight ${
                      activeSubcat === null ? "text-[#123524] font-black" : "text-[#5C685F]"
                    }`}
                  >
                    সবগুলো
                  </span>
                </button>

                {/* Subcategories Card Items */}
                {subcategories.map((sub: any) => {
                  const isActive = activeSubcat === sub.slug || activeSubcat === sub.id;
                  const thumb =
                    sub.imageUrl ||
                    category?.imageUrl ||
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200";
                  const count = getCategoryProductCount(sub);

                  return (
                    <button
                      key={sub.id || sub.slug}
                      type="button"
                      onClick={() => setActiveSubcat(isActive ? null : sub.slug)}
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
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN BODY SECTION ON WARM CREAM BACKGROUND (#f6f3ec)                 */}
      {/* ========================================================================= */}
      <div className="w-full px-3 md:px-6 pt-4 space-y-4">
        {/* Desktop Sidebar + Products Grid 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* DESKTOP LEFT SIDEBAR (Screenshot 4) */}
          <div className="hidden lg:block lg:col-span-3 space-y-3 sticky top-24">
            <div className="bg-white rounded-3xl p-4 border border-[#e8e4db] shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
                ক্যাটাগরি
              </h3>

              {/* All Categories & Subcategories Drawer Trigger Button */}
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-[#123524] hover:bg-emerald-100/80 font-extrabold text-xs transition-colors border border-emerald-200/80 cursor-pointer"
              >
                <span>সব ক্যাটাগরি ও সাব-ক্যাটাগরি</span>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>

              {/* Categories list */}
              <div className="space-y-1 pt-1">
                {categories.map((cat) => {
                  const isCurrent = cat.slug === category?.slug || cat.id === category?.id;
                  const Icon = getCategoryIcon(cat.name, cat.slug);
                  const count = getCategoryProductCount(cat);

                  return (
                    <Link
                      key={cat.id || cat.slug}
                      href={`/category/${cat.slug}`}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-[#eaf4ee] text-[#123524] font-black border border-emerald-300/80 shadow-2xs"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-[#123524]" : "text-slate-400"}`} />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MAIN PRODUCTS AREA */}
          <div className="lg:col-span-9 space-y-4">
            {/* Breadcrumb & Category Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Link href="/" className="hover:text-[#123524] transition-colors">
                    হোম
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-700">{category?.name || "ক্যাটাগরি"}</span>
                  {activeSubcat && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[#123524] font-black">
                        {subcategories.find((s: any) => s.slug === activeSubcat || s.id === activeSubcat)?.name ||
                          activeSubcat}
                      </span>
                    </>
                  )}
                </nav>

                <h1 className="text-xl sm:text-2xl font-black text-[#123524] tracking-tight mt-1">
                  {activeSubcat
                    ? subcategories.find((s: any) => s.slug === activeSubcat || s.id === activeSubcat)?.name ||
                      category?.name
                    : category?.name || "ব্যাগ ও পার্স"}
                </h1>
              </div>

              {/* Product Count Pill */}
              <div className="self-start sm:self-auto">
                <span className="inline-block bg-white px-3.5 py-1.5 rounded-full border border-[#e8e4db] text-xs font-black text-slate-700 shadow-2xs">
                  {displayedProducts.length} টি পণ্য
                </span>
              </div>
            </div>

            {/* STICKY / INLINE TOOLBAR (Filter, Sort, View Toggle) - Stays attached to top during scroll */}
            <div className="sticky top-[108px] sm:top-[76px] z-30 bg-[#f6f3ec]/95 backdrop-blur-md py-1.5 transition-all">
              <div className="flex items-center gap-2">
                {/* 1. Filter Button (Opens Bottom Sheet on Mobile / Sidebar toggle) */}
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

                {/* 2. Sort Dropdown Pill */}
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

                {/* 3. In-Stock Fast Toggle (Desktop) */}
                <label className="hidden sm:flex items-center gap-2 h-11 px-3.5 rounded-2xl bg-white border border-[#e8e4db] text-xs font-bold text-slate-700 shadow-2xs cursor-pointer hover:border-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#123524] focus:ring-[#123524] w-3.5 h-3.5 accent-[#123524]"
                  />
                  <span>✓ স্টকে আছে</span>
                </label>

                {/* 4. Grid / List View Mode Toggle */}
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
                            <span className="absolute top-0 right-0 z-10 bg-[#123524] text-white font-black text-[10px] sm:text-[11px] px-2 py-1 rounded-bl-xl shadow-xs">
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
                            {product.category?.name || category?.name || "ফ্যাশন"}
                          </p>

                          {/* Product Title */}
                          <Link href={`/product/${product.slug || product.id}`} className="block">
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-[#123524] transition-colors min-h-[32px]">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Price & Original Strikethrough */}
                          <div className="flex items-baseline gap-1.5 pt-0.5">
                            <span className="text-sm sm:text-base font-black text-[#123524]">
                              ৳{displayPrice.toLocaleString()}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-slate-400 font-semibold line-through">
                                ৳{originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Savings Badge Pill */}
                          {hasDiscount && (
                            <div className="pt-0.5">
                              <span className="inline-block bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                {discountPercent}% ছাড়
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Actions Row (Cart + Order Now Button) */}
                      <div className="p-2.5 sm:p-3.5 pt-0 flex items-center gap-1.5">
                        {/* Cart Button */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                          title="কার্টে যোগ করুন"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>

                        {/* Order Now Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDirectOrder(product, e)}
                          className="flex-1 h-9 sm:h-10 rounded-xl bg-[#123524] hover:bg-[#1b4d36] active:scale-[0.98] text-white text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>অর্ডার করুন</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================================================================= */}
            {/* PRODUCT CARDS (LIST VIEW: Horizontal Cards - Screenshot 2)       */}
            {/* ================================================================= */}
            {displayedProducts.length > 0 && viewMode === "list" && (
              <div className="space-y-3">
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
                      className="group bg-white rounded-3xl border border-[#e8e4db] shadow-2xs hover:shadow-md transition-all p-3 flex gap-3.5 sm:gap-5 items-center hover:border-[#123524]/30"
                    >
                      {/* Left: Square Thumbnail */}
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(product.id, product.name, e)}
                          className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-xs cursor-pointer"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>

                        {hasDiscount && (
                          <span className="absolute top-0 right-0 z-10 bg-[#123524] text-white font-black text-[9px] px-1.5 py-0.5 rounded-bl-lg">
                            {discountPercent}% ছাড়
                          </span>
                        )}

                        <Link href={`/product/${product.slug || product.id}`} className="block w-full h-full">
                          <img
                            src={thumb}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform"
                          />
                        </Link>

                        {hasVideo && (
                          <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/75 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Play className="w-2 h-2 fill-white" />
                            <span>ভিডিও</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Info & Actions */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p className="text-[10px] font-extrabold text-emerald-800 truncate">
                          {product.category?.name || category?.name || "ফ্যাশন"}
                        </p>

                        <Link href={`/product/${product.slug || product.id}`}>
                          <h3 className="text-xs sm:text-base font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-[#123524] transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-baseline gap-2">
                          <span className="text-sm sm:text-lg font-black text-[#123524]">
                            ৳{displayPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 font-semibold line-through">
                              ৳{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {hasDiscount && (
                          <span className="inline-block bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            {discountPercent}% ছাড়
                          </span>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shrink-0"
                            title="কার্টে যোগ করুন"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDirectOrder(product, e)}
                            className="h-9 px-4 rounded-xl bg-[#123524] hover:bg-[#1b4d36] text-white text-xs font-black flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
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
      {/* 3. SLIDE-UP BOTTOM SHEET FOR FILTERS & SORT (Screenshot 3)               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-200 overflow-hidden"
            >
              {/* Sheet Top Drag Bar & Header */}
              <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="w-full flex flex-col items-center">
                  <div className="w-12 h-1.5 rounded-full bg-slate-300 mb-3" />
                  <div className="w-full flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">ফিল্টার ও সর্ট</h3>
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Filter Options */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* 1. Sort Options (Radio buttons) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    সর্ট করুন
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { id: "newest", label: "নতুন পণ্য আগে" },
                      { id: "price_asc", label: "দাম: কম থেকে বেশি" },
                      { id: "price_desc", label: "দাম: বেশি থেকে কম" },
                      { id: "discount_desc", label: "সবচেয়ে বেশি ছাড়" },
                      { id: "bestseller", label: "জনপ্রিয় পণ্য" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-3 text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="sortGroup"
                          value={opt.id}
                          checked={sortBy === opt.id}
                          onChange={() => setSortBy(opt.id)}
                          className="w-4 h-4 text-[#123524] accent-[#123524] cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Subcategories List (Checkboxes) */}
                {subcategories.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      উপ-ক্যাটাগরি
                    </h4>
                    <div className="space-y-2.5">
                      {subcategories.map((sub: any) => {
                        const isChecked = activeSubcat === sub.slug;
                        return (
                          <label
                            key={sub.id || sub.slug}
                            className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                          >
                            <span>{sub.name}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => setActiveSubcat(isChecked ? null : sub.slug)}
                              className="w-4 h-4 rounded text-[#123524] accent-[#123524] cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Stock Filter */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    স্টক
                  </h4>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer">
                    <span>শুধু স্টকে আছে</span>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-[#123524] accent-[#123524] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex-1 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  রিসেট
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-[#123524] hover:bg-[#1b4330] text-white font-black text-xs transition-colors shadow-sm cursor-pointer"
                >
                  ফিল্টার প্রয়োগ করুন
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. SLIDE-IN LEFT DRAWER FOR ALL CATEGORIES (Screenshot 5)                */}
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
              className="fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden border-r border-slate-200"
            >
              {/* Drawer Top Header (Forest Green) */}
              <div className="flex h-16 items-center justify-between px-5 bg-[#123524] text-white">
                <div>
                  <h3 className="font-black text-base tracking-wide text-white leading-tight">
                    সব ক্যাটাগরি
                  </h3>
                  <p className="text-[10px] text-emerald-200 font-semibold">
                    {categories.length}টি মূল ক্যাটাগরি
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDrawerOpen(false)}
                    className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Accordion Categories List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.name, cat.slug);
                  const isCurrent = cat.slug === category?.slug || cat.id === category?.id;
                  const hasChildren = (cat.childCategories && cat.childCategories.length > 0) || (cat.children && cat.children.length > 0);
                  const childrenList = cat.childCategories || cat.children || [];
                  const isExpanded = Boolean(expandedDrawerCats[cat.id || cat.slug]);

                  return (
                    <div
                      key={cat.id || cat.slug}
                      className={`border rounded-2xl overflow-hidden transition-all ${
                        isCurrent ? "border-emerald-300 bg-[#eaf4ee]/60" : "border-slate-200/80 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors">
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => setIsCategoryDrawerOpen(false)}
                          className="flex items-center gap-2.5 min-w-0 flex-1"
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isCurrent ? "bg-[#123524] text-white" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-xs truncate ${
                              isCurrent ? "font-black text-[#123524]" : "font-extrabold text-slate-800"
                            }`}
                          >
                            {cat.name}
                          </span>
                        </Link>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {getCategoryProductCount(cat)} পণ্য
                          </span>
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleDrawerCategory(cat.id || cat.slug);
                              }}
                              className="p-1 text-slate-400 hover:text-[#123524] cursor-pointer"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180 text-[#123524]" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subcategories list */}
                      {hasChildren && isExpanded && (
                        <div className="bg-slate-50/90 px-3.5 py-2 space-y-1 border-t border-slate-100">
                          {childrenList.map((sub: any) => {
                            const isSubActive = activeSubcat === sub.slug;
                            const subCount = sub._count?.products ?? sub.productsCount;
                            return (
                              <Link
                                key={sub.id || sub.slug}
                                href={`/category/${cat.slug}?sub=${sub.slug}`}
                                onClick={() => setIsCategoryDrawerOpen(false)}
                                className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs font-bold transition-colors ${
                                  isSubActive
                                    ? "bg-[#123524] text-white font-black"
                                    : "text-slate-600 hover:text-[#123524] hover:bg-white"
                                }`}
                              >
                                <span>• {sub.name}</span>
                                {subCount !== undefined && (
                                  <span className="text-[10px] opacity-75">{subCount}</span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold">
                <Link
                  href="/shop"
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="text-[#123524] font-black hover:underline"
                >
                  সকল পণ্য দেখুন →
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  আমার একাউন্ট
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. SLIDING CART DRAWER                                                   */}
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
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between border-b px-5 bg-[#123524] text-white">
                <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-emerald-300" /> শপিং কার্ট ({cartCount})
                </h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full p-1.5 hover:bg-white/10 text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length > 0 && (
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold ${
                      isReservationExpired
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <span>
                        {isReservationExpired
                          ? "কার্ট রিজার্ভেশনের সময় শেষ!"
                          : `কার্ট সংরক্ষিত: ${formattedReservationTimer}`}
                      </span>
                    </div>
                    {isReservationExpired && (
                      <button
                        type="button"
                        onClick={resetReservationTimer}
                        className="text-[11px] font-bold text-rose-700 underline cursor-pointer"
                      >
                        রিনিউ
                      </button>
                    )}
                  </div>
                )}

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-16">
                    <ShoppingBag className="w-12 h-12 text-slate-300" />
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      আপনার কার্ট খালি রয়েছে
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="mt-2 bg-[#123524] text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-[#1b4d36] transition-all cursor-pointer shadow-xs"
                    >
                      পণ্য ব্রাউজ করুন
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const price = item.discountPrice !== null ? item.discountPrice : item.price;
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
                              <span className="inline-block text-[9px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded mt-0.5 border border-purple-200">
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
                                onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                                className="p-1 hover:bg-slate-100 cursor-pointer text-slate-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-black">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
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
                    <span className="text-[#123524] text-base">৳{cartSubtotal.toLocaleString()}</span>
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
    </div>
  );
}
