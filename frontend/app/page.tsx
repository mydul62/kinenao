"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch categories
        const catRes = await api.get("/categories?type=tree");
        setCategories(catRes.data.data.categories?.length > 0 ? catRes.data.data.categories : mockCategories);
      } catch (err) {
        console.error("Categories fetch error, using mock:", err);
        setCategories(mockCategories);
      }

      try {
        // 2. Fetch products and distribute
        const prodRes = await api.get("/products?limit=50");
        const allProds = prodRes.data.data.products || [];
        
        if (allProds.length > 0) {
          setFeaturedProducts(allProds.filter((p: any) => p.isFeatured).slice(0, 8));
          setBestSellers(allProds.filter((p: any) => p.isBestSeller).slice(0, 8));
          setFlashSale(allProds.filter((p: any) => p.isFlashSale).slice(0, 8));
          setNewArrivals(allProds.filter((p: any) => p.isNewArrival || p.tags?.includes("new")).slice(0, 8));
          setTrending(allProds.filter((p: any) => p.isTrending || p.tags?.includes("trending")).slice(0, 8));
          setRecommended(allProds.filter((p: any) => p.isRecommended || p.tags?.includes("recommended")).slice(0, 8));
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
        setBrands(brandRes.data.data.brands?.length > 0 ? brandRes.data.data.brands : mockBrands);
      } catch (err) {
        console.error("Brands error, using mock:", err);
        setBrands(mockBrands);
      }

      try {
        // 4. Fetch banners
        const bannerRes = await api.get("/settings/hero_banners");
        setBanners(bannerRes.data.data.value?.length > 0 ? bannerRes.data.data.value : mockBanners);
      } catch {
        setBanners(mockBanners);
      }

      try {
        // 5. Fetch FAQs
        const faqRes = await api.get("/settings/faqs");
        setFaqs(faqRes.data.data.value?.length > 0 ? faqRes.data.data.value : mockFaqs);
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

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`"${product.name}" added to cart!`);
  };

  const activeBannerImage = banners[currentBanner]?.imageUrl || banners[currentBanner]?.image;

  return (
    <div className="flex flex-col min-h-screen bg-rose-50/20">
      {/* HTML Head Preload for LCP optimization */}
      {activeBannerImage && (
        <link rel="preload" href={activeBannerImage} as="image" fetchPriority="high" />
      )}

      <Header />

      {/* Hero Banner Carousel */}
      <section className="relative h-[480px] w-full overflow-hidden bg-rose-950">
        {banners.length > 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out flex items-center"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(20, 10, 15, 0.75), rgba(20, 10, 15, 0.2)), url(${activeBannerImage})`,
            }}
          >
            <div className="container mx-auto px-6 text-white space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Exclusive Release
              </span>
              <h1 className="text-4xl md:text-6xl font-black max-w-xl leading-tight tracking-tight text-pink-50">
                {banners[currentBanner]?.title}
              </h1>
              <p className="text-base md:text-lg text-rose-100/90 max-w-md font-medium">
                {banners[currentBanner]?.subtitle}
              </p>
              <a
                href={banners[currentBanner]?.linkUrl || banners[currentBanner]?.link || "/shop"}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-lg hover:bg-primary/95 transition-all shadow-lg hover:shadow-primary/30 uppercase tracking-widest text-xs"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2.5 rounded-full text-white backdrop-blur-sm cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2.5 rounded-full text-white backdrop-blur-sm cursor-pointer transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </section>

      {/* Value Badges */}
      <section className="py-8 bg-white border-y border-rose-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "100% Authentic", desc: "Sourced direct from official brands", icon: ShieldCheck },
            { title: "Swift Delivery", desc: "Carefully boxed within 2-24 hours", icon: Truck },
            { title: "Luxury Discounts", desc: "Up to 25% off premium ranges", icon: Percent },
            { title: "Easy Returns", desc: "Hassle-free 7-day return policy", icon: RotateCcw }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-rose-50/30 border border-rose-100/50 rounded-2xl">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><badge.icon className="h-6 w-6" /></div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">{badge.title}</h4>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Shop by Category</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Curated collections of premium skincare, cosmetics, and signature fragrances.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <motion.a
              whileHover={{ y: -5 }}
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="flex flex-col items-center justify-center p-6 border border-rose-100/60 rounded-2xl bg-white text-center hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="h-14 w-14 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-lg mb-4">
                {cat.name[0]}
              </div>
              <span className="font-bold text-xs tracking-wider uppercase text-slate-800">{cat.name}</span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Product Display Rows */}
      {[
        { title: "Featured Products", data: featuredProducts },
        { title: "Best Sellers", data: bestSellers },
        { title: "Flash Sale Offers", data: flashSale },
        { title: "New Arrivals", data: newArrivals },
        { title: "Trending Products", data: trending },
        { title: "Recommended For You", data: recommended },
      ].map(
        (row, idx) =>
          row.data.length > 0 && (
            <section key={idx} className="py-12 border-b border-rose-100/30">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">{row.title}</h3>
                  <a href="/shop" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                    View All
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {row.data.map((prod) => {
                    const discount =
                      prod.discountPrice !== null
                        ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)
                        : 0;

                    return (
                      <div
                        key={prod.id}
                        className="relative flex flex-col bg-white border border-rose-100/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                      >
                        {/* Discount Badge */}
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 uppercase tracking-wider">
                            {discount}% OFF
                          </span>
                        )}

                        <a href={`/product/${prod.slug}`} className="block relative aspect-square bg-rose-50/10">
                          <img
                            src={prod.thumbnail || "/file.svg"}
                            alt={prod.name}
                            loading="lazy"
                            className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                          />
                        </a>

                        <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary">
                              {prod.category?.name || "Beauty"}
                            </span>
                            <a
                              href={`/product/${prod.slug}`}
                              className="block font-bold text-sm text-slate-800 hover:text-primary transition-colors line-clamp-2 mt-1"
                            >
                              {prod.name}
                            </a>
                            <div className="flex items-center gap-1 mt-2 text-yellow-500 text-xs">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span className="font-semibold text-slate-700">{prod.rating || "4.8"}</span>
                              <span className="text-slate-400 text-[10px]">({prod.reviewsCount || 12} reviews)</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              {prod.discountPrice !== null ? (
                                <div className="space-y-0.5">
                                  <span className="text-slate-900 font-black text-base">৳{prod.discountPrice}</span>
                                  <span className="text-slate-400 line-through text-xs ml-1.5">৳{prod.price}</span>
                                </div>
                              ) : (
                                <span className="text-slate-900 font-black text-base">৳{prod.price}</span>
                              )}
                            </div>

                            <button
                              onClick={() => handleAddToCart(prod)}
                              className="bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground p-2 rounded-xl transition-all cursor-pointer"
                            >
                              <ShoppingBag className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )
      )}

      {/* Promotional Grid Banners */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className="h-64 rounded-3xl overflow-hidden bg-cover bg-center relative flex items-center p-8 border border-rose-100 shadow-sm"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(20, 10, 15, 0.8), rgba(20, 10, 15, 0.3)), url('https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop')`,
            }}
          >
            <div className="text-white space-y-3">
              <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Premium Care</span>
              <h3 className="text-2xl font-black text-rose-50 leading-tight">Advanced Skincare Essentials</h3>
              <p className="text-xs text-rose-100/80">Nourish your skin with top-rated serums and formulas.</p>
              <a href="/shop?category=skincare" className="inline-block bg-white text-slate-900 font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-rose-50 transition-all">Shop Skincare</a>
            </div>
          </div>
          <div
            className="h-64 rounded-3xl overflow-hidden bg-cover bg-center relative flex items-center p-8 border border-rose-100 shadow-sm"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(20, 10, 15, 0.8), rgba(20, 10, 15, 0.3)), url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop')`,
            }}
          >
            <div className="text-white space-y-3">
              <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Special Offers</span>
              <h3 className="text-2xl font-black text-rose-50 leading-tight">Authentic Lips & Eye Makeup</h3>
              <p className="text-xs text-rose-100/80">Universally flattering shades from top global designer brands.</p>
              <a href="/shop?category=makeup" className="inline-block bg-white text-slate-900 font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-rose-50 transition-all">Shop Makeup</a>
            </div>
          </div>
        </div>
      </section>

      {/* Top Brands Grid */}
      {brands.length > 0 && (
        <section className="py-12 bg-white border-y border-rose-100/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Featured Designer Brands</h3>
              <p className="text-xs text-muted-foreground mt-1">We supply authentic cosmetics directly from premium producers.</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {brands.map((brand) => (
                <a
                  key={brand.id}
                  href={`/shop?brand=${brand.id}`}
                  className="bg-rose-50/20 border border-rose-100/50 px-6 py-4 rounded-2xl flex items-center justify-center hover:shadow-md hover:border-primary/20 transition-all h-20 min-w-36 cursor-pointer bg-white"
                >
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="font-extrabold text-xs uppercase tracking-widest text-slate-800">{brand.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Testimonials */}
      <section className="py-16 bg-rose-50/10 border-b border-rose-100/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Loved by Makeup Lovers</h3>
            <p className="text-xs text-muted-foreground mt-1">Real experiences shared by our verified community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTestimonials.map((t, idx) => (
              <div key={idx} className="bg-white border border-rose-100/50 p-6 rounded-2xl space-y-3 shadow-sm">
                <div className="flex gap-0.5 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{t.comment}"</p>
                <div>
                  <h5 className="font-bold text-xs text-slate-800">{t.name}</h5>
                  <span className="text-[10px] text-primary font-bold">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-16 container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Find answers to standard customer questions about shade advice, shipping, and return policies.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id || index} className="border border-rose-100/50 rounded-2xl bg-white overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left font-extrabold text-sm text-slate-800 cursor-pointer hover:bg-rose-50/20 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${activeFaq === index ? "rotate-90 text-primary" : ""}`} />
              </button>
              {activeFaq === index && (
                <div className="p-5 border-t border-rose-100/40 text-xs text-slate-600 leading-relaxed bg-rose-50/5">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
