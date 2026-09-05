"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Printer,
  Sparkles,
  Layers,
  Phone,
  MessageSquare,
  Truck,
  ShieldCheck,
  Tag,
  FileText,
  Calendar,
  ExternalLink,
  Copy,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-900 border-amber-300",
  PENDING_PAYMENT_VERIFICATION: "bg-orange-100 text-orange-900 border-orange-300",
  CONFIRMED: "bg-emerald-100 text-emerald-900 border-emerald-300",
  PACKED: "bg-blue-100 text-blue-900 border-blue-300",
  SHIPPED: "bg-indigo-100 text-indigo-900 border-indigo-300",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-900 border-sky-300",
  DELIVERED: "bg-emerald-200 text-emerald-950 border-emerald-400 font-extrabold",
  CANCELLED: "bg-rose-100 text-rose-900 border-rose-300",
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PENDING_PAYMENT_VERIFICATION: "Payment Verification Pending",
  CONFIRMED: "Order Confirmed",
  PACKED: "Item Packed",
  SHIPPED: "Shipped out via Courier",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered & Payment Collected",
  CANCELLED: "Order Cancelled",
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

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      if (data.data?.order) {
        setOrder(data.data.order);
        setNewStatus(data.data.order.status);
      }
    } catch (err: any) {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Real-time WebSocket Status Listener for this order
  useEffect(() => {
    const socket = getSocket();

    const handleStatusUpdated = (data: any) => {
      if (data.orderId === id) {
        toast.info(`🔄 Order status changed to ${statusLabels[data.status] || data.status}`);
        fetchOrder();
      }
    };

    socket.on("order_status_updated", handleStatusUpdated);

    return () => {
      socket.off("order_status_updated", handleStatusUpdated);
    };
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/orders/${order.id}/status`, { status: newStatus, note: statusNote });
      toast.success("Order status updated successfully!");
      setStatusNote("");
      await fetchOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyOrderDetails = () => {
    if (!order) return;
    const text = `Order #${order.orderNumber}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nAddress: ${customerAddress}\nGrand Total: ৳${order.grandTotal}`;
    navigator.clipboard.writeText(text);
    toast.success("Order summary copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#0d8a4e]" />
        <p className="text-xs font-bold text-slate-500">Loading Order Records...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-black text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500">The requested order does not exist or was deleted.</p>
        <Button onClick={() => router.push("/admin/orders")} className="bg-[#123524] text-white font-bold rounded-xl text-xs">
          Return to Orders Desk
        </Button>
      </div>
    );
  }

  const customerName =
    order.guestInfo?.fullName || order.customer?.profile?.fullName || "Guest Customer";
  const customerPhone =
    order.guestInfo?.phone || order.guestInfo?.phoneNumber || order.customer?.profile?.phoneNumber || "N/A";
  const customerAddress =
    order.guestInfo?.street || order.deliveryAddress?.street || "Address provided at checkout";

  const isCOD =
    order.paymentMethod?.accountType === "COD" ||
    order.paymentMethod?.name?.toLowerCase().includes("cash") ||
    order.paymentMethod?.name?.toLowerCase().includes("ক্যাশ") ||
    !order.transactionId;

  const hasFreeDelivery =
    order.deliveryCharge === 0 ||
    order.orderItems?.some((item: any) => item.product?.isFreeDelivery || item.isFreeDelivery);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif] print:p-0 print:max-w-none">
      {/* 1. TOP HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/orders")}
            className="rounded-xl hover:bg-slate-100 text-slate-700 font-bold"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Orders
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`px-3 py-1 text-xs font-black rounded-full border shadow-2xs ${
                  statusColors[order.status] || "bg-slate-100 text-slate-800 border-slate-300"
                }`}
              >
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 inline" />
              <span>
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={copyOrderDetails}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 cursor-pointer"
          >
            <Copy className="h-4 w-4 mr-1.5" /> Copy Details
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="rounded-xl bg-[#123524] hover:bg-[#1B4A34] text-white font-bold text-xs h-10 shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4 mr-1.5" /> Print Invoice
          </Button>
        </div>
      </div>

      {/* 2. THREE SUMMARY CARDS (CUSTOMER, DELIVERY, PAYMENT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer Information Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Customer Info</span>
            </div>
            <BadgeCheck className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-sm font-black text-slate-900">{customerName}</p>
            <p className="font-mono text-slate-700 font-bold flex items-center gap-1.5">
              📞 <span>{customerPhone}</span>
            </p>
            {order.customer?.email && (
              <p className="text-slate-500 font-medium truncate">{order.customer.email}</p>
            )}

            {/* Quick Call & WhatsApp Action Buttons */}
            {customerPhone !== "N/A" && (
              <div className="pt-2 flex items-center gap-2 print:hidden">
                <a
                  href={`tel:${customerPhone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/88${customerPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 font-extrabold text-[11px] border border-green-200 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-green-600" /> WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Delivery & Address Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Delivery Details</span>
            </div>
            {hasFreeDelivery ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                🚚 ফ্রি ডেলিভারি
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500">
                ৳{order.deliveryCharge} Shipping
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400">Delivery Zone:</p>
              <p className="font-extrabold text-slate-800">
                {order.deliveryZone?.zoneName || "Standard Shipping Zone"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400">Full Shipping Address:</p>
              <p className="font-medium text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                {customerAddress}
              </p>
            </div>

            {order.guestInfo?.orderNotes && (
              <div className="pt-1">
                <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-600" /> Order Note:
                </p>
                <p className="text-slate-700 italic text-[11px] bg-amber-50/70 p-2 rounded-xl border border-amber-200 mt-0.5">
                  "{order.guestInfo.orderNotes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Payment Details</span>
            </div>
            <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {isCOD ? "COD" : "Digital"}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400">Selected Method:</p>
              <p className="font-extrabold text-slate-900">
                {order.paymentMethod?.name || (isCOD ? "Cash on Delivery (ক্যাশ অন ডেলিভারি)" : "Manual Payment")}
              </p>
            </div>

            {order.senderNumber && (
              <div>
                <p className="text-[11px] font-bold text-slate-400">Sender Number:</p>
                <p className="font-mono font-bold text-slate-800">{order.senderNumber}</p>
              </div>
            )}

            {order.transactionId && (
              <div>
                <p className="text-[11px] font-bold text-slate-400">Transaction ID (TrxID):</p>
                <p className="font-mono font-bold text-emerald-700">{order.transactionId}</p>
              </div>
            )}

            {order.paymentScreenshotUrl && (
              <div className="pt-1">
                <p className="text-[11px] font-bold text-slate-400 mb-1">Payment Proof Image:</p>
                <a
                  href={order.paymentScreenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block relative group rounded-xl overflow-hidden border border-slate-200"
                >
                  <img
                    src={order.paymentScreenshotUrl}
                    alt="Proof"
                    className="w-20 h-20 object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute inset-0 bg-black/40 text-white font-bold text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: ORDER ITEMS TABLE & LIFECYCLE CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT (8 COLS): PURCHASED ITEMS TABLE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Purchased Items ({order.orderItems?.length || 0})</span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Subtotal: ৳{order.orderItems?.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)}
              </span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-slate-100">
              {order.orderItems?.map((item: any) => {
                const colorCode = item.colorCode || item.variant?.colorCode;
                const colorName = item.colorName || item.variant?.colorName;
                const variantName = item.variantName || item.variant?.name;
                const itemImg = item.productImage || item.variant?.imageUrl || item.product?.thumbnail;
                const itemIsFreeDelivery = item.product?.isFreeDelivery || item.isFreeDelivery;

                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={
                          itemImg ||
                          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop"
                        }
                        alt={item.productName || item.product?.name || "Product"}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {item.productName || item.product?.name}
                          </p>
                          {itemIsFreeDelivery && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-300 shrink-0">
                              🚚 ফ্রি ডেলিভারি
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                          {variantName && (
                            <span className="flex items-center gap-1 font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                              {colorCode && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border inline-block"
                                  style={{ backgroundColor: colorCode }}
                                />
                              )}
                              <span>{variantName}</span>
                            </span>
                          )}
                          <span className="font-mono">SKU: {item.productSku || item.product?.sku || "N/A"}</span>
                          <span>• Qty: <strong className="text-slate-900 font-black">{item.quantity}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-['Manrope',sans-serif]">
                      <p className="font-black text-sm text-emerald-700">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">৳{item.price} each</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-['Inter',sans-serif]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-800">
                  ৳{order.orderItems?.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge ({order.deliveryZone?.zoneName || "Standard Zone"}):</span>
                <span className="font-bold text-slate-800">
                  {hasFreeDelivery ? <strong className="text-emerald-700">৳0 (ফ্রি!)</strong> : `৳${order.deliveryCharge}`}
                </span>
              </div>

              <div className="flex justify-between font-black text-base text-slate-900 pt-3 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-emerald-700 text-lg font-['Manrope']">৳{order.grandTotal?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (4 COLS): LIFECYCLE MANAGEMENT & TIMELINE */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Update Control Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 print:hidden">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Update Order Lifecycle</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Change Status:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {allStatuses.map((st) => (
                    <option key={st} value={st}>
                      {statusLabels[st] || st.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Status Note / Memo (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shipped via Steadfast Courier Trx #9201"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <Button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updatingStatus || newStatus === order.status}
                className="w-full bg-[#123524] hover:bg-[#1B4A34] text-white rounded-xl text-xs font-bold h-11 shadow-xs cursor-pointer"
              >
                {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Status Change"}
              </Button>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Order Fulfillment Timeline</span>
            </div>

            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {order.timelineEvents && order.timelineEvents.length > 0 ? (
                order.timelineEvents.map((evt: any, idx: number) => (
                  <div key={evt.id || idx} className="relative text-xs">
                    <div className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
                    <p className="font-extrabold text-slate-900">
                      {statusLabels[evt.status] || evt.status}
                    </p>
                    {evt.note && <p className="text-slate-600 text-[11px] mt-0.5">{evt.note}</p>}
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(evt.timestamp || evt.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="relative text-xs">
                  <div className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
                  <p className="font-extrabold text-slate-900">
                    {statusLabels[order.status] || order.status}
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Order recorded in system</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
