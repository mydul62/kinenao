"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Percent,
  Sparkles,
  Layers,
} from "lucide-react";

interface HomeClientViewProps {
  categories: any[];
  banners: any[];
  allProducts: any[];
  brands: any[];
  faqs: any[];
  testimonials: any[];
}

export default function HomeClientView({
  categories,
  banners,
  allProducts,
  brands,
  faqs,
  testimonials,
}: HomeClientViewProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Group products for home showcases
  const featuredProducts = allProducts.filter((p: any) => p.isActive && p.isFeatured).slice(0, 8);
  const bestSellers = allProducts.filter((p: any) => p.isActive && p.isBestSeller).slice(0, 8);
  const flashSale = allProducts.filter((p: any) => p.isActive && p.isFlashSale).slice(0, 8);
  const newArrivals = allProducts
    .filter(
      (p: any) =>
        p.isActive &&
        (p.isNewArrival ||
          p.promotionalBadges?.includes("🆕 New Arrival") ||
          p.tags?.includes("new"))
    )
    .slice(0, 8);
  const trending = allProducts
    .filter(
      (p: any) =>
        p.isActive &&
        (p.isTrending ||
          p.promotionalBadges?.includes("⭐ Trending") ||
          p.promotionalBadges?.includes("🔥 Hot Deal") ||
          p.tags?.includes("trending"))
    )
    .slice(0, 8);

  const defaultBanners = [
    {
      id: "banner-1",
      title: "১০০% খাঁটি ও প্রিমিয়াম কালেকশন",
      subtitle: "সারা দেশে ক্যাশ অন ডেলিভারি সহ ঘরে বসেই কেনাকাটা করুন সেরা দামে।",
      imageUrl:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
      linkUrl: "/shop",
    },
    {
      id: "banner-2",
      title: "ঐতিহ্যবাহী জামদানি ও কাতান শাড়ি",
      subtitle: "উৎসব ও বিয়ের জমকালো সাজে সেরা ডিজাইনের প্রিমিয়াম শাড়ি কালেকশন।",
      imageUrl:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
      linkUrl: "/category/sari",
    },
    {
      id: "banner-3",
      title: "খাঁটি ও প্রাকৃতিক অর্গানিক খাদ্যপণ্য",
      subtitle: "সুন্দরবনের মধু, কাঠের ঘানির সরিষার তেল ও পুষ্টিকর সুপারফুড।",
      imageUrl:
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop",
      linkUrl: "/category/organic-products",
    },
  ];

  const activeBanners = banners && banners.length > 0 ? banners : defaultBanners;

  // Hero Section Auto-Slide Effect
  useEffect(() => {
    if (!activeBanners || activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev >= activeBanners.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners]);

  const nextBanner = () => {
    if (!activeBanners || activeBanners.length === 0) return;
    setCurrentBanner((prev) => (prev >= activeBanners.length - 1 ? 0 : prev + 1));
  };

  const prevBanner = () => {
    if (!activeBanners || activeBanners.length === 0) return;
    setCurrentBanner((prev) => (prev <= 0 ? activeBanners.length - 1 : prev - 1));
  };

  const scrollCategoryLeft = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollCategoryRight = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col space-y-10 sm:space-y-14">
      {/* 1. Hero Dynamic Promotional Banner Slider */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[360px] md:min-h-[440px] flex items-center">
        {activeBanners.map((banner, index) => {
          const isActive = index === currentBanner;
          const bgImage =
            banner.imageUrl ||
            banner.image ||
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop";

          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
              </div>

              <div className="container mx-auto h-full flex flex-col justify-center px-6 md:px-12 relative z-20 max-w-6xl py-12">
                <div className="max-w-xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-600/90 text-white font-black text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
                    <Sparkles className="w-3.5 h-3.5" /> 100% Authentic Quality
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight tracking-tight text-white">
                    {banner.title || "এক্সক্লুসিভ কালেকশন"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium line-clamp-2">
                    {banner.subtitle ||
                      "সারা দেশে ১০০% ক্যাশ অন হোম ডেলিভারিতে আসল পণ্য কেনাকাটা করুন।"}
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href={banner.linkUrl || "/shop"}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3 rounded-xl shadow-lg transition-all"
                    >
                      Shop Now
                    </Link>
                    <Link
                      href="/shop"
                      className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl transition-all"
                    >
                      Browse All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {activeBanners.length > 1 && (
          <>
            <button
              onClick={prevBanner}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </section>

      {/* 2. Trust Badges Banner */}
      <section className="w-full px-3 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 bg-white border border-slate-200/80 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs">
          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-800">সারা দেশে ডেলিভারি</h4>
              <p className="text-[10px] text-slate-400 font-medium">দ্রুত ও নিরাপদ হোম ডেলিভারি</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-800">১০০% আসল পণ্য</h4>
              <p className="text-[10px] text-slate-400 font-medium">কোয়ালিটি গ্যারান্টি</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-800">সহজ রিটার্ন</h4>
              <p className="text-[10px] text-slate-400 font-medium">চেক করে নেওয়ার সুবিধা</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-800">সেরা অফার</h4>
              <p className="text-[10px] text-slate-400 font-medium">ডিসকাউন্ট ও ক্যাশব্যাক</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid Showcase (Full Width, No Slider) */}
      {categories.length > 0 && (
        <section className="w-full px-3 md:px-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>জনপ্রিয় ক্যাটাগরি</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                আপনার পছন্দের ক্যাটাগরি ব্রাউজ করুন
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>সব দেখুন ({categories.length})</span> <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-2 sm:gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                href={`/category/${cat.slug}`}
                className="bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-2 sm:p-3 flex flex-col items-center text-center group shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-50 mb-1.5 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={
                      cat.imageUrl ||
                      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=300&auto=format&fit=crop"
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h4 className="font-extrabold text-[11px] sm:text-xs text-slate-800 group-hover:text-emerald-700 line-clamp-1 leading-snug">
                  {cat.name}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Featured Products Showcase (Full Width) */}
      {featuredProducts.length > 0 && (
        <section className="w-full px-3 md:px-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">ফিচার্ড কালেকশন</h3>
              <p className="text-xs text-slate-500 font-medium">আমাদের সেরা নির্বাচিত পণ্যসমূহ</p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>সবগুলো দেখুন</span> <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Best Sellers Showcase (Full Width) */}
      {bestSellers.length > 0 && (
        <section className="w-full px-3 md:px-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">বেস্ট সেলার আইটেম</h3>
              <p className="text-xs text-slate-500 font-medium">সবচেয়ে বেশি বিক্রিত পণ্যসমূহ</p>
            </div>
            <Link
              href="/shop?sort=bestseller"
              className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>সবগুলো দেখুন</span> <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 6. FAQs Section (Full Width) */}
      {faqs.length > 0 && (
        <section className="w-full px-3 md:px-6 space-y-3">
          <div className="text-center max-w-xl mx-auto mb-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">সচরাচর জিজ্ঞাসিত প্রশ্নাবলী</h3>
            <p className="text-xs text-slate-500 mt-0.5">অর্ডার ও ডেলিভারি সম্পর্কিত তথ্য</p>
          </div>

          <div className="space-y-2 w-full max-w-5xl mx-auto">
            {faqs.map((faq, i) => (
              <details
                key={faq.id || i}
                className="group bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs cursor-pointer"
              >
                <summary className="font-extrabold text-xs sm:text-sm text-slate-800 flex items-center justify-between select-none">
                  <span>{faq.question}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5 pt-2.5 border-t border-slate-100">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 7. Testimonials (Full Width) */}
      {testimonials.length > 0 && (
        <section className="w-full py-10 bg-white border-t border-b border-slate-200/60 px-3 md:px-6">
          <div className="w-full">
            <div className="text-center max-w-md mx-auto mb-6">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">গ্রাহকদের মতামত</h3>
              <p className="text-xs text-slate-500 mt-0.5">আমাদের সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full">
              {testimonials.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2 shadow-2xs"
                >
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{t.comment}"</p>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{t.name}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
