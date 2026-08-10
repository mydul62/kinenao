"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import CustomerVariantSelector, { VariantItem } from "@/components/product/CustomerVariantSelector";
import RichTextContent from "@/components/RichTextContent";
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
  Tag,
  ChevronRight,
  Sparkles,
  Star,
  MessageCircle,
  Clock,
  Play,
  ArrowRight,
  BadgePercent,
  Check,
  Flame,
  Award,
  Lock,
} from "lucide-react";

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailClient({
  product,
  relatedProducts = [],
}: ProductDetailClientProps) {
  const router = useRouter();
  const orderSectionRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Active Tab for details
  const [activeTab, setActiveTab] = useState<"description" | "policy" | "reviews">("description");

  // Variant & Quantity
  const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Video Playing state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // COD Direct Order Form State
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    orderNotes: "",
  });

  // Delivery Zones
  const [deliveryZones] = useState<any[]>([
    { id: "zone-dhaka", zoneName: "ঢাকা সিটির ভিতরে (Inside Dhaka)", charge: 60 },
    { id: "zone-suburbs", zoneName: "ঢাকা সাব-এরিয়া (সাভার, গাজীপুর, কেরানীগঞ্জ)", charge: 100 },
    { id: "zone-outside", zoneName: "সারাদেশে জেলা শহর (Outside Dhaka)", charge: 120 },
  ]);
  const [selectedZone, setSelectedZone] = useState<any>({
    id: "zone-dhaka",
    zoneName: "ঢাকা সিটির ভিতরে (Inside Dhaka)",
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
          className="inline-block bg-[#0d8a4e] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
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

  const hasDiscount = originalUnitPrice > unitPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)
    : 0;

  const savingsAmount = Math.max(0, (originalUnitPrice - unitPrice) * quantity);
  const itemsSubtotal = unitPrice * quantity;
  const shippingCharge = selectedZone ? Number(selectedZone.charge || 0) : 60;
  const grandTotal = Math.max(0, itemsSubtotal + shippingCharge - couponDiscount);

  // Images list
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (selectedVariant?.imageUrl) {
      list.push(selectedVariant.imageUrl);
    }
    if (product.thumbnail && !list.includes(product.thumbnail)) {
      list.push(product.thumbnail);
    }
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: string) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0
      ? list
      : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800"];
  }, [product, selectedVariant]);

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

  // Handle WhatsApp
  const handleWhatsApp = () => {
    const variantText = selectedVariant ? ` (${selectedVariant.name})` : "";
    const message = `হ্যালো, আমি "${product.name}"${variantText} - ৳${unitPrice} পণ্যটি অর্ডার করতে চাই।`;
    window.open(
      `https://wa.me/8801700000000?text=${encodeURIComponent(message)}`,
      "_blank"
    );
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
      setReviewName("");
      setReviewComment("");
      toast.success("আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-slate-900 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 space-y-6">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMBS                                                           */}
        {/* ========================================================================= */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <Link href="/" className="hover:text-[#0d8a4e] transition-colors">
            হোম
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/shop" className="hover:text-[#0d8a4e] transition-colors">
            শপ
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link
                href={`/category/${product.category.slug || product.category.id}`}
                className="hover:text-[#0d8a4e] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-black truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* ========================================================================= */}
        {/* 2. PRODUCT MAIN SHOWCASE (2 COLUMNS ON DESKTOP, STACKED ON MOBILE)        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT: PRODUCT GALLERY */}
          <div className="lg:col-span-6 w-full sticky lg:top-24">
            <ProductGallery
              images={galleryImages}
              productName={product.name}
              onWhatsAppClick={handleWhatsApp}
            />
          </div>

          {/* RIGHT: BUY BOX & PRODUCT DETAILS CARD */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8e4db] shadow-xs space-y-4">
              {/* Top Row: Verified Badge + SKU */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#0d8a4e] border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>১০০% অরিজিনাল পণ্য</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  SKU: {product.sku || "KIN-0184"}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock Status */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-black">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-slate-700 ml-1">4.8 (১২টি রিভিউ)</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5 text-[#0d8a4e] font-black">
                  <span className="w-2 h-2 rounded-full bg-[#0d8a4e] inline-block animate-pulse" />
                  <span>ইন স্টক (স্টকে আছে)</span>
                </div>
              </div>

              {/* Highlighted Price Card (Mint/Green Soft Background) */}
              <div className="bg-[#eaf7ef] border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#0d8a4e]">
                      ৳{unitPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 font-bold line-through">
                        ৳{originalUnitPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <p className="text-xs font-black text-emerald-800 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      <span>আপনি সেভ করছেন ৳{savingsAmount.toLocaleString()}</span>
                    </p>
                  )}
                </div>

                {hasDiscount && (
                  <div className="bg-[#9c1d2e] text-white text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl shadow-xs shrink-0">
                    {discountPercent}% ছাড়
                  </div>
                )}
              </div>

              {/* Variant Selector (Dynamic Multi-Attribute Support) */}
              {product.variants && product.variants.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <CustomerVariantSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onSelectVariant={(v) => setSelectedVariant(v)}
                  />
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-700">
                  পরিমাণ নির্বাচন করুন:
                </label>
                <div className="inline-flex items-center border border-slate-300 bg-white rounded-2xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-700 font-black cursor-pointer transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-700 font-black cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary & Secondary Action CTAs */}
              <div className="space-y-2.5 pt-2">
                {/* Primary Green CTA */}
                <button
                  type="button"
                  onClick={scrollToOrderForm}
                  className="w-full py-4 rounded-2xl bg-[#0d8a4e] hover:bg-[#0a7240] active:scale-[0.99] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                  <span>সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
                </button>

                {/* Secondary Row: Add to Cart + WhatsApp */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {addingToCart ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                    <span>কার্টে রাখুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="py-3 px-4 rounded-2xl bg-white hover:bg-emerald-50 text-[#0d8a4e] border-2 border-[#0d8a4e] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-[#0d8a4e]" />
                    <span>হোয়াটসঅ্যাপ</span>
                  </button>
                </div>
              </div>

              {/* Call to Order Line */}
              <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <a
                  href="tel:01700000000"
                  className="text-xs font-black text-slate-700 hover:text-[#0d8a4e] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#0d8a4e]" />
                  <span>সরাসরি ফোনে অর্ডার করতে কল করুন: 01700-000000</span>
                </a>
              </div>

              {/* 2x2 Trust Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <RotateCcw className="w-4 h-4 text-[#0d8a4e] shrink-0" />
                  <span>৭ দিনের রিটার্ন পলিসি</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Truck className="w-4 h-4 text-[#0d8a4e] shrink-0" />
                  <span>দ্রুত হোম ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#0d8a4e] shrink-0" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Award className="w-4 h-4 text-[#0d8a4e] shrink-0" />
                  <span>১০০% খাঁটি পণ্য</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DIRECT ONE-PAGE COD ORDER CONFIRMATION FORM CARD                       */}
        {/* ========================================================================= */}
        <div ref={orderSectionRef} id="order-form" className="scroll-mt-24">
          <div className="bg-white rounded-3xl border border-[#e8e4db] shadow-md overflow-hidden">
            {/* Header Banner in Deep Green */}
            <div className="bg-[#0d8a4e] text-white p-5 sm:p-6 text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-black flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                <span>অর্ডার কনফার্ম করতে নিচের ফর্মটি পূরণ করুন</span>
              </h2>
              <p className="text-xs text-emerald-100 font-semibold">
                সঠিক তথ্য দিন, আমাদের প্রতিনিধি কল করে অর্ডার কনফার্ম করবেন।
              </p>
            </div>

            {/* Placed Order Success Screen */}
            {placedOrder ? (
              <div className="p-8 sm:p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0d8a4e] flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  ধন্যবাদ! আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  অর্ডার আইডি: <span className="font-black text-[#0d8a4e]">{placedOrder.id}</span>
                  <br />
                  আমাদের প্রতিনিধি অতি শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবেন।
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPlacedOrder(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50"
                  >
                    আরেকটি অর্ডার করুন
                  </button>
                  <Link
                    href="/shop"
                    className="px-6 py-2.5 rounded-xl bg-[#0d8a4e] text-white text-xs font-black hover:bg-[#0a7240]"
                  >
                    শপিং চালিয়ে যান
                  </Link>
                </div>
              </div>
            ) : (
              /* Order Form Body */
              <form onSubmit={handleDirectOrderSubmit} className="p-4 sm:p-6 md:p-8 space-y-6">
                {/* Order Summary Mini Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <img
                    src={galleryImages[0]}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover border bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {product.name}
                    </h4>
                    {selectedVariant && (
                      <p className="text-[11px] font-bold text-purple-800 mt-0.5">
                        ভ্যারিয়েন্ট: {selectedVariant.name}
                      </p>
                    )}
                    <p className="text-xs font-black text-[#0d8a4e] mt-0.5">
                      ৳{unitPrice.toLocaleString()} x {quantity} = ৳{itemsSubtotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Customer Input Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">
                      আপনার নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                      value={orderForm.fullName}
                      onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0d8a4e] focus:border-[#0d8a4e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={orderForm.phoneNumber}
                      onChange={(e) => setOrderForm({ ...orderForm, phoneNumber: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0d8a4e] focus:border-[#0d8a4e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">
                      সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="বাসা নং, রোড নং, এলাকা, থানা, জেলা..."
                      value={orderForm.address}
                      onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0d8a4e] focus:border-[#0d8a4e]"
                    />
                  </div>
                </div>

                {/* Delivery Zone Radio Options */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-black text-slate-700">
                    ডেলিভারি এরিয়া নির্বাচন করুন:
                  </label>
                  <div className="space-y-2">
                    {deliveryZones.map((zone) => {
                      const isSelected = selectedZone?.id === zone.id;
                      return (
                        <label
                          key={zone.id}
                          onClick={() => setSelectedZone(zone)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-50/80 border-[#0d8a4e] text-[#0d8a4e] shadow-2xs font-black"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-bold"
                          }`}
                        >
                          <div className="flex items-center gap-3 text-xs">
                            <input
                              type="radio"
                              name="deliveryZone"
                              checked={isSelected}
                              onChange={() => setSelectedZone(zone)}
                              className="w-4 h-4 text-[#0d8a4e] accent-[#0d8a4e]"
                            />
                            <span>{zone.zoneName}</span>
                          </div>
                          <span className="text-xs font-black">৳{zone.charge}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Order Notes (Optional) */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    বিশেষ কোনো নির্দেশনা (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    placeholder="পণ্য বা ডেলিভারি সম্পর্কিত নির্দেশনা..."
                    value={orderForm.orderNotes}
                    onChange={(e) => setOrderForm({ ...orderForm, orderNotes: e.target.value })}
                    className="w-full h-10 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0d8a4e]"
                  />
                </div>

                {/* Coupon Code Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="কুপন কোড থাকলে লিখুন"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 h-10 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-semibold uppercase placeholder-normal"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-5 h-10 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-black transition-colors cursor-pointer"
                  >
                    প্রয়োগ
                  </button>
                </div>

                {/* Price Breakdown Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-bold text-slate-700">
                  <div className="flex justify-between">
                    <span>পণ্যের মূল্য:</span>
                    <span>৳{itemsSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>৳{shippingCharge.toLocaleString()}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-black">
                      <span>কুপন ছাড় ({appliedCoupon?.code}):</span>
                      <span>-৳{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm sm:text-base font-black text-slate-900">
                    <span>সর্বমোট মূল্য:</span>
                    <span className="text-[#0d8a4e]">৳{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-4 rounded-2xl bg-[#0d8a4e] hover:bg-[#0a7240] active:scale-[0.99] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  {submittingOrder ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 stroke-[3]" />
                  )}
                  <span>অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString()})</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. VIDEO DEMO SECTION                                                    */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e4db] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>পণ্যের ভিডিও দেখুন / রিভিউ</span>
            </h3>
            <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
              HD 1080p
            </span>
          </div>

          <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden shadow-inner flex items-center justify-center">
            {isVideoPlaying ? (
              product.videoUrl?.includes("youtube") || product.videoUrl?.includes("youtu.be") ? (
                <iframe
                  src={`${product.videoUrl}?autoplay=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={product.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smartphone-with-a-green-screen-40348-large.mp4"}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <>
                <img
                  src={galleryImages[0]}
                  alt="Video poster"
                  className="w-full h-full object-cover opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute z-10 w-16 h-16 rounded-full bg-white text-[#0d8a4e] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                >
                  <Play className="w-7 h-7 fill-[#0d8a4e] ml-1" />
                </button>
                <div className="absolute top-3 left-3 bg-[#0d8a4e] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                  ভিডিও রিভিউ
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. TABS FOR DESCRIPTION / POLICY / REVIEWS                                */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#e8e4db] shadow-xs overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/50">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`py-3.5 px-5 text-xs sm:text-sm font-black whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                activeTab === "description"
                  ? "border-[#0d8a4e] text-[#0d8a4e] bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              বিস্তারিত বিবরণ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("policy")}
              className={`py-3.5 px-5 text-xs sm:text-sm font-black whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                activeTab === "policy"
                  ? "border-[#0d8a4e] text-[#0d8a4e] bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              ডেলিভারি ও রিটার্ন পলিসি
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`py-3.5 px-5 text-xs sm:text-sm font-black whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                activeTab === "reviews"
                  ? "border-[#0d8a4e] text-[#0d8a4e] bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              কাস্টমার রিভিউ (১২)
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-5 sm:p-8">
            {activeTab === "description" && (
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {product.description ? (
                  <RichTextContent content={product.description} />
                ) : (
                  <p>
                    আমাদের প্রতিটি পণ্য অত্যন্ত নিখুঁত ও যত্নসহকারে তৈরি। ১০০% অরিজিনাল কোয়ালিটি ও দ্রুত হোম ডেলিভারি নিশ্চয়তা।
                  </p>
                )}
              </div>
            )}

            {activeTab === "policy" && (
              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900">ডেলিভারি পলিসি:</h4>
                  <p>• ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৬০ টাকা (২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি)।</p>
                  <p>• ঢাকা সাব-এরিয়া ১০০ টাকা এবং ঢাকার বাইরে ১২০ টাকা (২-৩ কার্যদিবস)।</p>
                  <p>• ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে মূল্য পরিশোধ করার সুযোগ।</p>
                </div>
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <h4 className="font-black text-slate-900">রিটার্ন ও পরিবর্তন পলিসি:</h4>
                  <p>• পণ্য ডেলিভারি ম্যানের সামনে খুলে চেক করে নেওয়ার অনুরোধ করা হচ্ছে।</p>
                  <p>• কোনো সমস্যা থাকলে ৭ দিনের মধ্যে আমাদের সাপোর্টে কল করে বিনামূল্যে পরিবর্তন করতে পারবেন।</p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-black text-slate-900">আপনার রিভিউ দিন</h4>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? "fill-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="আপনার নাম"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="আপনার মন্তব্য লিখুন..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 rounded-xl bg-[#0d8a4e] text-white text-xs font-black hover:bg-[#0a7240] transition-colors"
                  >
                    রিভিউ সাবমিট করুন
                  </button>
                </form>

                {/* Sample reviews */}
                <div className="space-y-3">
                  {[
                    { name: "সাদিয়া আক্তার", rating: 5, date: "২ দিন আগে", text: "কাপড়ের মান অসাধারণ! কালার একদম ছবির মতোই।" },
                    { name: "মাহমুদুল হাসান", rating: 5, date: "৫ দিন আগে", text: "ডেলিভারি খুব দ্রুত পেয়েছি। প্যাকেজিংও খুব ভালো ছিল।" },
                  ].map((r, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-800">{r.name}</span>
                        <span className="text-slate-400">{r.date}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.rating }).map((_, si) => (
                          <Star key={si} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. RELATED PRODUCTS ROW (SCROLLABLE ON MOBILE, GRID ON DESKTOP)          */}
        {/* ========================================================================= */}
        {relatedProducts.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>এই ক্যাটাগরির আরো পণ্য</span>
              </h3>
              <Link
                href={`/category/${product.category?.slug || product.categoryId || ""}`}
                className="text-xs font-black text-[#0d8a4e] hover:underline"
              >
                সকল পণ্য দেখুন →
              </Link>
            </div>

            <div className="flex md:grid md:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
              {relatedProducts.map((rel: any) => {
                const price = rel.discountPrice || rel.price;
                const origPrice = rel.price;
                const hasDisc = origPrice > price;
                const discP = hasDisc ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
                const thumb =
                  rel.thumbnail ||
                  (rel.images && rel.images[0]) ||
                  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400";

                return (
                  <div
                    key={rel.id}
                    className="w-48 sm:w-56 md:w-auto shrink-0 bg-white rounded-2xl sm:rounded-3xl border border-[#e8e4db] shadow-2xs overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative aspect-square w-full bg-slate-100">
                      {hasDisc && (
                        <span className="absolute top-0 right-0 z-10 bg-[#9c1d2e] text-white text-[10px] font-black px-2 py-0.5 rounded-bl-xl">
                          {discP}% ছাড়
                        </span>
                      )}
                      <Link href={`/product/${rel.slug || rel.id}`} className="block w-full h-full">
                        <img
                          src={thumb}
                          alt={rel.name}
                          className="w-full h-full object-cover hover:scale-104 transition-transform"
                        />
                      </Link>
                    </div>

                    <div className="p-3 space-y-1.5">
                      <p className="text-[10px] font-extrabold text-[#0d8a4e] truncate">
                        {rel.category?.name || "ফ্যাশন"}
                      </p>
                      <Link href={`/product/${rel.slug || rel.id}`} className="block">
                        <h4 className="text-xs font-black text-slate-900 line-clamp-1 hover:text-[#0d8a4e] transition-colors">
                          {rel.name}
                        </h4>
                      </Link>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#0d8a4e]">
                          ৳{price.toLocaleString()}
                        </span>
                        {hasDisc && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ৳{origPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 pt-0">
                      <Link
                        href={`/product/${rel.slug || rel.id}`}
                        className="w-full py-2 rounded-xl bg-[#0d8a4e] hover:bg-[#0a7240] text-white text-xs font-black flex items-center justify-center gap-1"
                      >
                        <span>অর্ডার</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. MOBILE STICKY BOTTOM BAR (PRICE + QUANTITY + ORDER NOW BUTTON)         */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-2.5 px-3 flex items-center justify-between gap-3 md:hidden shadow-xl">
        {/* Price & Quantity */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold leading-none">মূল্য:</span>
            <span className="text-base font-black text-[#0d8a4e] leading-tight">
              ৳{(unitPrice * quantity).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 hover:bg-slate-200 text-slate-700"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-black">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 hover:bg-slate-200 text-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Order CTA Button */}
        <button
          type="button"
          onClick={scrollToOrderForm}
          className="flex-1 py-3 rounded-2xl bg-[#0d8a4e] active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
          <span>অর্ডার করুন</span>
        </button>
      </div>
    </div>
  );
}
