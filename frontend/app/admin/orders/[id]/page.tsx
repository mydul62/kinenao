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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-700 border-amber-200",
  PENDING_PAYMENT_VERIFICATION: "bg-orange-100 text-orange-700 border-orange-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PACKED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-700 border-sky-200",
  DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
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
        <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-white border border-[#E5E7EB] rounded-[24px]">
        <p className="text-slate-500 text-sm">Order record not found</p>
        <Button onClick={() => router.back()} className="mt-4 bg-[#6C5CE7] text-white">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:max-w-none print:p-0 print:m-0">
      {/* Top Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-slate-600 hover:text-[#6C5CE7] transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  statusColors[order.status] || "bg-slate-100 text-slate-700"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <Button
          onClick={handlePrint}
          className="bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#6C5CE7]/20"
        >
          <Printer className="h-4 w-4 mr-2" /> Print Official Invoice
        </Button>
      </div>

      {/* -------------------------------------------------------- */}
      {/* PRINTABLE INVOICE HEADER FOR PRINT MODE & DISPLAY */}
      {/* -------------------------------------------------------- */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#8B5CF6] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-[#6C5CE7]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">eBazar Store</h2>
              <p className="text-xs text-slate-500">Official E-Commerce Invoice</p>
            </div>
          </div>

          <div className="text-right">
            <h3 className="font-extrabold text-slate-900 text-lg">INVOICE #{order.orderNumber}</h3>
            <p className="text-xs text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-slate-500 font-mono">ID: {order.id}</p>
          </div>
        </div>

        {/* Customer & Address Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-[#F8FAFC] border border-[#E5E7EB] p-5 rounded-2xl">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Customer Details</span>
            <p className="text-slate-900 font-extrabold text-sm mt-1">
              {order.customer?.profile?.fullName || (order.guestInfo as any)?.fullName || order.senderNumber || "Guest Customer"}
            </p>
            <p className="text-slate-600 mt-0.5">{order.customer?.email || (order.guestInfo as any)?.email || "No Email (Cash on Delivery)"}</p>
            <p className="text-slate-600 font-bold mt-0.5">
              Phone: {order.customer?.profile?.phoneNumber || (order.guestInfo as any)?.phone || order.senderNumber || "N/A"}
            </p>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Shipping Address</span>
            {order.deliveryAddress ? (
              <div className="text-slate-800 font-medium mt-1 space-y-0.5">
                <p>{order.deliveryAddress.street}</p>
                <p>
                  {order.deliveryAddress.area}, {order.deliveryAddress.city}
                </p>
                {order.deliveryAddress.postalCode && <p>ZIP: {order.deliveryAddress.postalCode}</p>}
              </div>
            ) : order.guestInfo ? (
              <div className="text-slate-800 font-medium mt-1 space-y-0.5">
                <p className="font-bold text-slate-900">{(order.guestInfo as any).street}</p>
                <p>{(order.guestInfo as any).city || "ঢাকা"}, Bangladesh</p>
                {(order.guestInfo as any).orderNotes && (
                  <p className="text-amber-700 italic text-[11px] pt-1">
                    Note: {(order.guestInfo as any).orderNotes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 mt-1">Standard Delivery</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E5E7EB] text-slate-500 uppercase text-[11px] font-bold">
                <th className="py-3.5 px-4">Item Description</th>
                <th className="py-3.5 px-4 text-center">Unit Price</th>
                <th className="py-3.5 px-4 text-center">Quantity</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {order.orderItems?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900">{item.product?.name}</p>
                    <p className="text-slate-400 text-[10px] font-mono">SKU: {item.product?.sku || "N/A"}</p>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-700 font-medium">৳{item.price.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center text-slate-900 font-bold">{item.quantity}</td>
                  <td className="py-4 px-4 text-right font-extrabold text-slate-900">
                    ৳{(item.quantity * item.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">
                ৳{(order.grandTotal - order.deliveryCharge).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-900">৳{order.deliveryCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-[#E5E7EB]">
              <span>Grand Total</span>
              <span className="text-[#6C5CE7]">৳{order.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Controls (Hidden on print) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        {/* Status Update Control */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <CheckCircle className="h-5 w-5 text-[#6C5CE7]" /> Update Order Status
          </h2>
          <div className="space-y-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] text-slate-900 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold focus:outline-none"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Optional status update note..."
              rows={2}
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] text-slate-900 rounded-xl p-3 text-xs resize-none"
            />
            <Button
              onClick={handleStatusUpdate}
              disabled={updatingStatus || newStatus === order.status}
              className="w-full bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white text-xs font-semibold rounded-xl"
            >
              {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save New Order Status
            </Button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <CreditCard className="h-5 w-5 text-[#6C5CE7]" /> Payment Gateway Records
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
              <span className="text-slate-500 font-medium">Gateway</span>
              <span className="text-slate-900 font-bold">{order.paymentMethod?.name || "bKash / COD"}</span>
            </div>
            {order.transactionId && (
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-slate-500 font-medium">TrxID</span>
                <span className="text-[#6C5CE7] font-mono font-bold">{order.transactionId}</span>
              </div>
            )}
            {order.senderNumber && (
              <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-slate-500 font-medium">Sender Number</span>
                <span className="text-slate-900 font-mono font-bold">{order.senderNumber}</span>
              </div>
            )}
            {order.paidAmount && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Verified Paid</span>
                <span className="text-emerald-600 font-extrabold">৳{order.paidAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
