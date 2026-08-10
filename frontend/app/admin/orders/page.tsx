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
  PENDING_PAYMENT: "bg-[#FBEEE0] text-[#B5601A]",
  PENDING_PAYMENT_VERIFICATION: "bg-[#FBEEE0] text-[#B5601A]",
  CONFIRMED: "bg-[#E4EEE7] text-[#123524]",
  PACKED: "bg-[#E4EEE7] text-[#123524]",
  SHIPPED: "bg-[#E4EEE7] text-[#123524]",
  OUT_FOR_DELIVERY: "bg-[#E4EEE7] text-[#123524]",
  DELIVERED: "bg-[#E6F5EB] text-[#1F8A4C]",
  CANCELLED: "bg-[#FBEAEA] text-[#C23B3B]",
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

  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const pendingCount = orders.filter((o) => o.status.includes("PENDING")).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const revenueStr = totalRevenue >= 100000 ? `৳${(totalRevenue / 100000).toFixed(1)}L` : `৳${totalRevenue.toLocaleString()}`;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Customer Orders
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {total || orders.length} orders
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Track order fulfillment, payment status, customer details, and invoice records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchOrders}
            size="sm"
            className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#5C685F]" />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Orders</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {total || orders.length}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>↑</span> Active pipeline
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Delivered</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {deliveredCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Fulfilled successfully
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Pending</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50 font-black text-xs">
              ▲
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {pendingCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Requires processing
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Volume Value</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7] font-bold text-xs font-['Manrope']">
              ৳
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {revenueStr}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Total transaction total
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E4E8E4] shadow-xs">
        <div className="flex items-center gap-2 bg-[#F5F7F5] px-3.5 py-2 rounded-xl border border-[#E4E8E4] w-full sm:flex-1">
          <Search className="w-4 h-4 text-[#8B958D] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order # or customer email..."
            className="w-full text-xs text-[#131914] placeholder:text-[#8B958D] bg-transparent border-0 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-[#8B958D] hover:text-[#131914] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 px-3 bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl text-xs font-semibold text-[#131914] focus:outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="">All statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Orders Table Container */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-[#5C685F]">
              <ShoppingBag className="h-12 w-12 mb-3 text-[#8B958D]" />
              <p className="font-bold text-[#131914] text-base">No orders found</p>
              <p className="text-xs text-[#5C685F] mt-1">
                Try clearing your search or status filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E8E4] bg-[#F1F6F2] text-[#5C685F] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">ORDER</th>
                  <th className="py-3 px-4">CUSTOMER</th>
                  <th className="py-3 px-4">PAYMENT METHOD</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">GRAND TOTAL</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8E4]/60 font-medium text-[#131914]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F1F6F2]/70 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#123524] font-extrabold font-mono text-xs hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-[#131914] font-bold text-xs">
                        {order.customer?.profile?.fullName || (order as any).guestInfo?.fullName || (order as any).senderNumber || "Customer"}
                      </p>
                      <p className="text-[#8B958D] text-[10px] mt-0.5">
                        {order.customer?.email || (order as any).guestInfo?.phone || (order as any).senderNumber || "COD"}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-[#5C685F]">
                      <span className="bg-[#F5F7F5] border border-[#E4E8E4] px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-[#131914]">
                        {order.paymentMethod?.name || "Cash on Delivery"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          statusColors[order.status] || "bg-[#F5F7F5] text-[#5C685F]"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#131914] font-['Manrope']">
                      ৳{order.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[#5C685F] text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#123524] hover:bg-[#F1F6F2] transition-colors inline-flex"
                        title="View order details"
                      >
                        <Eye className="h-3.5 w-3.5" />
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
          <div className="px-5 py-3 border-t border-[#E4E8E4] bg-[#F5F7F5]/50 flex items-center justify-between text-xs text-[#5C685F]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl h-8 px-3 text-xs border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl h-8 px-3 text-xs border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] cursor-pointer"
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
