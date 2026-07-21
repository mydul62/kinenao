"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ShoppingBag, Clock, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  PENDING_PAYMENT_VERIFICATION: "bg-orange-100 text-orange-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", { params: { page, limit: 10 } });
      setOrders(data.data.orders || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
    } catch { toast.error("Failed to load orders"); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-slate-800">My Orders</h1>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No orders yet</p>
          <Link href="/shop" className="mt-4 inline-block text-primary text-sm font-semibold hover:underline">Start Shopping →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-slate-800 text-sm">Order #{order.orderNumber}</span>
                  <p className="text-slate-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-slate-100 text-slate-600"}`}>
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {order.orderItems?.slice(0, 4).map((item: any) => (
                  item.product?.thumbnail && (
                    <img key={item.id} src={item.product.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                  )
                ))}
                {order.orderItems?.length > 4 && (
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-500 font-bold">
                    +{order.orderItems.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-black">৳{order.grandTotal.toLocaleString()}</span>
                <Link href={`/dashboard/orders/${order.id}`} className="flex items-center gap-1 text-primary text-xs font-semibold hover:underline">
                  View Details <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Previous</button>
          <span className="text-slate-500 text-sm">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
