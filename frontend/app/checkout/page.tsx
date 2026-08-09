"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag,
  MapPin,
  Truck,
  CheckCircle2,
  Loader2,
  PhoneCall,
  ShieldCheck,
  PackageCheck,
  Tag,
} from "lucide-react";

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const router = useRouter();

  // Single Page Direct Checkout Form (No Login Required, Cash on Delivery Only)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    orderNotes: "",
  });

  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [codPaymentMethod, setCodPaymentMethod] = useState<any>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Fetch Delivery Zones and COD Payment Method
  useEffect(() => {
    // 1. Fetch Zones
    api
      .get("/delivery-zones")
      .then((res) => {
        const zones = res.data.data.deliveryZones || res.data.data.zones || [];
        setDeliveryZones(zones);
        if (zones.length > 0) setSelectedZone(zones[0]);
      })
      .catch(console.error);

    // 2. Fetch COD Payment Method
    api
      .get("/payment-methods")
      .then((res) => {
        const methods = res.data.data.paymentMethods || [];
        const cod = methods.find(
          (m: any) =>
            m.accountType === "COD" ||
            m.name?.toLowerCase().includes("cash") ||
            m.name?.toLowerCase().includes("ক্যাশ")
        );
        setCodPaymentMethod(cod || methods[0]);
      })
      .catch(console.error);
  }, []);

  // Handle Coupon Validation
  const handleApplyCoupon = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("অনুগ্রহ করে কুপন কোড লিখুন");
      return;
    }
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode.trim(),
        purchaseAmount: cartSubtotal,
      });
      setAppliedCoupon({
        id: data.data.couponId,
        code: data.data.code,
      });
      setCouponDiscount(data.data.discountAmount);
      toast.success(`কুপন "${data.data.code}" সফলভাবে যুক্ত হয়েছে! (ছাড়: ৳${data.data.discountAmount})`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "অবৈধ বা মেয়াদউত্তীর্ণ কুপন কোড");
    }
  };

  const shippingCharge = selectedZone ? selectedZone.charge : 60;
  const grandTotal = Math.max(0, cartSubtotal + shippingCharge - couponDiscount);

  // Handle Direct Cash on Delivery Instant Order Placement
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("অনুগ্রহ করে মোবাইল নম্বর লিখুন");
      return;
    }
    if (!form.street.trim()) {
      toast.error("অনুগ্রহ করে পূর্ণাঙ্গ ডেলিভারি ঠিকানা লিখুন");
      return;
    }
    if (!selectedZone) {
      toast.error("অনুগ্রহ করে ডেলিভারি এলাকা নির্বাচন করুন");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create Order with Guest Info, Delivery Zone & Optional Coupon
      const orderPayload = {
        deliveryZoneId: selectedZone.id,
        couponCode: appliedCoupon?.code || undefined,
        items: cart.map((item) => ({
          productId: item.id,
          productVariantId: item.variantId || undefined,
          quantity: item.quantity,
          name: item.name,
          variantName: item.variantName || undefined,
          price: item.discountPrice || item.price,
        })),
        guestInfo: {
          fullName: form.fullName,
          phone: form.phone,
          street: form.street,
          city: selectedZone.zoneName || "ঢাকা",
          country: "Bangladesh",
          orderNotes: form.orderNotes,
        },
      };

      const { data } = await api.post("/orders", orderPayload);
      const createdOrder = data.data.order;

      // Step 2: Automatically Submit Cash on Delivery Payment Confirmation
      if (codPaymentMethod && createdOrder) {
        await api.post(`/orders/${createdOrder.id}/submit-payment`, {
          paymentMethodId: codPaymentMethod.id,
          transactionId: "CASH-ON-DELIVERY",
          senderNumber: `${form.fullName} (${form.phone})`,
          paidAmount: createdOrder.grandTotal || grandTotal,
        });
      }

      setPlacedOrder(createdOrder || { id: "ORDER-" + Date.now() });
      clearCart();
      toast.success("আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(
        error.response?.data?.message || "অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে, আবার চেষ্টা করুন"
      );
    } finally {
      setLoading(false);
    }
  };

  // Order Success View
  if (placedOrder) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafafa]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              ক্যাশ অন ডেলিভারি অর্ডার নিশ্চিত
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              অর্ডার সফল হয়েছে!
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              ধন্যবাদ <strong>{form.fullName || "গ্রাহক"}</strong>! আপনার অর্ডারটি গ্রহণ করা হয়েছে। পণ্য ডেলিভারির সময় নগদ অর্থ প্রদান করুন।
            </p>
          </div>

          <Card className="border border-slate-200 shadow-sm text-left rounded-2xl bg-white p-5 space-y-3">
            <div className="flex justify-between border-b pb-2 text-xs">
              <span className="text-slate-500 font-bold">অর্ডার নম্বর:</span>
              <span className="font-extrabold text-slate-900">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2 text-xs">
              <span className="text-slate-500 font-bold">মোবাইল নম্বর:</span>
              <span className="font-extrabold text-slate-900">{form.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2 text-xs">
              <span className="text-slate-500 font-bold">ডেলিভারি ঠিকানা:</span>
              <span className="font-extrabold text-slate-900 truncate max-w-[200px]">{form.street}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-black">
              <span className="text-[#1c3d5a]">মোট প্রদেয় টাকা:</span>
              <span className="text-[#009669] text-base">৳{placedOrder.grandTotal || grandTotal}</span>
            </div>
          </Card>

          <Button
            onClick={() => router.push("/shop")}
            className="w-full bg-[#009669] hover:bg-[#007f59] text-white font-extrabold py-3.5 rounded-xl cursor-pointer uppercase tracking-wider"
          >
            আরও কেনাকাটা করুন
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty Cart View
  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafafa]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-20 text-center space-y-4">
          <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-2xl font-black text-slate-800">আপনার কার্ট খালি</h2>
          <p className="text-xs text-slate-500">অর্ডার করার আগে ক্যাটালগ থেকে পণ্য যোগ করুন।</p>
          <Button
            onClick={() => router.push("/shop")}
            className="bg-[#009669] hover:bg-[#007f59] text-white font-extrabold px-6 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
          >
            শপ ব্রাউজ করুন
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="text-center space-y-1 max-w-md mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-[#009669]/10 text-[#009669] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <PackageCheck className="h-4 w-4" /> ১০০% ক্যাশ অন ডেলিভারি (অগ্রিম পেমেন্ট নেই)
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            সহজ চেকআউট
          </h1>
          <p className="text-xs text-slate-500">
            লগইন ছাড়াই নিচে আপনার নাম, মোবাইল নম্বর ও ঠিকানা দিয়ে অর্ডার সম্পন্ন করুন।
          </p>
        </div>

        <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Instant Guest Customer Info */}
          <div className="md:col-span-7 space-y-5">
            <Card className="border border-slate-200/90 rounded-2xl bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 border-b p-4">
                <CardTitle className="text-base font-extrabold text-[#1c3d5a] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#009669]" /> শিপিং ও ডেলিভারি তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-extrabold text-slate-800">
                    আপনার নাম <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="যেমন: মোঃ রহিম করিম"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="h-11 rounded-xl border-slate-300 text-sm font-semibold"
                    required
                  />
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-extrabold text-slate-800">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="যেমন: 01700000000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-11 rounded-xl border-slate-300 text-sm font-semibold"
                    required
                  />
                </div>

                {/* Street Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="street" className="text-xs font-extrabold text-slate-800">
                    পূর্ণাঙ্গ ঠিকানা (বাসা/রোড/এলাকা) <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="street"
                    rows={3}
                    placeholder="যেমন: হাউজ ১০, রোড ২, সেক্টর ৪, উত্তরা, ঢাকা"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className="rounded-xl border-slate-300 text-sm font-semibold"
                    required
                  />
                </div>

                {/* Delivery Zone Selection */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-[#009669]" /> ডেলিভারি এলাকা নির্বাচন করুন <span className="text-rose-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deliveryZones.map((zone) => (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                          selectedZone?.id === zone.id
                            ? "border-[#009669] bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-xs text-slate-900">{zone.zoneName}</p>
                          <p className="text-[10px] text-slate-500">{zone.estDeliveryTime || "১-৩ দিন"}</p>
                        </div>
                        <span className="font-black text-sm text-[#009669]">৳{zone.charge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Order Notes */}
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="orderNotes" className="text-xs font-bold text-slate-600">
                    বিশেষ কোনো নির্দেশনা / অর্ডার নোট (ঐচ্ছিক)
                  </Label>
                  <Input
                    id="orderNotes"
                    placeholder="যেমন: বিকেলে ডেলিভারি করবেন"
                    value={form.orderNotes}
                    onChange={(e) => setForm({ ...form, orderNotes: e.target.value })}
                    className="h-10 rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary & Instant Submit */}
          <div className="md:col-span-5 space-y-5">
            <Card className="border border-slate-200/90 rounded-2xl bg-white shadow-sm overflow-hidden sticky top-6">
              <CardHeader className="bg-slate-50 border-b p-4">
                <CardTitle className="text-base font-extrabold text-[#1c3d5a]">
                  অর্ডার সামারি ({cart.length} টি পণ্য)
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Cart Items List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={item.cartItemId || item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                      <img
                        src={item.thumbnail || "/file.svg"}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                        {item.variantName && (
                          <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-1.5 py-0.2 rounded mt-0.5">
                            কালার / ভ্যারিয়েন্ট: {item.variantName}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ৳{(item.discountPrice || item.price)} &times; {item.quantity}
                        </p>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">
                        ৳{(item.discountPrice || item.price) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Apply Box */}
                <div className="border-t border-slate-100 pt-3">
                  <Label className="text-xs font-extrabold text-slate-800 flex items-center gap-1 mb-1.5">
                    <Tag className="h-3.5 w-3.5 text-[#009669]" /> কুপন কোড (যদি থাকে)
                  </Label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                      <span className="font-extrabold text-[#009669]">
                        কুপন: {appliedCoupon.code} (-৳{couponDiscount})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponDiscount(0);
                          setCouponCode("");
                          toast.info("কুপন রিমুভ করা হয়েছে");
                        }}
                        className="text-rose-500 font-bold text-[11px] hover:underline cursor-pointer"
                      >
                        রিমুভ
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="যেমন: BANGLA10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-10 text-xs rounded-xl border-slate-300 uppercase font-semibold"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="h-10 px-4 bg-[#1c3d5a] hover:bg-[#11273c] text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        অ্যাপ্লাই
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>পণ্যের সাবটোটাল:</span>
                    <span className="font-bold text-slate-900">৳{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-bold text-slate-900">৳{shippingCharge}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>কুপন ডিসকাউন্ট:</span>
                      <span>-৳{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2 text-[#1c3d5a]">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-base text-[#009669]">৳{grandTotal}</span>
                  </div>
                </div>

                {/* Cash on Delivery Notice */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> ক্যাশ অন ডেলিভারি (COD)
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-snug">
                    অগ্রিম কোনো টাকা দিতে হবে না। পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানকে টাকা পরিশোধ করুন।
                  </p>
                </div>

                {/* Instant Order Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#009669] hover:bg-[#007f59] text-white font-black text-sm h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#009669]/20 uppercase tracking-wider cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> অর্ডার নিশ্চিত করুন (৳{grandTotal})
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
