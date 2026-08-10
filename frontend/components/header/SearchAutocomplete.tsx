"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Tag, ChevronRight, Sparkles, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";

const POPULAR_SEARCHES = [
  "শাড়ি",
  "থ্রি-পিস",
  "কসমেটিকস",
  "ঘড়ি",
  "লেডিস ব্যাগ",
  "পাঞ্জাবি",
  "লিপস্টিক",
];

interface SearchAutocompleteProps {
  className?: string;
  isMobileModal?: boolean;
  onSelect?: () => void;
}

export default function SearchAutocomplete({
  className = "",
  isMobileModal = false,
  onSelect,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [matchingCats, setMatchingCats] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced API search fetch
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setProducts([]);
      setMatchingCats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      api
        .get(`/products?search=${encodeURIComponent(query.trim())}&limit=6`)
        .then(({ data }) => {
          const prods = data?.data?.products || data?.products || [];
          setProducts(prods);

          // Extract matching categories
          const catsMap: Record<string, any> = {};
          prods.forEach((p: any) => {
            if (p.category) {
              catsMap[p.category.id || p.category.slug] = p.category;
            }
          });
          setMatchingCats(Object.values(catsMap));
        })
        .catch(() => {
          setProducts([]);
          setMatchingCats([]);
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (onSelect) onSelect();
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectPill = (term: string) => {
    setQuery(term);
    setIsOpen(true);
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={containerRef} className={`relative font-['Inter',sans-serif] ${className}`}>
      {/* 1. Search Form Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <Search className="w-4 h-4 text-[#8B958D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="পণ্য, শাড়ি, ওয়ালেট, কসমেটিকস খুঁজুন..."
          className="w-full h-10 pl-9 pr-9 rounded-xl bg-[#F5F7F5] border border-[#E4E8E4] focus:border-[#123524] focus:bg-white text-xs font-semibold text-[#131914] placeholder-[#8B958D] outline-none transition-all shadow-2xs"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setProducts([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6.5 h-6.5 rounded-lg bg-[#123524] text-white flex items-center justify-center cursor-pointer hover:bg-[#1B4A34] transition-colors"
          >
            <Search className="w-3 h-3" />
          </button>
        )}
      </form>

      {/* 2. Instant Autocomplete Dropdown Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-[#E4E8E4] rounded-2xl shadow-2xl overflow-hidden p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* A. If Query is Empty: Show Popular Searches */}
          {!query.trim() && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#123524] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>জনপ্রিয় অনুসন্ধান (Popular Searches):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      handleSelectPill(term);
                      if (onSelect) onSelect();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#F5F7F5] hover:bg-[#E4EEE7] hover:text-[#123524] border border-[#E4E8E4] text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* B. Loading Spinner */}
          {loading && (
            <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#123524]" />
              <span className="text-xs font-bold text-slate-600">খোঁজা হচ্ছে...</span>
            </div>
          )}

          {/* C. Matching Categories (If Found) */}
          {!loading && matchingCats.length > 0 && (
            <div className="space-y-1 pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                ক্যাটাগরি:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {matchingCats.map((cat: any) => (
                  <Link
                    key={cat.id || cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      if (onSelect) onSelect();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#123524] hover:bg-emerald-100 text-xs font-black transition-colors flex items-center gap-1 border border-emerald-200"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* D. Matching Products List */}
          {!loading && query.trim().length >= 2 && products.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                পণ্য সমূহ ({products.length}):
              </span>
              <div className="space-y-1">
                {products.map((product) => {
                  const displayPrice =
                    product.discountPrice !== null && product.discountPrice !== undefined
                      ? product.discountPrice
                      : product.price;
                  const originalPrice = product.price;
                  const hasDiscount =
                    product.discountPrice !== null &&
                    product.discountPrice !== undefined &&
                    product.price > product.discountPrice;
                  const thumb =
                    product.thumbnail ||
                    (product.images && product.images[0]) ||
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200";

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug || product.id}`}
                      onClick={() => {
                        setIsOpen(false);
                        if (onSelect) onSelect();
                      }}
                      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F5F7F5] transition-colors group cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <img
                        src={thumb}
                        alt={product.name}
                        className="w-11 h-11 rounded-lg object-cover border border-[#E4E8E4] bg-slate-50 shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#123524] transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline gap-1.5 mt-0.5 font-['Manrope']">
                          <span className="text-xs font-black text-[#123524]">
                            ৳{displayPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-400 line-through font-semibold">
                              ৳{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#123524] transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>

              {/* View All Button */}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full py-2.5 px-3 rounded-xl bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2 shadow-xs"
              >
                <span>সকল "{query}" পণ্য দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* E. No Products Found State */}
          {!loading && query.trim().length >= 2 && products.length === 0 && (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                "{query}" নামের কোনো পণ্য পাওয়া যায়নি
              </p>
              <p className="text-[11px] text-slate-400">
                অন্য কোনো নামে খুঁজুন অথবা ক্যাটালগ পেজে সবগুলো পণ্য দেখুন।
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
