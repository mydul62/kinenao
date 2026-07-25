"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import RichTextContent from "@/components/RichTextContent";
import ProductCard from "@/components/ProductCard";
import StickyBottomBar from "@/components/StickyBottomBar";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Truck,
  RotateCcw,
  PackageCheck,
  ShoppingBag,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  PhoneCall,
  Loader2,
  FileText,
  HelpCircle,
} from "lucide-react";
import { mockProducts } from "@/lib/mockData";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.id as string;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive quantity state
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [orderingNow, setOrderingNow] = useState(false);

  // Accordion open/close toggles
  const [descOpen, setDescOpen] = useState(true);
  const [faqOpen, setFaqOpen] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const prodRes = await api.get(`/products/slug/${slug}`);
        const found = prodRes.data.data.product;

        if (found) {
          setProduct(found);

          const relRes = await api.get(`/products?limit=10`);
          const items = (relRes.data.data.products || []).filter((p: any) => p.id !== found.id);
          setRelatedProducts(items.length > 0 ? items : mockProducts.filter((p) => p.id !== found.id));
        }
      } catch (err) {
        console.error("Error fetching product details from API, using fallback:", err);
        const fallback = mockProducts.find((p) => p.slug === slug || p.id === slug);
        if (fallback) {
          setProduct(fallback);
          setRelatedProducts(mockProducts.filter((p) => p.id !== fallback.id));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#009669]" />
          <p className="text-xs text-slate-500 font-semibold">পণ্য লোড হচ্ছে...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafafa]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-24 text-center space-y-4">
          <h2 className="text-2xl font-black text-slate-900 uppercase">Product Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The requested product "{slug}" could not be found.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#009669] text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#007f59]"
          >
            Browse Storefront
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.thumbnail || "/file.svg"];
  const currentPrice = product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : product.price;
  const originalPrice = product.price;
  const discountPercent = product.discountPrice !== null && product.discountPrice !== undefined && product.price > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    setAdding(true);
    setTimeout(() => {
      addToCart(product, quantity);
      setAdding(false);
      toast.success(`"${product.name}" added to cart!`);
    }, 300);
  };

  const handleOrderNow = () => {
    setOrderingNow(true);
    setTimeout(() => {
      addToCart(product, quantity);
      setOrderingNow(false);
      router.push("/checkout");
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#009669] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
          </Link>
        </div>

        {/* Primary Product Showcase Container (Recreating Demo Screenshots) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start bg-white p-4 md:p-8 rounded-[28px] border border-slate-200/80 shadow-sm">
          {/* Left Column: Image Gallery Slider */}
          <ProductGallery images={imagesList} name={product.name} />

          {/* Right Column: Details & Purchase Options */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-black text-[#1c3d5a] tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price & Discount Pill Row */}
            <div className="flex items-center gap-3">
              <span className="text-2xl md:text-3xl font-black text-[#d97706] sm:text-[#c49a16]">
                {currentPrice}Tk
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-rose-500 line-through text-sm sm:text-base font-normal">
                    {originalPrice}Tk
                  </span>
                  <span className="bg-[#009669] text-white text-xs font-extrabold px-3 py-1.5 rounded-2xl shadow-sm uppercase tracking-wide">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Quantity Selector & Action Buttons Row */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Counter Pill */}
                <div className="flex items-center border border-amber-300 rounded-xl bg-white h-11 px-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* ADD TO CART Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 bg-[#1c3d5a] hover:bg-[#11273c] text-white font-extrabold text-xs sm:text-sm h-11 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer uppercase tracking-wider disabled:opacity-70"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 stroke-[2.5]" /> ADD TO CART
                    </>
                  )}
                </button>
              </div>

              {/* Order Now Button (Full Width Green) */}
              <button
                type="button"
                onClick={handleOrderNow}
                disabled={orderingNow}
                className="w-full bg-[#009669] hover:bg-[#007f59] text-white font-black text-sm md:text-base h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#009669]/20 cursor-pointer uppercase tracking-wider"
              >
                {orderingNow ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 stroke-[2.5]" /> Order Now
                  </>
                )}
              </button>
            </div>

            {/* 3 Trust Badges Box (Exact Replica of Demo Screenshot #1) */}
            <div className="border-2 border-slate-900 rounded-2xl p-3 grid grid-cols-3 gap-2 bg-white">
              {/* Badge 1: Cash on Delivery */}
              <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-2 p-2 rounded-xl border border-slate-200 bg-white">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold text-[#1c3d5a] leading-tight">
                  Cash on Delivery
                </span>
              </div>

              {/* Badge 2: Fast Delivery */}
              <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-2 p-2 rounded-xl border border-slate-200 bg-white">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold text-[#1c3d5a] leading-tight">
                  Fast Delivery
                </span>
              </div>

              {/* Badge 3: Easy Return */}
              <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-2 p-2 rounded-xl border border-slate-200 bg-white">
                <div className="w-8 h-8 rounded-full bg-[#1c3d5a] text-white flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold text-[#1c3d5a] leading-tight">
                  Easy Return
                </span>
              </div>
            </div>

            {/* Collapsible Accordion: Description (Exact Replica of Demo Screenshot #2) */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setDescOpen(!descOpen)}
                className="w-full flex items-center justify-between font-extrabold text-sm text-[#1c3d5a] text-left cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#1c3d5a]" /> Description
                </span>
                {descOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>

              {descOpen && (
                <div className="pt-2 text-xs text-slate-700 leading-relaxed transition-all">
                  <RichTextContent content={product.description} />
                </div>
              )}
            </div>

            {/* Collapsible Accordion: Ask a Question (Exact Replica of Demo Screenshot #3) */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setFaqOpen(!faqOpen)}
                className="w-full flex items-center justify-between font-extrabold text-sm text-[#1c3d5a] text-left cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-[#1c3d5a]" /> ASK A QUESTION
                </span>
                {faqOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>

              {faqOpen && (
                <div className="pt-2 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p>
                    🔥 দাম বেশি লাগছে বা কোনো সমস্যা? সমাধান পেতে এখানে ক্লিক করুন 👉{" "}
                    <a
                      href="https://ticket-htbazar.karbar.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 underline font-bold"
                    >
                      https://ticket-htbazar.karbar.app/
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* WhatsApp & Call Direct Order Box (Exact Replica of Demo Screenshot #3) */}
            <div className="p-4 rounded-2xl bg-[#e6f4ea] border border-emerald-200/80 space-y-2">
              <h4 className="font-extrabold text-xs text-[#d97706] sm:text-[#c49a16] leading-snug">
                আমাদের যে কোন পণ্য অর্ডার করতে কল বা WhatsApp করুন:
              </h4>
              <div className="space-y-1 text-xs font-bold text-slate-800">
                <p className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp: 01407-016799</span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-rose-500" />
                  <span>Phone: 09617-100900</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended For You Section (Exact Replica of Demo Screenshot #4) */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-6">
            <h2 className="text-2xl md:text-3xl font-black text-[#1c3d5a] tracking-tight">
              Recommended For You
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Sticky Purchase Bar on Scroll */}
      <StickyBottomBar product={product} />

      <Footer />
    </div>
  );
}
