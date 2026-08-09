"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Clock, MapPin, CreditCard, Printer, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PENDING_PAYMENT_VERIFICATION: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data?.data?.order);
      })
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
        <p className="text-slate-600 font-bold text-sm">Order not found.</p>
        <Button onClick={() => router.back()} className="rounded-xl">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <h1 className="text-lg sm:text-xl font-black text-slate-900">
            Order #{order.orderNumber}
          </h1>
        </div>

        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            statusColors[order.status] || "bg-slate-100 text-slate-700"
          }`}
        >
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Items Snapshot Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Purchased Items
        </h2>

        <div className="divide-y divide-slate-100">
          {order.orderItems?.map((item: any) => {
            const colorCode = item.colorCode || item.variant?.colorCode;
            const colorName = item.colorName || item.variant?.colorName;
            const variantName = item.variantName || item.variant?.name;
            const itemImg = item.productImage || item.variant?.imageUrl || item.product?.thumbnail;

            return (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={itemImg || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop"}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {item.productName || item.product?.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      {variantName && (
                        <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {colorCode && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border inline-block"
                              style={{ backgroundColor: colorCode }}
                            />
                          )}
                          <span>{variantName}</span>
                        </span>
                      )}
                      <span>Qty: <strong>{item.quantity}</strong></span>
                    </div>
                  </div>
                </div>

                <p className="font-black text-sm text-emerald-700">
                  ৳{item.price * item.quantity}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bill Total */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Delivery ({order.deliveryZone?.zoneName || "Standard"}):</span>
            <span className="font-bold">৳{order.deliveryCharge}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t">
            <span>Total Bill:</span>
            <span className="text-emerald-700">৳{order.grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Timeline Tracking Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Order Timeline & Status Log
        </h2>

        <div className="space-y-3 pl-2 border-l-2 border-emerald-500/30">
          {order.timelineEvents?.map((evt: any) => (
            <div key={evt.id} className="relative pl-4 space-y-0.5">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <p className="text-xs font-bold text-slate-900">{evt.status.replace(/_/g, " ")}</p>
              <p className="text-[11px] text-slate-500">{evt.note || "Status updated."}</p>
              <p className="text-[10px] text-slate-400 font-mono">
                {new Date(evt.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
