"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Printer,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800 border-amber-200",
  PENDING_PAYMENT_VERIFICATION: "bg-orange-100 text-orange-800 border-orange-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PACKED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-800 border-sky-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
};

const allStatuses = [
  "PENDING_PAYMENT",
  "PENDING_PAYMENT_VERIFICATION",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => {
        setOrder(data.data.order);
        setNewStatus(data.data.order.status);
      })
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/orders/${order.id}/status`, { status: newStatus, note: statusNote });
      toast.success("Order status updated successfully");
      setStatusNote("");
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data.order);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-[24px]">
        <p className="text-slate-500 text-sm">Order record not found</p>
        <Button onClick={() => router.back()} className="mt-4 bg-emerald-600 text-white">
          Go Back
        </Button>
      </div>
    );
  }

  const isCOD =
    order.paymentMethod?.accountType === "COD" ||
    order.paymentMethod?.name?.toLowerCase().includes("cash") ||
    !order.transactionId;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 print:p-0 print:max-w-none">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl border-slate-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="rounded-xl border-slate-200 text-xs font-bold"
          >
            <Printer className="h-4 w-4 mr-1.5" /> Print Invoice
          </Button>
          <span
            className={`px-3 py-1 text-xs font-black rounded-full border ${
              statusColors[order.status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Main Order Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items Snapshot & Payment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Purchased Items Snapshot
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
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {item.productName || item.product?.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
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
                          <span>SKU: {item.productSku || item.product?.sku}</span>
                          <span>• Qty: <strong className="text-slate-800">{item.quantity}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-xs sm:text-sm text-emerald-700">
                        ৳{item.price * item.quantity}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">৳{item.price} each</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-800">
                  ৳{order.orderItems?.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge ({order.deliveryZone?.zoneName || "Standard"}):</span>
                <span className="font-bold text-slate-800">৳{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t">
                <span>Grand Total:</span>
                <span className="text-emerald-700">৳{order.grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-slate-400 font-bold">Payment Method</p>
                <p className="font-black text-slate-900">
                  {order.paymentMethod?.name || (isCOD ? "Cash on Delivery" : "Manual Payment")}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-slate-400 font-bold">Payment Status</p>
                <p className="font-black text-slate-900">
                  {isCOD ? "Pay on Delivery (COD)" : order.transactionId ? "Proof Submitted" : "Pending"}
                </p>
              </div>

              {order.senderNumber && (
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-slate-400 font-bold">Sender Number</p>
                  <p className="font-mono font-bold text-slate-900">{order.senderNumber}</p>
                </div>
              )}

              {order.transactionId && (
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-slate-400 font-bold">Transaction ID (TrxID)</p>
                  <p className="font-mono font-bold text-emerald-700">{order.transactionId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Customer, Address & Status Lifecycle */}
        <div className="space-y-6">
          {/* Customer & Address Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Customer Information</span>
            </h2>

            <div className="text-xs space-y-2">
              <p className="font-extrabold text-sm text-slate-900">
                {order.guestInfo?.fullName || order.customer?.profile?.fullName || "Guest Customer"}
              </p>
              <p className="text-slate-600 font-mono">
                📞 {order.guestInfo?.phoneNumber || order.customer?.profile?.phoneNumber || "N/A"}
              </p>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-400 font-bold mb-0.5">Delivery Address:</p>
                <p className="text-slate-800 leading-relaxed">
                  {order.guestInfo?.street || order.deliveryAddress?.street || "Address provided at checkout"}
                </p>
              </div>
            </div>
          </div>

          {/* Status Update Controls (Admin only) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 print:hidden">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Update Order Lifecycle</span>
            </h2>

            <div className="space-y-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {allStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Optional status note..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white"
              />

              <Button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updatingStatus || newStatus === order.status}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10"
              >
                {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Status"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
