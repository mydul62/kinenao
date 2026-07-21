"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Heart, MapPin, Bell, ChevronRight, Clock } from "lucide-react";
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
          setStats(s => ({ ...s, orders: ordersRes.value.data.data.pagination?.total || orders.length }));
        }
        if (wishlistRes.status === "fulfilled")
          setStats(s => ({ ...s, wishlist: wishlistRes.value.data.data.wishlist?.length || 0 }));
        if (addressesRes.status === "fulfilled")
          setStats(s => ({ ...s, addresses: addressesRes.value.data.data.addresses?.length || 0 }));
        if (notifsRes.status === "fulfilled")
          setStats(s => ({ ...s, unread: notifsRes.value.data.data.unreadCount || 0 }));
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <p className="text-white/80 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-black mt-1">{firstName} 👋</h1>
        <p className="text-white/70 text-sm mt-1">Here's a summary of your account activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.orders, icon: ShoppingBag, href: "/dashboard/orders", color: "text-blue-600 bg-blue-50" },
          { label: "Wishlist", value: stats.wishlist, icon: Heart, href: "/dashboard/wishlist", color: "text-red-500 bg-red-50" },
          { label: "Addresses", value: stats.addresses, icon: MapPin, href: "/dashboard/addresses", color: "text-emerald-600 bg-emerald-50" },
          { label: "Unread", value: stats.unread, icon: Bell, href: "/dashboard/notifications", color: "text-orange-500 bg-orange-50" },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-slate-800">{loading ? "—" : value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Orders
          </h2>
          <Link href="/dashboard/orders" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No orders yet</p>
            <Link href="/shop" className="mt-2 inline-block text-primary text-sm font-semibold hover:underline">Shop Now →</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Order #{order.orderNumber}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order.orderItems?.length || 0} item(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[order.status] || "bg-slate-100 text-slate-600"}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <span className="font-black text-slate-800 text-sm">৳{order.grandTotal.toLocaleString()}</span>
                  <Link href={`/dashboard/orders/${order.id}`} className="text-slate-400 hover:text-primary transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
