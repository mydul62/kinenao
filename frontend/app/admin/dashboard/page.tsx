"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  href?: string;
  change?: string;
  changeUp?: boolean;
}

function StatCard({ title, value, icon: Icon, color, bgColor, href, change, changeUp }: StatCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-black text-white">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${changeUp ? "text-emerald-400" : "text-red-400"}`}>
              {changeUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {change}
            </div>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-xl`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      {href && (
        <Link href={href} className="mt-3 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
          View all →
        </Link>
      )}
    </div>
  );
}

interface RecentOrder {
  id: string;
  orderNumber: number;
  status: string;
  grandTotal: number;
  createdAt: string;
  customer: { email: string; profile?: { fullName?: string } };
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-400",
  PENDING_PAYMENT_VERIFICATION: "bg-orange-500/10 text-orange-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  PACKED: "bg-indigo-500/10 text-indigo-400",
  SHIPPED: "bg-purple-500/10 text-purple-400",
  OUT_FOR_DELIVERY: "bg-cyan-500/10 text-cyan-400",
  DELIVERED: "bg-emerald-500/10 text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, alertsRes] = await Promise.allSettled([
          api.get("/dashboard/metrics"),
          api.get("/orders?limit=8&sort=createdAt&order=desc"),
          api.get("/inventory/alerts?threshold=10"),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        if (ordersRes.status === "fulfilled") setRecentOrders(ordersRes.value.data.data.orders || []);
        if (alertsRes.status === "fulfilled") setLowStockAlerts(alertsRes.value.data.data.alerts || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time metrics and business performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`৳${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          change="This month"
          changeUp
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          href="/admin/orders"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={Users}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
          href="/admin/customers"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
          href="/admin/orders?status=PENDING_PAYMENT"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Payments"
          value={stats?.pendingPayments || 0}
          icon={CreditCard}
          color="text-orange-400"
          bgColor="bg-orange-500/10"
          href="/admin/payments"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockAlerts.length}
          icon={AlertTriangle}
          color="text-red-400"
          bgColor="bg-red-500/10"
          href="/admin/inventory"
        />
        <StatCard
          title="Delivered Orders"
          value={stats?.deliveredOrders || 0}
          icon={CheckCircle}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-700">
            <h2 className="font-bold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:text-primary/80 font-medium">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No orders yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Order</th>
                    <th className="text-left p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Customer</th>
                    <th className="text-left p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right p-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline font-mono text-xs font-bold">
                          #{order.orderNumber}
                        </Link>
                        <p className="text-slate-500 text-[10px] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium text-xs">
                          {order.customer?.profile?.fullName || order.customer?.email?.split("@")[0]}
                        </p>
                        <p className="text-slate-500 text-[10px]">{order.customer?.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status] || "bg-slate-700 text-slate-300"}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white font-bold text-xs">৳{order.grandTotal.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-700">
            <h2 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Low Stock
            </h2>
            <Link href="/admin/inventory" className="text-xs text-primary hover:text-primary/80 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-700/50">
            {lowStockAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">All products well stocked</p>
              </div>
            ) : (
              lowStockAlerts.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-slate-700/30 transition-colors">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    <p className="text-slate-500 text-[10px]">{item.category?.name}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.stockQty === 0 ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                    {item.stockQty === 0 ? "Out" : item.stockQty}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
