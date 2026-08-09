"use client";

import React, { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
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
  Smile,
  Palette,
  Crown,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockCategories,
  mockBrands,
  mockProducts,
  mockBanners,
  mockFaqs,
  mockTestimonials,
} from "@/lib/mockData";

export default function Home() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [flashSale, setFlashSale] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>(mockBanners);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [faqs, setFaqs] = useState<any[]>(mockFaqs);
  const [brands, setBrands] = useState<any[]>(mockBrands);
  const [isLoading, setIsLoading] = useState(true);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch categories
        const catRes = await api.get("/categories?type=tree");
        const cats = catRes.data?.data?.categories;
        setCategories(cats && cats.length > 0 ? cats : mockCategories);
      } catch (err) {
        console.error("Categories fetch error, using mock:", err);
        setCategories(mockCategories);
      }

      try {
        // 2. Fetch products and distribute
        const prodRes = await api.get("/products?limit=50");
        const allProds = prodRes.data?.data?.products || [];

        if (allProds.length > 0) {
          const featured = allProds.filter((p: any) => p.isActive && p.isFeatured);
          const best = allProds.filter((p: any) => p.isActive && p.isBestSeller);
          const flash = allProds.filter((p: any) => p.isActive && p.isFlashSale);
          const newArr = allProds.filter(
            (p: any) => p.isActive && (p.isNewArrival || p.promotionalBadges?.includes("🆕 New Arrival") || p.tags?.includes("new"))
          );
          const trend = allProds.filter(
            (p: any) => p.isActive && (p.isTrending || p.promotionalBadges?.includes("⭐ Trending") || p.promotionalBadges?.includes("🔥 Hot Deal") || p.tags?.includes("trending"))
          );
          const customPromo = allProds.filter(
            (p: any) => p.isActive && (p.customBadge || (p.promotionalBadges && p.promotionalBadges.length > 0))
          );

          setFeaturedProducts(featured.slice(0, 8));
          setBestSellers(best.slice(0, 8));
          setFlashSale(flash.slice(0, 8));
          setNewArrivals(newArr.slice(0, 8));
          setTrending(trend.slice(0, 8));
          setRecommended(customPromo.length > 0 ? customPromo.slice(0, 8) : allProds.slice(0, 8));
        } else {
          loadMockProducts();
        }
      } catch (err) {
        console.error("Products fetch error, using mock:", err);
        loadMockProducts();
      }

      try {
        // 3. Fetch brands
        const brandRes = await api.get("/brands");
        const brandList = brandRes.data?.data?.brands;
        setBrands(brandList && brandList.length > 0 ? brandList : mockBrands);
      } catch (err) {
        console.error("Brands error, using mock:", err);
        setBrands(mockBrands);
      }

      try {
        // 4. Fetch banners
        const bannerRes = await api.get("/settings/hero_banners");
        const bannerList = bannerRes.data?.data?.value;
        setBanners(bannerList && bannerList.length > 0 ? bannerList : mockBanners);
      } catch {
        setBanners(mockBanners);
      }

      try {
        // 5. Fetch FAQs
        const faqRes = await api.get("/settings/faqs");
        const faqList = faqRes.data?.data?.value;
        setFaqs(faqList && faqList.length > 0 ? faqList : mockFaqs);
      } catch {
        setFaqs(mockFaqs);
      }
      setIsLoading(false);
    };

    const loadMockProducts = () => {
      setFeaturedProducts(mockProducts.filter(p => p.isFeatured));
      setBestSellers(mockProducts.filter(p => p.isBestSeller));
      setFlashSale(mockProducts.filter(p => p.isFlashSale));
      setNewArrivals(mockProducts.filter(p => p.isNewArrival));
      setTrending(mockProducts.filter(p => p.isTrending));
      setRecommended(mockProducts.filter(p => p.isRecommended));
    };

    fetchHomeData();
  }, []);

  // Hero Section Auto-Slide Effect
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev >= banners.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [banners]);

  const nextBanner = () => {
    if (!banners || banners.length === 0) return;
    setCurrentBanner((prev) => (prev >= banners.length - 1 ? 0 : prev + 1));
  };

  const prevBanner = () => {
    if (!banners || banners.length === 0) return;
    setCurrentBanner((prev) => (prev <= 0 ? banners.length - 1 : prev - 1));
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

  const getCategoryIcon = (categoryName: string) => {
    const name = (categoryName || "").toLowerCase();
    if (name.includes("শাড়ি") || name.includes("saree")) return Sparkles;
    if (name.includes("থ্রি-পিস") || name.includes("piece")) return Layers;
    if (name.includes("বাচ্চা") || name.includes("kids") || name.includes("toy")) return Smile;
    if (name.includes("বই") || name.includes("book")) return BookOpen;
    if (name.includes("মেকআপ") || name.includes("makeup") || name.includes("cosmetic")) return Palette;
    if (name.includes("home") || name.includes("decor")) return Crown;
    return ShoppingBag;
  };

  const currentItem = banners && banners.length > 0 ? banners[currentBanner] || banners[0] : null;
  const activeBannerImage = currentItem?.imageUrl || currentItem?.image || "";

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* HTML Head Preload for LCP optimization */}
      {activeBannerImage && (
        <link rel="preload" href={activeBannerImage} as="image" fetchPriority="high" />
      )}

      <Header />

      {/* Hero Banner Carousel (With Auto-Slide) */}
      <section className="relative h-[480px] w-full overflow-hidden bg-slate-900">
        {currentItem && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out flex items-center"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.2)), url(${activeBannerImage})`,
            }}
          >
            <div className="container mx-auto px-6 text-white space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-[#009669] text-white font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Exclusive Collection
              </span>
              <h1 className="text-4xl md:text-6xl font-black max-w-xl leading-tight tracking-tight text-white">
                {currentItem?.title}
              </h1>
              <p className="text-base md:text-lg text-slate-200 max-w-md font-medium">
                {currentItem?.subtitle}
              </p>
              <a
                href={currentItem?.linkUrl || currentItem?.link || "/shop"}
                className="inline-flex items-center justify-center bg-[#009669] hover:bg-[#007f59] text-white font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-lg uppercase tracking-widest text-xs"
              >
                Explore Collection
              </a>
            </div>
          </div>
        )}

        {/* Carousel controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevBanner}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 p-3 rounded-full text-white backdrop-blur-sm cursor-pointer transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 p-3 rounded-full text-white backdrop-blur-sm cursor-pointer transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </section>

      {/* Value Badges */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "100% Authentic", desc: "Sourced direct from official suppliers", icon: ShieldCheck },
            { title: "Swift Delivery", desc: "Carefully boxed within 2-24 hours", icon: Truck },
            { title: "Best Price Guaranteed", desc: "Up to 50% off selected products", icon: Percent },
            { title: "Easy Returns", desc: "Hassle-free return policy", icon: RotateCcw }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="p-3 bg-[#009669]/10 rounded-xl text-[#009669]"><badge.icon className="h-6 w-6" /></div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">{badge.title}</h4>
                <p className="text-xs text-slate-500">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Categories Grid (Exact Replica of User's Reference Screenshot) */}
      <section className="py-12 container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Popular Categories
          </h2>
          <a
            href="/shop"
            className="text-xs sm:text-sm font-extrabold text-purple-700 hover:text-purple-800 transition-colors"
          >
            View All →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4.5">
          {categories.map((cat, idx) => {
            const subCount = cat.childCategories ? cat.childCategories.length : 6;
            const catImage =
              cat.imageUrl ||
              "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop";

            return (
              <a
                key={cat.id || idx}
                href={`/category/${cat.slug || cat.id}`}
                className="bg-white border border-slate-100 rounded-3xl p-3 sm:p-4 flex flex-col items-center text-center group hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-xs"
              >
                {/* Image showcase */}
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 mb-3 group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={catImage}
                    alt={cat.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    loading="lazy"
                  />
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>

                {/* Subcategories count pill */}
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {subCount} subcategories
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Product Display Rows */}
      {[
        { title: "Featured Products", data: featuredProducts || [] },
        { title: "Best Sellers", data: bestSellers || [] },
        { title: "Flash Sale Offers", data: flashSale || [] },
        { title: "New Arrivals", data: newArrivals || [] },
        { title: "Trending Products", data: trending || [] },
        { title: "Recommended For You", data: recommended || [] },
      ].map(
        (row, idx) =>
          row.data && Array.isArray(row.data) && row.data.length > 0 && (
            <section key={idx} className="py-12 border-b border-slate-200/60">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">{row.title}</h3>
                  <a href="/shop" className="text-xs font-bold uppercase tracking-widest text-[#009669] hover:underline">
                    View All
                  </a>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {row.data.map((prod) => (
                    <ProductCard key={prod?.id || Math.random()} product={prod} />
                  ))}
                </div>
              </div>
            </section>
          )
      )}

      {/* Customer Testimonials */}
      <section className="py-16 bg-white border-b border-slate-200/60">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">What Our Customers Say</h3>
            <p className="text-xs text-slate-500 mt-1">Real experiences shared by our verified shoppers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(mockTestimonials || []).map((t, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-sm">
                <div className="flex gap-0.5 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
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

      <Footer />
    </div>
  );
}
