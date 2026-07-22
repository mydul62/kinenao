"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Package, User, MapPin, CreditCard, Clock, CheckCircle, Truck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PENDING_PAYMENT_VERIFICATION: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PACKED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  SHIPPED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  OUT_FOR_DELIVERY: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const allStatuses = ["PENDING_PAYMENT", "PENDING_PAYMENT_VERIFICATION", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    api.get(`/orders/${id}`)
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
      toast.success("Order status updated");
      setStatusNote("");
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data.order);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Order not found</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white">Order #{order.orderNumber}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || ""}`}>
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/orders/${order.id}/invoice`)} className="bg-primary hover:bg-primary/90 text-white">
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Items + Timeline */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Order Items
              </h2>
            </div>
            <div className="divide-y divide-slate-700/50">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  {item.product?.thumbnail ? (
                    <img src={item.product.thumbnail} alt={item.product.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-700 rounded flex-shrink-0 flex items-center justify-center">
                      <Package className="h-5 w-5 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{item.product?.name}</p>
                    <p className="text-slate-500 text-xs">Qty: {item.quantity} × ৳{item.price}</p>
                  </div>
                  <span className="text-white font-bold text-sm">৳{(item.quantity * item.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-700 space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span>৳{(order.grandTotal - order.deliveryCharge).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Delivery</span>
                <span>৳{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t border-slate-700 pt-2">
                <span>Grand Total</span>
                <span>৳{order.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          {order.timelineEvents?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Order Timeline
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {order.timelineEvents.map((event: any, i: number) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${i === order.timelineEvents.length - 1 ? "bg-primary" : "bg-slate-600"}`} />
                      {i < order.timelineEvents.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`text-xs font-bold ${i === order.timelineEvents.length - 1 ? "text-primary" : "text-slate-300"}`}>{event.status.replace(/_/g, " ")}</p>
                      {event.note && <p className="text-slate-500 text-xs mt-0.5">{event.note}</p>}
                      <p className="text-slate-600 text-[10px] mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Update Status + Info */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" /> Update Status
            </h2>
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
              >
                {allStatuses.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
              <textarea
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="Optional note..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 text-sm resize-none placeholder:text-slate-500"
              />
              <Button onClick={handleStatusUpdate} disabled={updatingStatus || newStatus === order.status} className="w-full bg-primary hover:bg-primary/90">
                {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Status
              </Button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Customer
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">{order.customer?.profile?.fullName || "N/A"}</p>
              <p className="text-slate-400">{order.customer?.email}</p>
              <p className="text-slate-400">{order.customer?.profile?.phoneNumber || "No phone"}</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Delivery
            </h2>
            {order.deliveryAddress ? (
              <div className="space-y-1 text-sm text-slate-400">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.area}, {order.deliveryAddress.city}</p>
                {order.deliveryAddress.postalCode && <p>ZIP: {order.deliveryAddress.postalCode}</p>}
              </div>
            ) : <p className="text-slate-500 text-sm">No delivery address</p>}
            {order.deliveryZone && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-400">Zone: <span className="text-white">{order.deliveryZone.zoneName}</span></p>
                <p className="text-xs text-slate-400">ETA: <span className="text-white">{order.deliveryZone.estDeliveryTime}</span></p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Method</span>
                <span className="text-white">{order.paymentMethod?.name || "—"}</span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Txn ID</span>
                  <span className="text-white font-mono text-xs">{order.transactionId}</span>
                </div>
              )}
              {order.senderNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender</span>
                  <span className="text-white">{order.senderNumber}</span>
                </div>
              )}
              {order.paidAmount && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Paid</span>
                  <span className="text-emerald-400 font-bold">৳{order.paidAmount}</span>
                </div>
              )}
              {order.paymentScreenshotUrl && (
                <a href={order.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline block mt-2">
                  View Payment Screenshot →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
