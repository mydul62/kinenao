"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Bell,
  ChevronRight,
  Clock,
  Sparkles,
  PackageCheck,
  CreditCard,
  User,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

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

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0, unread: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, wishlistRes, addressesRes, notifsRes] = await Promise.allSettled([
          api.get("/orders?limit=5"),
          api.get("/wishlist"),
          api.get("/addresses"),
          api.get("/notifications"),
        ]);

        if (ordersRes.status === "fulfilled") {
          const orders = ordersRes.value.data.data.orders || [];
          setRecentOrders(orders);
          setStats((s) => ({ ...s, orders: ordersRes.value.data.data.pagination?.total || orders.length }));
        }
        if (wishlistRes.status === "fulfilled")
          setStats((s) => ({ ...s, wishlist: wishlistRes.value.data.data.wishlist?.length || 0 }));
        if (addressesRes.status === "fulfilled")
          setStats((s) => ({ ...s, addresses: addressesRes.value.data.data.addresses?.length || 0 }));
        if (notifsRes.status === "fulfilled")
          setStats((s) => ({ ...s, unread: notifsRes.value.data.data.unreadCount || 0 }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const firstName = user?.profile?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Customer";

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* ---------------------------------------------------- */}
      {/* HERO BANNER (Purple Gradient SaaS Style) */}
      {/* ---------------------------------------------------- */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#6C5CE7] via-[#7C4DFF] to-[#8B5CF6] rounded-[24px] p-6 md:p-8 text-white shadow-xl shadow-[#6C5CE7]/20 border border-white/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-purple-100 mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>Customer Account Portal</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-purple-100 text-xs md:text-sm mt-1.5 max-w-xl">
              Track your authentic skincare & cosmetic orders, manage saved shipping addresses, and check special member vouchers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-white text-[#6C5CE7] hover:bg-slate-50 font-bold text-xs md:text-sm rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              Browse Shop →
            </Link>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* STAT CARDS (Soft Gradients & 20px Rounded Corners) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Total Orders */}
        <Link
          href="/dashboard/orders"
          className="bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-white border border-sky-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{loading ? "—" : stats.orders}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#38BDF8] text-white flex items-center justify-center shadow-md shadow-sky-500/30 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sky-700 text-xs font-medium mt-3 flex items-center gap-1">
            View all orders <ChevronRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Card 2: Wishlist */}
        <Link
          href="/dashboard/wishlist"
          className="bg-gradient-to-br from-rose-500/10 via-red-500/5 to-white border border-rose-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Wishlist Items</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{loading ? "—" : stats.wishlist}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-rose-700 text-xs font-medium mt-3 flex items-center gap-1">
            Saved favorites <ChevronRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Card 3: Saved Addresses */}
        <Link
          href="/dashboard/addresses"
          className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Addresses</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{loading ? "—" : stats.addresses}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <p className="text-emerald-700 text-xs font-medium mt-3 flex items-center gap-1">
            Delivery addresses <ChevronRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Card 4: Unread Notifications */}
        <Link
          href="/dashboard/notifications"
          className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white border border-amber-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Unread Alerts</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{loading ? "—" : stats.unread}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <p className="text-amber-700 text-xs font-medium mt-3 flex items-center gap-1">
            Account notifications <ChevronRight className="w-3 h-3" />
          </p>
        </Link>
      </div>

      {/* ---------------------------------------------------- */}
      {/* RECENT ORDERS TABLE */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] bg-slate-50/50">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#6C5CE7]" /> Recent Purchases
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest orders and shipment progress</p>
          </div>
          <Link href="/dashboard/orders" className="text-xs text-[#6C5CE7] font-bold hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading your purchases...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold text-base">No orders yet</p>
            <p className="text-slate-400 text-xs mt-1 mb-4">Start exploring our authentic skincare & cosmetic products!</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C5CE7] text-white text-xs font-bold rounded-xl shadow-md shadow-[#6C5CE7]/30 hover:opacity-95 transition-all"
            >
              Shop Now →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-100/60 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="p-4 pl-6">Order Number</th>
                  <th className="p-4">Date & Items</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4 text-right pr-6">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <Link href={`/dashboard/orders/${order.id}`} className="text-[#6C5CE7] hover:underline font-mono text-xs font-bold">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-900 font-bold text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-slate-400 text-[10px]">{order.orderItems?.length || 0} item(s)</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColors[order.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <span className="text-slate-900 font-extrabold text-xs">৳{order.grandTotal.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
