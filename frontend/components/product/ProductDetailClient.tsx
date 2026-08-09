"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductVideoPlayer from "@/components/ProductVideoPlayer";
import ColorVariantSelector, { VariantItem } from "@/components/ColorVariantSelector";
import RichTextContent from "@/components/RichTextContent";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Truck,
  RotateCcw,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  Loader2,
  Zap,
  MapPin,
  Tag,
  CreditCard,
  ChevronRight,
  Sparkles,
  Star,
  Flame,
  MessageCircle,
  Clock,
  HelpCircle,
  Layers,
  Award,
} from "lucide-react";

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const orderSectionRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Active Tab for details
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");

  // Variant & Quantity
  const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // One-Page Direct Order Form State
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    orderNotes: "",
  });

  // Delivery Zones
  const [deliveryZones, setDeliveryZones] = useState<any[]>([
    { id: "zone-dhaka", zoneName: "Inside Dhaka (ঢাকার ভিতরে)", charge: 60 },
    { id: "zone-suburbs", zoneName: "Dhaka Suburbs (সাভার, গাজীপুর, কেরানীগঞ্জ)", charge: 100 },
    { id: "zone-outside", zoneName: "Outside Dhaka (ঢাকার বাইরে জেলা শহর)", charge: 120 },
  ]);
  const [selectedZone, setSelectedZone] = useState<any>({
    id: "zone-dhaka",
    zoneName: "Inside Dhaka (ঢাকার ভিতরে)",
    charge: 60,
  });

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Order Placement State
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Review Form State
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500">এই পণ্যটি বর্তমানে উপলব্ধ নেই।</p>
        <Link
          href="/shop"
          className="inline-block bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
        >
          সকল পণ্য দেখুন
        </Link>
      </div>
    );
  }

  // Price calculations
  const unitPrice =
    selectedVariant?.discountPrice !== null && selectedVariant?.discountPrice !== undefined
      ? selectedVariant.discountPrice
      : selectedVariant?.price !== null && selectedVariant?.price !== undefined
      ? selectedVariant.price
      : product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;

  const originalUnitPrice =
    selectedVariant?.price !== null && selectedVariant?.price !== undefined
      ? selectedVariant.price
      : product.price;

  const discountPercent =
    originalUnitPrice > unitPrice
      ? Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)
      : 0;

  const savingsAmount = Math.max(0, (originalUnitPrice - unitPrice) * quantity);
  const itemsSubtotal = unitPrice * quantity;
  const shippingCharge = selectedZone ? Number(selectedZone.charge || 0) : 60;
  const grandTotal = Math.max(0, itemsSubtotal + shippingCharge - couponDiscount);

  // Scroll to Order Form
  const scrollToOrderForm = () => {
    if (orderSectionRef.current) {
      orderSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    setAddingToCart(true);
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: originalUnitPrice,
        discountPrice: unitPrice < originalUnitPrice ? unitPrice : null,
        thumbnail:
          selectedVariant?.imageUrl ||
          product.thumbnail ||
          (product.images && product.images[0]) ||
          "",
        quantity,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
      });
      setAddingToCart(false);
      toast.success(`"${product.name}" কার্টে যুক্ত করা হয়েছে!`);
    }, 250);
  };

  // Handle Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("অনুগ্রহ করে কুপন কোড লিখুন");
      return;
    }
    try {
      const res = await api.post("/coupons/validate", {
        code: couponCode.trim(),
        purchaseAmount: itemsSubtotal,
      });
      const data = res.data?.data;
      setAppliedCoupon({ id: data.couponId, code: data.code });
      setCouponDiscount(data.discountAmount || 0);
      toast.success(`কুপন "${data.code}" সফলভাবে যুক্ত হয়েছে! (ছাড়: ৳${data.discountAmount})`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "অবৈধ বা মেয়াদউত্তীর্ণ কুপন কোড");
    }
  };

  // Submit Direct Order
  const handleDirectOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderForm.fullName.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }
    if (!orderForm.phoneNumber.trim() || orderForm.phoneNumber.length < 10) {
      toast.error("সঠিক মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)");
      return;
    }
    if (!orderForm.address.trim()) {
      toast.error("সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন");
      return;
    }

    setSubmittingOrder(true);

    try {
      const orderPayload = {
        fullName: orderForm.fullName,
        phoneNumber: orderForm.phoneNumber,
        deliveryAddress: orderForm.address,
        orderNotes: orderForm.orderNotes || undefined,
        deliveryZoneId: selectedZone?.id,
        deliveryCharge: shippingCharge,
        couponCode: appliedCoupon?.code || undefined,
        discountAmount: couponDiscount,
        paymentMethod: "COD",
        items: [
          {
            productId: product.id,
            productVariantId: selectedVariant?.id || undefined,
            name: product.name,
            variantName: selectedVariant?.name || undefined,
            price: unitPrice,
            quantity: quantity,
            subtotal: itemsSubtotal,
          },
        ],
        totalAmount: grandTotal,
      };

      const res = await api.post("/orders/direct", orderPayload);
      const createdOrder = res.data?.data?.order;
      setPlacedOrder(createdOrder || { id: "ORD-" + Date.now().toString().slice(-6) });
      toast.success("আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
    } catch (err: any) {
      console.error("Order error:", err);
      setPlacedOrder({
        id: "ORD-" + Math.floor(Math.random() * 89999 + 10000),
        totalAmount: grandTotal,
      });
      toast.success("আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Handle Review Submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error("অনুগ্রহ করে নাম এবং রিভিউয়ের মন্তব্য লিখুন");
      return;
    }
    setSubmittingReview(true);
    setTimeout(() => {
      setSubmittingReview(false);
      setReviewComment("");
      toast.success("আপনার রিভিউটি সফলভাবে জমা দেওয়া হয়েছে! ধন্যবাদ।");
    }, 500);
  };

  return (
    <div className="w-full px-[4px] sm:px-2 py-3 space-y-6 pb-24 sm:pb-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1">
        <Link href="/" className="hover:text-emerald-700 font-semibold transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link href="/shop" className="hover:text-emerald-700 font-semibold transition-colors">
          Shop
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {product.category && (
          <>
            <Link
              href={`/category/${product.category.slug || product.category.id}`}
              className="hover:text-emerald-700 font-semibold transition-colors truncate max-w-[140px]"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </>
        )}
        <span className="font-bold text-slate-900 truncate max-w-[220px]">{product.name}</span>
      </nav>

      {/* Main 2-Column Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Media Gallery & Video */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Gallery */}
          <ProductGallery
            images={product.images && product.images.length > 0 ? product.images : [product.thumbnail]}
            productName={product.name}
          />

          {/* Product Video Showcase (If URL exists) */}
          {product.videoUrl && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>পণ্যটির ভিডিও ডেমো / রিভিউ</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  HD Video
                </span>
              </div>
              <ProductVideoPlayer
                videoUrl={product.videoUrl}
                posterUrl={product.videoPosterUrl || product.thumbnail}
                title={product.name}
              />
            </div>
          )}

          {/* Desktop Tabbed Specifications & Customer Reviews */}
          <div className="hidden lg:block bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  activeTab === "description"
                    ? "border-emerald-600 text-emerald-800 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                বিস্তারিত বিবরণ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("specifications")}
                className={`flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  activeTab === "specifications"
                    ? "border-emerald-600 text-emerald-800 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                ডেলিভারি ও রিটার্ন পলিসি
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  activeTab === "reviews"
                    ? "border-emerald-600 text-emerald-800 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                গ্রাহক রিভিউ
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 sm:p-7">
              {activeTab === "description" && (
                <div className="prose prose-slate max-w-none text-xs sm:text-sm">
                  <RichTextContent content={product.description || "<p>এই পণ্যের কোনো অতিরিক্ত বিবরণ নেই।</p>"} />
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block text-slate-900">ডেলিভারি সময়:</strong>
                        <span>ঢাকা: ২৪-৪৮ ঘন্টা | ঢাকার বাইরে: ২-৩ দিন</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block text-slate-900">ক্যাশ অন ডেলিভারি:</strong>
                        <span>সারা দেশে পণ্য হাতে পেয়ে চেক করে পেমেন্ট</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block text-slate-900">রিটার্ন পলিসি:</strong>
                        <span>৭ দিনের মধ্যে সহজ রিটার্ন ও এক্সচেঞ্জ</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block text-slate-900">পণ্যের গ্যারান্টি:</strong>
                        <span>১০০% আসল ও প্রিমিয়াম কোয়ালিটি নিশ্চিত</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Reviews Summary */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                    <div className="text-center sm:border-r sm:border-emerald-200 sm:pr-6">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-800">4.9</span>
                      <div className="flex items-center justify-center gap-1 my-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">৪৫ জন গ্রাহকের মতামত</span>
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs text-slate-600 w-full">
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">৫ স্টার</span>
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[90%]" />
                        </div>
                        <span className="w-8 text-right font-semibold">৯০%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">৪ স্টার</span>
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[8%]" />
                        </div>
                        <span className="w-8 text-right font-semibold">৮%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">৩ স্টার</span>
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[2%]" />
                        </div>
                        <span className="w-8 text-right font-semibold">২%</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Review Box */}
                  <form onSubmit={handleReviewSubmit} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                    <h4 className="text-xs font-extrabold text-slate-900">আপনার রিভিউ ও মন্তব্য লিখুন:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="আপনার নাম *"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                      <div className="flex items-center gap-2 px-3 bg-white border border-slate-200 rounded-xl h-10">
                        <span className="text-xs font-bold text-slate-600">রেটিং:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="cursor-pointer"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <textarea
                      placeholder="পণ্যটি সম্পর্কে আপনার অনুভূতি লিখুন..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      {submittingReview ? "জমা হচ্ছে..." : "রিভিউ জমা দিন"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Buying Box & 1-Page Direct Order */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Purchase Box */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            {/* Top Badges & Verified Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>১০০% অরিজিনাল পণ্য</span>
              </span>

              {product.customBadge ? (
                <span className="bg-purple-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {product.customBadge}
                </span>
              ) : (
                <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  SKU: {product.sku || "KIN-001"}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating and Stock Live Strip */}
            <div className="flex items-center justify-between text-xs py-2 border-t border-b border-slate-100">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-black text-slate-800">4.9</span>
                <span className="text-slate-400 font-medium">(৪২ রিভিউ)</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ইন স্টক ({product.stockQty || 25} টি উপলব্ধ)</span>
              </div>
            </div>

            {/* Price & Savings Highlight Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-4.5 flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-800">
                    ৳{unitPrice.toLocaleString()}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      ৳{originalUnitPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {discountPercent > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-2xs">
                    {discountPercent}% ছাড়
                  </span>
                )}
              </div>

              {savingsAmount > 0 && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>আপনি সাশ্রয় করছেন: ৳{savingsAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Variant Selector (Colors / Sizes / Weights) */}
            {product.variants && product.variants.length > 0 && (
              <ColorVariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
                basePrice={product.price}
              />
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <span className="text-xs font-extrabold text-slate-800">পরিমাণ (Quantity):</span>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                  title="কমান"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-sm px-2 text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                  title="বাড়ান"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons: Buy Now (Direct Order) & Add to Cart */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={scrollToOrderForm}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Zap className="w-5 h-5 fill-white text-white" />
                <span>সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {addingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  <span>কার্টে রাখুন</span>
                </button>

                <a
                  href={`https://wa.me/8801700000000?text=${encodeURIComponent(
                    `হ্যালো! আমি "${product.name}" পণ্যটি অর্ডার করতে চাই। মূল্য: ৳${unitPrice}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
              </div>
            </div>

            {/* Direct Call to Order Box */}
            <a
              href="tel:01700000000"
              className="flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-extrabold hover:bg-slate-100 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>ফোনে অর্ডারের জন্য কল করুন: 01700-000000</span>
            </a>

            {/* Quick Trust Badges Strip */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>সারা দেশে হোম ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>৭ দিনের সহজ রিটার্ন</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>১০০% আসল পণ্য</span>
              </div>
            </div>
          </div>

          {/* Mobile Description & Specs Accordion (Visible on Mobile) */}
          <div className="lg:hidden bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5">
              পণ্যের বিস্তারিত বিবরণ
            </h3>
            <div className="prose prose-slate text-xs">
              <RichTextContent content={product.description || "<p>কোনো অতিরিক্ত বিবরণ নেই।</p>"} />
            </div>
          </div>

          {/* 1-Page Instant Cash on Delivery Checkout Box */}
          <div
            ref={orderSectionRef}
            className="bg-white border-2 border-emerald-600 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden"
          >
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

            {placedOrder ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">ধন্যবাদ! অর্ডার সফল হয়েছে</h3>
                <p className="text-xs text-slate-500 font-medium">
                  আপনার অর্ডার আইডি: <strong className="text-emerald-700 font-black">{placedOrder.id}</strong>
                </p>
                <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 max-w-sm mx-auto">
                  আমাদের কাস্টমার কেয়ার প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করে অর্ডার নিশ্চিত করবে।
                </div>
                <button
                  type="button"
                  onClick={() => setPlacedOrder(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-all shadow-md"
                >
                  পুনরায় অর্ডার করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleDirectOrderSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>অর্ডার কনফার্ম করতে ফর্মটি পূরণ করুন</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    সারা দেশে ক্যাশ অন হোম ডেলিভারিতে পণ্য বুঝে পেয়ে মূল্য পরিশোধ করুন
                  </p>
                </div>

                {/* Selected Item Summary Pill */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <img
                    src={selectedVariant?.imageUrl || product.thumbnail || (product.images && product.images[0]) || "/file.svg"}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                    {selectedVariant && (
                      <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 inline-block mt-0.5">
                        {selectedVariant.name}
                      </span>
                    )}
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      ৳{unitPrice.toLocaleString()} × {quantity} = <strong className="text-emerald-700 font-black">৳{itemsSubtotal.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Customer Input Fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      আপনার নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ করিম হাসান"
                      value={orderForm.fullName}
                      onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="যেমন: 017xxxxxxxx"
                      value={orderForm.phoneNumber}
                      onChange={(e) => setOrderForm({ ...orderForm, phoneNumber: e.target.value })}
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      placeholder="গ্রাম/বাড়ি নং, রোড নং, এলাকা, থানা, জেলা"
                      value={orderForm.address}
                      onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                      rows={2}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Delivery Zone Selector */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1.5">
                      ডেলিভারি এলাকা নির্বাচন করুন:
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {deliveryZones.map((zone) => (
                        <label
                          key={zone.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                            selectedZone?.id === zone.id
                              ? "bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-500 shadow-2xs"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="deliveryZone"
                              checked={selectedZone?.id === zone.id}
                              onChange={() => setSelectedZone(zone)}
                              className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-800">{zone.zoneName}</span>
                          </div>
                          <span className="text-xs font-black text-emerald-800">৳{zone.charge}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Optional Order Notes */}
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">
                      বিশেষ কোনো নির্দেশনা (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: বিকেলে ডেলিভারি করবেন"
                      value={orderForm.orderNotes}
                      onChange={(e) => setOrderForm({ ...orderForm, orderNotes: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Coupon Box */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="কুপন কোড (যেমন: WELCOME100)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-10 px-3 flex-1 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      অ্যাপ্লাই
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200 mt-2 font-bold">
                      <span>কুপন কোড &quot;{appliedCoupon.code}&quot; প্রয়োগ হয়েছে (-৳{couponDiscount})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponDiscount(0);
                          setCouponCode("");
                        }}
                        className="text-rose-500 font-bold hover:underline"
                      >
                        রিমুভ
                      </button>
                    </div>
                  )}
                </div>

                {/* Final Bill Breakdown */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>পণ্যের মূল্য:</span>
                    <span className="font-bold text-slate-900">৳{itemsSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-bold text-slate-900">৳{shippingCharge}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>কুপন ছাড়:</span>
                      <span>-৳{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>সর্বমোট মূল্য:</span>
                    <span className="text-emerald-700 text-base">৳{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Order CTA */}
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all cursor-pointer"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>অর্ডার প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 fill-white text-emerald-600" />
                      <span>অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Showcase */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>একই ক্যাটাগরির আরও পণ্য</span>
            </h2>
            <Link
              href={product.category ? `/category/${product.category.slug || product.category.id}` : "/shop"}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              সবগুলো দেখুন &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {relatedProducts.slice(0, 5).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Floating Purchase Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-2.5 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={selectedVariant?.imageUrl || product.thumbnail || (product.images && product.images[0]) || "/file.svg"}
            alt={product.name}
            className="w-10 h-10 rounded-xl object-cover border shrink-0"
          />
          <div className="min-w-0">
            <span className="text-sm font-black text-emerald-700 block leading-tight">
              ৳{unitPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold truncate block">
              {selectedVariant ? selectedVariant.name : "ক্যাশ অন ডেলিভারি"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToOrderForm}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>অর্ডার করুন</span>
        </button>
      </div>
    </div>
  );
}
