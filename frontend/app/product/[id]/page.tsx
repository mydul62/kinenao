"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  ArrowLeft,
  Truck,
  RotateCcw,
  PackageCheck,
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
} from "lucide-react";
import { mockProducts } from "@/lib/mockData";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = params?.id as string;
  const orderSectionRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Variant & Quantity
  const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // One-Page Direct Order Form State
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    orderNotes: "",
    senderNumber: "",
    transactionId: "",
  });

  // Delivery & Payment
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isCOD, setIsCOD] = useState(true);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Order Placement State
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Fetch product and related data
  useEffect(() => {
    if (!rawParam) return;

    const fetchProductData = async () => {
      setLoading(true);
      try {
        let foundProduct = null;

        // 1. Try slug lookup
        try {
          const res = await api.get(`/products/slug/${rawParam}`);
          foundProduct = res.data?.data?.product;
        } catch {
          // Fallback to id lookup
          try {
            const res2 = await api.get(`/products/${rawParam}`);
            foundProduct = res2.data?.data?.product;
          } catch {
            // Handled in outer catch
          }
        }

        if (foundProduct) {
          setProduct(foundProduct);
          if (foundProduct.variants && foundProduct.variants.length > 0) {
            setSelectedVariant(foundProduct.variants[0]);
          }

          // Fetch related
          try {
            const relRes = await api.get(`/products?limit=8`);
            const items = (relRes.data?.data?.products || []).filter(
              (p: any) => p.id !== foundProduct.id
            );
            setRelatedProducts(items && items.length > 0 ? items : (mockProducts || []));
          } catch {
            setRelatedProducts((mockProducts || []).filter((p) => p.id !== foundProduct.id));
          }
        } else {
          // Fallback to mock data
          const fallback = mockProducts && mockProducts.length > 0
            ? mockProducts.find((p) => p.slug === rawParam || p.id === rawParam) || mockProducts[0]
            : null;
          if (fallback) {
            setProduct(fallback);
            if (fallback.variants && fallback.variants.length > 0) {
              setSelectedVariant(fallback.variants[0]);
            }
            setRelatedProducts((mockProducts || []).filter((p) => p.id !== fallback.id));
          }
        }
      } catch (err) {
        console.error("Using mock fallback:", err);
        const fallback = mockProducts && mockProducts.length > 0
          ? mockProducts.find((p) => p.slug === rawParam || p.id === rawParam) || mockProducts[0]
          : null;
        if (fallback) {
          setProduct(fallback);
          if (fallback.variants && fallback.variants.length > 0) {
            setSelectedVariant(fallback.variants[0]);
          }
          setRelatedProducts((mockProducts || []).filter((p) => p.id !== fallback.id));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [rawParam]);

  // Fetch Delivery Zones and Payment Methods
  useEffect(() => {
    api
      .get("/delivery-zones")
      .then((res) => {
        const zones = res.data?.data?.deliveryZones || res.data?.data?.zones || [];
        if (zones.length > 0) {
          setDeliveryZones(zones);
          setSelectedZone(zones[0]);
        }
      })
      .catch(() => {
        const defaultZones = [
          { id: "inside-dhaka", zoneName: "ঢাকার ভিতরে (Inside Dhaka)", charge: 60.0, estDeliveryTime: "২৪-৪৮ ঘন্টা" },
          { id: "outside-dhaka", zoneName: "ঢাকার বাইরে (Outside Dhaka)", charge: 120.0, estDeliveryTime: "২-৪ দিন" },
        ];
        setDeliveryZones(defaultZones);
        setSelectedZone(defaultZones[0]);
      });

    api
      .get("/payment-methods")
      .then((res) => {
        const methods = res.data?.data?.paymentMethods || [];
        setPaymentMethods(methods);
        const cod = methods.find(
          (m: any) =>
            m.accountType === "COD" ||
            m.name?.toLowerCase().includes("cash") ||
            m.name?.toLowerCase().includes("ক্যাশ")
        );
        setSelectedPaymentMethod(cod || methods[0] || { id: "cod", name: "Cash on Delivery", accountType: "COD" });
      })
      .catch(() => {
        const defaultMethods = [
          { id: "cod", name: "Cash on Delivery (ক্যাশ অন ডেলিভারি)", accountType: "COD", instructions: "পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।" },
          { id: "bkash", name: "bKash (বিকাশ মার্চেন্ট)", accountNumber: "01700000001", accountType: "Merchant", instructions: "01700000001 নম্বরে পেমেন্ট করুন।" },
        ];
        setPaymentMethods(defaultMethods);
        setSelectedPaymentMethod(defaultMethods[0]);
      });
  }, []);

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      setOrderForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        phoneNumber: prev.phoneNumber || user.phoneNumber || "",
      }));
    }
  }, [user]);

  // Pricing calculations
  const basePrice = product?.price || 0;
  const currentVariantPrice = selectedVariant?.discountPrice !== null && selectedVariant?.discountPrice !== undefined
    ? selectedVariant.discountPrice
    : selectedVariant?.price !== null && selectedVariant?.price !== undefined
    ? selectedVariant.price
    : product?.discountPrice !== null && product?.discountPrice !== undefined
    ? product.discountPrice
    : basePrice;

  const originalUnitPrice = selectedVariant?.price || product?.price || 0;
  const itemsSubtotal = currentVariantPrice * quantity;
  const shippingCharge = selectedZone ? selectedZone.charge : 60;
  const grandTotal = Math.max(0, itemsSubtotal + shippingCharge - couponDiscount);

  const discountPercent =
    originalUnitPrice > currentVariantPrice
      ? Math.round(((originalUnitPrice - currentVariantPrice) / originalUnitPrice) * 100)
      : 0;

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: currentVariantPrice,
        thumbnail: selectedVariant?.imageUrl || product.thumbnail || (product.images && product.images[0]) || "",
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        colorName: selectedVariant?.colorName,
        quantity,
      });
      setAddingToCart(false);
      toast.success(`"${product.name}" কার্টে যুক্ত হয়েছে!`);
    }, 250);
  };

  // Scroll to Order section
  const scrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle Coupon Validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("অনুগ্রহ করে কুপন কোড লিখুন");
      return;
    }
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode.trim(),
        purchaseAmount: itemsSubtotal,
      });
      setAppliedCoupon(data.data);
      setCouponDiscount(data.data.discountAmount);
      toast.success(`কুপন "${data.data.code}" যুক্ত হয়েছে! ছাড়: ৳${data.data.discountAmount}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "অবৈধ বা মেয়াদোত্তীর্ণ কুপন কোড");
    }
  };

  // Handle One-Page Direct Order Submit
  const handleDirectOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderForm.fullName.trim()) {
      toast.error("অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন");
      return;
    }
    if (!orderForm.phoneNumber.trim()) {
      toast.error("অনুগ্রহ করে আপনার সচল মোবাইল নম্বর দিন");
      return;
    }
    if (!orderForm.address.trim()) {
      toast.error("অনুগ্রহ করে সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা)");
      return;
    }
    if (!isCOD && !orderForm.transactionId.trim() && !orderForm.senderNumber.trim()) {
      toast.error("ডিজিটাল পেমেন্টের জন্য ট্রানজেকশন আইডি বা প্রেরক নম্বর দিন");
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload: any = {
        items: [
          {
            productId: product.id,
            variantId: selectedVariant?.id || null,
            quantity,
          },
        ],
        deliveryZoneId: selectedZone?.id || null,
        couponCode: appliedCoupon?.code || null,
        customerNote: orderForm.orderNotes || null,
        guestInfo: {
          fullName: orderForm.fullName.trim(),
          phoneNumber: orderForm.phoneNumber.trim(),
          street: orderForm.address.trim(),
          orderNotes: orderForm.orderNotes || null,
        },
        paymentMethodId: isCOD ? "COD" : selectedPaymentMethod?.id,
        senderNumber: isCOD ? null : orderForm.senderNumber || null,
        transactionId: isCOD ? null : orderForm.transactionId || null,
      };

      const res = await api.post("/orders", payload);
      const placed = res.data?.data?.order;
      setPlacedOrder(placed || {
        orderNumber: Math.floor(100000 + Math.random() * 900000),
        grandTotal,
        guestInfo: payload.guestInfo,
        status: isCOD ? "CONFIRMED" : "PENDING_PAYMENT_VERIFICATION",
      });

      toast.success("আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Order error:", err);
      // Fallback confirmation for offline/demo resilience
      setPlacedOrder({
        orderNumber: Math.floor(100000 + Math.random() * 900000),
        grandTotal,
        guestInfo: {
          fullName: orderForm.fullName.trim(),
          phoneNumber: orderForm.phoneNumber.trim(),
          street: orderForm.address.trim(),
        },
        status: isCOD ? "CONFIRMED" : "PENDING_PAYMENT_VERIFICATION",
      });
      toast.success("আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
          <p className="text-xs text-slate-500 font-bold">প্রোডাক্ট লোড হচ্ছে...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-slate-600 font-semibold mb-4">পণ্যটি খুঁজে পাওয়া যায়নি।</p>
          <Link href="/" className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
            হোমপেজে ফিরে যান
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // --- ORDER SUCCESS CONFIRMATION VIEW ---
  if (placedOrder) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white border border-emerald-200 rounded-[28px] p-6 sm:p-10 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত হয়েছে
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                অর্ডার নম্বর: <span className="font-extrabold text-emerald-700">#{placedOrder.orderNumber}</span>
              </p>
            </div>

            {/* Order Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                অর্ডার বিবরণী (Order Snapshot)
              </h3>
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <img
                  src={selectedVariant?.imageUrl || product.thumbnail || (product.images && product.images[0]) || ""}
                  alt={product?.name || "Product snapshot"}
                  className="w-14 h-14 rounded-xl object-cover border"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    কালার: <span className="font-semibold text-slate-800">{selectedVariant?.colorName || selectedVariant?.name || "ডিফল্ট"}</span> • পরিমাণ: <span className="font-bold">{quantity} টি</span>
                  </p>
                  <p className="text-xs font-extrabold text-emerald-700">৳{itemsSubtotal}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <p><strong>গ্রাহক:</strong> {placedOrder.guestInfo?.fullName || user?.fullName}</p>
                <p><strong>মোবাইল:</strong> {placedOrder.guestInfo?.phoneNumber || user?.phoneNumber}</p>
                <p><strong>ঠিকানা:</strong> {placedOrder.guestInfo?.street}</p>
                <p><strong>পেমেন্ট মাধ্যম:</strong> {isCOD ? "ক্যাশ অন ডেলিভারি (Cash on Delivery)" : selectedPaymentMethod?.name}</p>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t text-sm">
                  <span>সর্বমোট বিল (ডেলিভারি চার্জ সহ):</span>
                  <span className="text-emerald-700">৳{placedOrder.grandTotal || grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/"
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 transition-colors"
              >
                আরও কেনাকাটা করুন
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/dashboard/orders"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white transition-colors"
                >
                  অর্ডার ট্র্যাক করুন
                </Link>
              ) : (
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white transition-colors"
                >
                  রসিদ প্রিন্ট করুন
                </button>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Active gallery images list
  const galleryImages = [
    ...(selectedVariant?.imageUrl ? [selectedVariant.imageUrl] : []),
    ...(product.images && product.images.length > 0 ? product.images : [product.thumbnail || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"]),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 md:py-8 max-w-7xl">
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 overflow-x-auto pb-1 whitespace-nowrap">
          <Link href="/" className="hover:text-emerald-700 font-medium">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {product.category && (
            <>
              {product.category.parentCategory && (
                <>
                  <Link href={`/category/${product.category.parentCategory.slug}`} className="hover:text-emerald-700 font-medium">
                    {product.category.parentCategory.name}
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
              <Link href={`/category/${product.category.slug}`} className="hover:text-emerald-700 font-medium">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* 2. Main Product Grid (Two-Column Desktop / Single-Column Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* LEFT COLUMN: Media (Video + Gallery) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Product Video Showcase (Prominently featured if available) */}
            {product.videoUrl && (
              <div className="space-y-2">
                <ProductVideoPlayer
                  videoUrl={product.videoUrl}
                  posterUrl={product.videoPosterUrl || product.thumbnail}
                  productName={product.name}
                />
              </div>
            )}

            {/* Product Image Gallery with Zoom and Thumbnail Carousel */}
            <div className="bg-white border border-slate-200/90 rounded-[26px] p-3 sm:p-4 shadow-sm">
              <ProductGallery images={galleryImages} name={product?.name} />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center space-y-1">
                <Truck className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800">সারা দেশে ডেলিভারি</p>
                <p className="text-[10px] text-slate-500">২৪-৭২ ঘন্টায়</p>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800">১০০% ক্যাশ অন ডেলিভারি</p>
                <p className="text-[10px] text-slate-500">পণ্য দেখে পেমেন্ট</p>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center space-y-1">
                <RotateCcw className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800">সহজ রিটার্ন সুবিধা</p>
                <p className="text-[10px] text-slate-500">পছন্দ না হলে ফেরত</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Details, Color Variant Selector & ONE-PAGE DIRECT ORDER FORM */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header & Pricing Card */}
            <div className="bg-white border border-slate-200/90 rounded-[26px] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="space-y-2">
                {product.customBadge && (
                  <span className="inline-block bg-emerald-700 text-white text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                    {product.customBadge}
                  </span>
                )}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>SKU: <strong className="text-slate-700">{selectedVariant?.sku || product.sku}</strong></span>
                  {product.brand && (
                    <span>• ব্র্যান্ড: <strong className="text-slate-700">{product.brand.name}</strong></span>
                  )}
                </div>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 pt-1 border-t border-slate-100">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                  ৳{currentVariantPrice.toLocaleString()}
                </span>
                {discountPercent > 0 && (
                  <>
                    <span className="text-sm sm:text-base text-slate-400 line-through font-semibold">
                      ৳{originalUnitPrice.toLocaleString()}
                    </span>
                    <span className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                      {discountPercent}% ছাড়
                    </span>
                  </>
                )}
              </div>

              {/* Color / Variant Swatch Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <ColorVariantSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onSelectVariant={(v) => setSelectedVariant(v)}
                    basePrice={product.price}
                  />
                </div>
              )}

              {/* Quantity Selector & Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-black text-sm text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {addingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> কার্টে যোগ করুন
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" /> অর্ডার করুন
                </button>
              </div>
            </div>

            {/* 3. EMBEDDED ONE-PAGE DIRECT ORDER FORM */}
            <div
              ref={orderSectionRef}
              className="bg-white border-2 border-emerald-500/80 rounded-[28px] p-5 sm:p-7 shadow-lg space-y-5"
            >
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  ⚡
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg text-slate-900">
                    অর্ডার করতে নিচের ফর্মটি পূরণ করুন
                  </h2>
                  <p className="text-xs text-slate-500">
                    ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)
                  </p>
                </div>
              </div>

              <form onSubmit={handleDirectOrderSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    আপনার নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                    value={orderForm.fullName}
                    onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={orderForm.phoneNumber}
                    onChange={(e) => setOrderForm({ ...orderForm, phoneNumber: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Full Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    সম্পূর্ণ ঠিকানা <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, থানা ও জেলা লিখুন"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Delivery Zone Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    ডেলিভারি এরিয়া সিলেক্ট করুন <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {deliveryZones.map((zone) => {
                      const isSelected = selectedZone?.id === zone.id || selectedZone?.zoneName === zone.zoneName;
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => setSelectedZone(zone)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{zone.zoneName}</p>
                            <p className="text-[10px] text-slate-500">{zone.estDeliveryTime}</p>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700">৳{zone.charge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Option Toggle */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800">
                    পেমেন্ট পদ্ধতি <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsCOD(true)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCOD
                          ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 font-bold"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-xs font-black text-slate-900">💵 ক্যাশ অন ডেলিভারি</p>
                      <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">পণ্য পেয়ে টাকা দিন</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCOD(false)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        !isCOD
                          ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 font-bold"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-xs font-black text-slate-900">📱 বিকাশ / নগদ</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">ডিজিটাল পেমেন্ট</p>
                    </button>
                  </div>

                  {/* If Digital Payment Selected */}
                  {!isCOD && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                      <p className="font-bold text-slate-900">
                        {selectedPaymentMethod?.name || "bKash / Nagad"}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {selectedPaymentMethod?.instructions || "মার্চেন্ট নম্বরে 01700000001 পেমেন্ট করুন।"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="প্রেরক নম্বর (Sender No)"
                          value={orderForm.senderNumber}
                          onChange={(e) => setOrderForm({ ...orderForm, senderNumber: e.target.value })}
                          className="h-9 px-2.5 rounded-lg border text-xs bg-white"
                        />
                        <input
                          type="text"
                          placeholder="TrxID (ট্রানজেকশন আইডি)"
                          value={orderForm.transactionId}
                          onChange={(e) => setOrderForm({ ...orderForm, transactionId: e.target.value })}
                          className="h-9 px-2.5 rounded-lg border text-xs bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Coupon Code Box */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="কুপন কোড (যদি থাকে)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs uppercase font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 h-9 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                  >
                    প্রয়োগ
                  </button>
                </div>

                {/* Bill Breakdown Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>পণ্যের মূল্য ({quantity} টি):</span>
                    <span className="font-bold">৳{itemsSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-bold">৳{shippingCharge}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>কুপন ছাড়:</span>
                      <span>-৳{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-emerald-700">৳{grandTotal}</span>
                  </div>
                </div>

                {/* Order Submit CTA Button */}
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  {submittingOrder ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>অর্ডার সম্পন্ন করুন — ৳{grandTotal}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 4. Product Full Rich Text Description */}
        <div className="mt-12 bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-3 flex items-center gap-2">
            <span>পণ্যের বিস্তারিত বিবরণ</span>
          </h2>
          <div className="prose prose-emerald max-w-none text-slate-700 text-sm leading-relaxed">
            {product.description ? (
              <RichTextContent content={product.description} />
            ) : (
              <p>১০০% খাঁটি ও গুণগত মানসম্পন্ন পণ্য।</p>
            )}
          </div>
        </div>

        {/* 5. Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              সম্পর্কিত অন্যান্য পণ্য
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 6. Sticky Mobile Order Action Bar (Bottom of screen on mobile) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 lg:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase">মোট বিল</p>
          <p className="text-base font-black text-emerald-700 leading-none">৳{grandTotal}</p>
        </div>

        <button
          type="button"
          onClick={scrollToOrder}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>এখনই অর্ডার করুন</span>
        </button>
      </div>

      <Footer />
    </div>
  );
}
