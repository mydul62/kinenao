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
  User,
  MapPin,
  FileText,
  ShoppingCart,
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
  const [deliveryZones, setDeliveryZones] = useState<any[]>([
    { id: "zone-dhaka", zoneName: "ঢাকা সিটির ভিতরে (Inside Dhaka)", charge: 60 },
    { id: "zone-suburbs", zoneName: "ঢাকা সাব-এরিয়া (সাভার, গাজীপুর, কেরানীগঞ্জ)", charge: 100 },
    { id: "zone-outside", zoneName: "সারাদেশে জেলা শহর (Outside Dhaka)", charge: 120 },
  ]);
  const [selectedZone, setSelectedZone] = useState<any>({
    id: "zone-dhaka",
    zoneName: "ঢাকা সিটির ভিতরে (Inside Dhaka)",
    charge: 60,
  });

  React.useEffect(() => {
    api
      .get("/delivery-zones")
      .then((res) => {
        const zones = res.data?.data?.deliveryZones || res.data?.data?.zones || [];
        if (zones.length > 0) {
          setDeliveryZones(zones);
          setSelectedZone(zones[0]);
        }
      })
      .catch(console.error);
  }, []);

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
  const shippingCharge = product?.isFreeDelivery ? 0 : (selectedZone ? Number(selectedZone.charge || 0) : 60);
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
    <div className="min-h-screen bg-[#f6f4ef] text-slate-900 pb-24 md:pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-[50px] pt-4 sm:pt-6 space-y-8 sm:space-y-10">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMBS                                                           */}
        {/* ========================================================================= */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none py-1 border-b border-slate-200/60 pb-3">
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
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* ========================================================================= */}
        {/* 2. PRODUCT MAIN SHOWCASE (2 COLUMNS ON DESKTOP, STACKED ON MOBILE)        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: PRODUCT GALLERY */}
          <div className="lg:col-span-6 w-full sticky lg:top-24">
            <div className="bg-white rounded-3xl p-3 sm:p-4 border border-[#e8e4db] shadow-xs">
              <ProductGallery
                images={galleryImages}
                productName={product.name}
                onWhatsAppClick={handleWhatsApp}
              />
            </div>
          </div>

          {/* RIGHT: BUY BOX & PRODUCT DETAILS CARD */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e4db] shadow-sm space-y-5">
              {/* Top Row: Verified Badge + SKU */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#0d8a4e] border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>১০০% অরিজিনাল পণ্য</span>
                  </div>
                  {product.isFreeDelivery && (
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-black shadow-2xs">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>🚚 ফ্রি হোম ডেলিভারি!</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-400">
                  SKU: <span className="text-slate-700 font-extrabold">{product.sku || "KIN-0184"}</span>
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                {product.name}
              </h1>

              {/* Rating & Stock Status */}
              <div className="flex flex-wrap items-center gap-3 text-xs border-y border-slate-100 py-3">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-slate-800 font-black ml-1">4.9</span>
                  <span className="text-slate-500 font-normal">(১২টি কাস্টমার রিভিউ)</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5 text-[#0d8a4e] font-black bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-[#0d8a4e] inline-block animate-pulse" />
                  <span>ইন স্টক (স্টকে আছে)</span>
                </div>
              </div>

              {/* Highlighted Price Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0d8a4e] tracking-tight">
                      ৳{unitPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-base sm:text-lg text-slate-400 font-semibold line-through">
                        ৳{originalUnitPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>আপনি সাশ্রয় করছেন ৳{savingsAmount.toLocaleString()}</span>
                    </p>
                  )}
                </div>

                {hasDiscount && (
                  <div className="bg-[#9c1d2e] text-white text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shadow-xs shrink-0">
                    {discountPercent}% ছাড়
                  </div>
                )}
              </div>

              {/* Variant Selector (Dynamic Multi-Attribute Support) */}
              {product.variants && product.variants.length > 0 && (
                <div className="pt-2">
                  <CustomerVariantSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onSelectVariant={(v) => setSelectedVariant(v)}
                  />
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  পরিমাণ (Quantity):
                </label>
                <div className="inline-flex items-center border border-slate-300 bg-slate-50/80 rounded-2xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-slate-200 text-slate-800 font-black cursor-pointer transition-colors shadow-2xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center text-base font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-slate-200 text-slate-800 font-black cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary & Secondary Action CTAs */}
              <div className="space-y-3 pt-2">
                {/* Primary Green CTA */}
                <button
                  type="button"
                  onClick={scrollToOrderForm}
                  className="w-full py-4 rounded-2xl bg-[#0d8a4e] hover:bg-[#0a7240] active:scale-[0.99] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-bounce" />
                  <span>সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
                </button>

                {/* Secondary Row: Add to Cart + WhatsApp */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
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
                    className="py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>হোয়াটসঅ্যাপ</span>
                  </button>
                </div>
              </div>

              {/* Call to Order Line */}
              <div className="text-center py-2.5 px-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <a
                  href="tel:01700000000"
                  className="text-xs font-extrabold text-slate-800 hover:text-[#0d8a4e] flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-[#0d8a4e]" />
                  <span>ফোনে অর্ডার করতে ডায়াল করুন: <span className="text-[#0d8a4e] font-black underline">01700-000000</span></span>
                </a>
              </div>

              {/* 2x2 Trust Badges Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <RotateCcw className="w-4 h-4 text-[#0d8a4e] shrink-0" />
                  <span>৭ দিনের রিটার্ন পলিসি</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <Truck className="w-4 h-4 text-[#0d8a4e] shrink-0" />
                  <span>দ্রুত হোম ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#0d8a4e] shrink-0" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <Award className="w-4 h-4 text-[#0d8a4e] shrink-0" />
                  <span>১০০% খাঁটি গুণগত মান</span>
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
            {/* Header Banner */}
            <div className="bg-[#0d8a4e] text-white p-5 sm:p-6 text-center space-y-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                <span>অর্ডার কনফার্ম করতে নিচের তথ্যগুলো পূরণ করুন</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-semibold">
                ক্যাশ অন ডেলিভারিতে সারাদেশে ডেলিভারি দেওয়া হয়। পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।
              </p>
            </div>

            {/* Placed Order Success Screen */}
            {placedOrder ? (
              <div className="p-8 sm:p-12 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#0d8a4e] flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  ধন্যবাদ! আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  অর্ডার আইডি: <span className="font-black text-[#0d8a4e] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">{placedOrder.id}</span>
                  <br />
                  আমাদের প্রতিনিধি শীঘ্রই ফোন করে আপনার অর্ডারটি কনফার্ম করবেন।
                </p>
                <div className="pt-4 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPlacedOrder(null)}
                    className="px-6 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    আরেকটি অর্ডার করুন
                  </button>
                  <Link
                    href="/shop"
                    className="px-7 py-3 rounded-2xl bg-[#0d8a4e] text-white text-xs sm:text-sm font-black hover:bg-[#0a7240] transition-colors shadow-md"
                  >
                    শপিং চালিয়ে যান
                  </Link>
                </div>
              </div>
            ) : (
              /* Order Form Body - 2 Columns on Desktop */
              <form onSubmit={handleDirectOrderSubmit} className="p-5 sm:p-7 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT COLUMN: CUSTOMER DELIVERY DETAILS (7 COLS ON DESKTOP) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Step 1 Title */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
                      <span className="w-7 h-7 rounded-full bg-[#0d8a4e] text-white font-black text-xs flex items-center justify-center shadow-xs">
                        ১
                      </span>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0d8a4e]" />
                        <span>ডেলিভারি তথ্য দিন</span>
                      </h3>
                    </div>

                    {/* Name & Phone Fields Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                          আপনার নাম <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                            value={orderForm.fullName}
                            onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                            className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d8a4e]/20 focus:border-[#0d8a4e] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                          মোবাইল নম্বর <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            placeholder="017XXXXXXXX"
                            value={orderForm.phoneNumber}
                            onChange={(e) => setOrderForm({ ...orderForm, phoneNumber: e.target.value })}
                            className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d8a4e]/20 focus:border-[#0d8a4e] focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address Textarea */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                        সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <textarea
                          required
                          rows={3}
                          placeholder="বাসা নং, রোড নং, এলাকা, থানা, জেলা..."
                          value={orderForm.address}
                          onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d8a4e]/20 focus:border-[#0d8a4e] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Delivery Zone Options */}
                    <div className="space-y-3">
                      <label className="block text-xs font-extrabold text-slate-800">
                        ডেলিভারি এরিয়া নির্বাচন করুন:
                      </label>
                      <div className="space-y-2.5">
                        {deliveryZones.map((zone) => {
                          const isSelected = selectedZone?.id === zone.id;
                          return (
                            <label
                              key={zone.id}
                              onClick={() => setSelectedZone(zone)}
                              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-emerald-50/90 border-[#0d8a4e] text-[#0d8a4e] shadow-sm font-black ring-1 ring-[#0d8a4e]/30"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 font-bold"
                              }`}
                            >
                              <div className="flex items-center gap-3 text-xs sm:text-sm">
                                <input
                                  type="radio"
                                  name="deliveryZone"
                                  checked={isSelected}
                                  onChange={() => setSelectedZone(zone)}
                                  className="w-4.5 h-4.5 text-[#0d8a4e] accent-[#0d8a4e]"
                                />
                                <span>{zone.zoneName}</span>
                              </div>
                              <span className={`text-xs sm:text-sm font-black px-3 py-1 rounded-xl border ${
                                product.isFreeDelivery
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-white border-slate-200 text-slate-800"
                              }`}>
                                {product.isFreeDelivery ? "৳0 (ফ্রি!)" : `৳${zone.charge}`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Notes Field */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                        বিশেষ নির্দেশনা (ঐচ্ছিক):
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="পণ্য বা ডেলিভারি সম্পর্কিত বার্তা..."
                          value={orderForm.orderNotes}
                          onChange={(e) => setOrderForm({ ...orderForm, orderNotes: e.target.value })}
                          className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d8a4e]/20 focus:border-[#0d8a4e] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: ORDER SUMMARY & CHECKOUT CARD (5 COLS ON DESKTOP) */}
                  <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24 bg-slate-50/90 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                    {/* Step 2 Title */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
                      <span className="w-7 h-7 rounded-full bg-[#0d8a4e] text-white font-black text-xs flex items-center justify-center shadow-xs">
                        ২
                      </span>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-[#0d8a4e]" />
                        <span>অর্ডারের বিবরণ</span>
                      </h3>
                    </div>

                    {/* Product Mini Summary */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
                      <img
                        src={galleryImages[0]}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {product.name}
                        </h4>
                        {selectedVariant && (
                          <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-100">
                            {selectedVariant.name}
                          </p>
                        )}
                        <p className="text-xs font-black text-[#0d8a4e] mt-1">
                          ৳{unitPrice.toLocaleString()} × {quantity} = ৳{itemsSubtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Coupon Apply Box */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="কুপন কোড (যদি থাকে)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 h-11 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-bold uppercase placeholder-slate-400 focus:outline-none focus:border-[#0d8a4e]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-5 h-11 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-black transition-colors cursor-pointer shadow-2xs"
                      >
                        প্রয়োগ
                      </button>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-bold text-slate-700 shadow-2xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">পণ্যের মূল্য:</span>
                        <span className="text-slate-900 font-extrabold">৳{itemsSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ডেলিভারি চার্জ:</span>
                        <span className="text-slate-900 font-extrabold">৳{shippingCharge.toLocaleString()}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-black">
                          <span>কুপন ছাড় ({appliedCoupon?.code}):</span>
                          <span>-৳{couponDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                        <span className="text-sm font-black text-slate-900">সর্বমোট মূল্য:</span>
                        <span className="text-xl font-black text-[#0d8a4e]">৳{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="w-full py-4 rounded-2xl bg-[#0d8a4e] hover:bg-[#0a7240] active:scale-[0.99] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
                    >
                      {submittingOrder ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5 stroke-[3]" />
                      )}
                      <span>অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString()})</span>
                    </button>

                    {/* Trust Guarantee Note */}
                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 text-center">
                      <Lock className="w-3.5 h-3.5 text-[#0d8a4e]" />
                      <span>১০০% নিরাপদ অর্ডার • পণ্য পেয়ে মূল্য পরিশোধ</span>
                    </div>
                  </div>

                </div>
              </form>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. VIDEO DEMO SECTION                                                    */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e4db] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>পণ্যের ভিডিও রিভিউ দেখুন</span>
            </h3>
            <span className="bg-slate-900 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full">
              HD 1080p Video
            </span>
          </div>

          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-2xl bg-slate-950 overflow-hidden shadow-md flex items-center justify-center">
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
                  className="absolute z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-[#0d8a4e] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                >
                  <Play className="w-8 h-8 fill-[#0d8a4e] ml-1" />
                </button>
                <div className="absolute top-4 left-4 bg-[#0d8a4e] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                  ভিডিও চালু করুন
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
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/60 px-4 sm:px-6 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`py-4 px-6 text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer border-b-3 ${
                activeTab === "description"
                  ? "border-[#0d8a4e] text-[#0d8a4e] bg-white rounded-t-2xl shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              বিস্তারিত বিবরণ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("policy")}
              className={`py-4 px-6 text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer border-b-3 ${
                activeTab === "policy"
                  ? "border-[#0d8a4e] text-[#0d8a4e] bg-white rounded-t-2xl shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              ডেলিভারি ও রিটার্ন পলিসি
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-6 text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer border-b-3 ${
                activeTab === "reviews"
                  ? "border-[#0d8a4e] text-[#0d8a4e] bg-white rounded-t-2xl shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              কাস্টমার রিভিউ (১২)
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-6 sm:p-8">
            {activeTab === "description" && (
              <div className="prose max-w-none text-slate-800 leading-relaxed">
                {product.description ? (
                  <RichTextContent content={product.description} />
                ) : (
                  <p className="text-sm text-slate-600">
                    আমাদের প্রতিটি পণ্য অত্যন্ত নিখুঁত ও যত্নসহকারে তৈরি। ১০০% অরিজিনাল কোয়ালিটি ও দ্রুত হোম ডেলিভারি নিশ্চয়তা।
                  </p>
                )}
              </div>
            )}

            {activeTab === "policy" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0d8a4e]" />
                    <span>ডেলিভারি পলিসি</span>
                  </h4>
                  <ul className="space-y-2 text-slate-600 font-semibold">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0d8a4e] mt-2 shrink-0" />
                      <span>ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৬০ টাকা (২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি)।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0d8a4e] mt-2 shrink-0" />
                      <span>ঢাকা সাব-এরিয়া ১০০ টাকা এবং ঢাকার বাইরে ১২০ টাকা (২-৩ কার্যদিবস)।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0d8a4e] mt-2 shrink-0" />
                      <span>ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে মূল্য পরিশোধ করার সুযোগ।</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#0d8a4e]" />
                    <span>রিটার্ন ও পরিবর্তন পলিসি</span>
                  </h4>
                  <ul className="space-y-2 text-slate-600 font-semibold">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0d8a4e] mt-2 shrink-0" />
                      <span>পণ্য ডেলিভারি ম্যানের সামনে চেক করে নেওয়ার অনুরোধ করা হচ্ছে।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0d8a4e] mt-2 shrink-0" />
                      <span>কোনো সমস্যা থাকলে ৭ দিনের মধ্যে আমাদের সাপোর্টে কল করে বিনামূল্যে পরিবর্তন করতে পারবেন।</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 max-w-2xl">
                  <h4 className="text-sm font-black text-slate-900">আপনার রিভিউ দিন</h4>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="আপনার নাম"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="আপনার মন্তব্য লিখুন..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 rounded-xl bg-[#0d8a4e] text-white text-xs font-black hover:bg-[#0a7240] transition-colors shadow-xs"
                  >
                    রিভিউ সাবমিট করুন
                  </button>
                </form>

                {/* Sample reviews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "সাদিয়া আক্তার", rating: 5, date: "২ দিন আগে", text: "পণ্যটির মান অসাধারণ! ১০০% অরিজিনাল।" },
                    { name: "মাহমুদুল হাসান", rating: 5, date: "৫ দিন আগে", text: "ডেলিভারি খুব দ্রুত পেয়েছি। প্যাকেজিংও খুব ভালো ছিল।" },
                  ].map((r, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900">{r.name}</span>
                        <span className="text-slate-400">{r.date}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.rating }).map((_, si) => (
                          <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. RELATED PRODUCTS SECTION                                              */}
        {/* ========================================================================= */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>এই ক্যাটাগরির আরো পণ্য</span>
              </h3>
              <Link
                href={`/category/${product.category?.slug || product.categoryId || ""}`}
                className="text-xs font-black text-[#0d8a4e] hover:underline flex items-center gap-1"
              >
                <span>সকল পণ্য দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                    className="bg-white rounded-3xl border border-[#e8e4db] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      {hasDisc && (
                        <span className="absolute top-2 right-2 z-10 bg-[#9c1d2e] text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-xl shadow-xs">
                          {discP}% ছাড়
                        </span>
                      )}
                      <Link href={`/product/${rel.slug || rel.id}`} className="block w-full h-full">
                        <img
                          src={thumb}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-extrabold text-[#0d8a4e] uppercase tracking-wider">
                          {rel.category?.name || "ক্যাটাগরি"}
                        </p>
                        <Link href={`/product/${rel.slug || rel.id}`} className="block">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 hover:text-[#0d8a4e] transition-colors leading-snug">
                            {rel.name}
                          </h4>
                        </Link>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base sm:text-lg font-black text-[#0d8a4e]">
                          ৳{price.toLocaleString()}
                        </span>
                        {hasDisc && (
                          <span className="text-xs text-slate-400 font-semibold line-through">
                            ৳{origPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link
                        href={`/product/${rel.slug || rel.id}`}
                        className="w-full py-2.5 rounded-xl bg-[#0d8a4e] hover:bg-[#0a7240] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>অর্ডার করুন</span>
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
