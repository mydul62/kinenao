"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, RefreshCw, Loader2, ShoppingBag, ChevronDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  grandTotal: number;
  deliveryCharge: number;
  createdAt: string;
  customer: { email: string; profile?: { fullName?: string } };
  paymentMethod?: { name: string };
  _count?: { orderItems: number };
}

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/orders", { params });
      setOrders(data.data.orders || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
      setTotal(data.data.pagination?.total || 0);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Orders</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search order # or customer..." className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {allStatuses.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <Button variant="outline" onClick={fetchOrders} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <ShoppingBag className="h-10 w-10 mb-2 text-slate-600" />
              <p>No orders found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Order</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Payment</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Total</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Date</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <span className="text-primary font-bold font-mono text-xs">#{order.orderNumber}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium text-xs">{order.customer?.profile?.fullName || order.customer?.email?.split("@")[0]}</p>
                      <p className="text-slate-500 text-[10px]">{order.customer?.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 text-xs">{order.paymentMethod?.name || "—"}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${statusColors[order.status] || "bg-slate-700 text-slate-300 border-slate-600"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold text-xs">৳{order.grandTotal.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/orders/${order.id}`} className="p-1.5 rounded bg-slate-700 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors inline-flex">
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-slate-400 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-slate-700 text-slate-400 hover:text-white bg-slate-800 text-xs">Previous</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="border-slate-700 text-slate-400 hover:text-white bg-slate-800 text-xs">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
