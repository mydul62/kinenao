"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, RefreshCw, Loader2, ShoppingBag, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Customer Orders
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {total} Orders
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Track order fulfillment, payment status, customer details, and invoice records.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order # or customer email..."
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#F8FAFC] border border-[#E5E7EB] text-slate-800 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
          >
            <option value="">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          onClick={fetchOrders}
          size="sm"
          className="border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refresh
        </Button>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <ShoppingBag className="h-12 w-12 mb-3 text-slate-300" />
              <p className="font-bold text-slate-800 text-base">No orders found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try clearing your search or status filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Payment Method</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Grand Total</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#6C5CE7] font-bold font-mono text-xs hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-slate-900 font-bold text-xs md:text-sm">
                        {order.customer?.profile?.fullName || (order as any).guestInfo?.fullName || order.senderNumber || "Guest Customer"}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {order.customer?.email || (order as any).guestInfo?.phone || order.senderNumber || "No Email (COD)"}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {order.paymentMethod?.name || "Cash on Delivery"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          statusColors[order.status] || "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      ৳{order.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#6C5CE7]/10 text-slate-600 hover:text-[#6C5CE7] transition-all inline-flex"
                        title="View order details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E7EB] bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
