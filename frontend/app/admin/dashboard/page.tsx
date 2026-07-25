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
  Package,
  ArrowUpRight,
  Loader2,
  DollarSign,
  Download,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

const CATEGORY_COLORS = ["#6C5CE7", "#8B5CF6", "#38BDF8", "#22C55E", "#FACC15", "#EF4444"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"Today" | "Week" | "Month" | "Year">("Month");

  const loadAllDashboardData = async () => {
    try {
      const [statsRes, chartsRes, ordersRes, alertsRes] = await Promise.allSettled([
        api.get("/dashboard/metrics"),
        api.get("/dashboard/charts"),
        api.get("/orders?limit=8&sort=createdAt&order=desc"),
        api.get("/inventory/alerts?threshold=10"),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
      if (chartsRes.status === "fulfilled") setCharts(chartsRes.value.data.data);
      if (ordersRes.status === "fulfilled") setRecentOrders(ordersRes.value.data.data.orders || []);
      if (alertsRes.status === "fulfilled") setLowStockAlerts(alertsRes.value.data.data.alerts || []);
    } catch (err) {
      console.error("Failed to load live dashboard metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
      </div>
    );
  }

  // Live Metrics
  const revenueVal = stats?.totalRevenue || 0;
  const ordersVal = stats?.totalOrders || 0;
  const customersVal = stats?.totalCustomers || 0;
  const pendingOrdersVal = stats?.pendingOrders || 0;
  const pendingPaymentsVal = stats?.pendingPayments || 0;
  const lowStockCountVal = stats?.lowStockCount || lowStockAlerts.length;

  // Live Chart Data from Backend
  const monthlySales = charts?.monthlySales || [];
  const categorySales = (charts?.categorySales || []).map((cat: any, idx: number) => ({
    name: cat.category,
    value: cat.value,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              E-Commerce Store Dashboard
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              Live Database Connected
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Real-time analytics directly synchronized with your PostgreSQL database.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] text-slate-700 text-xs font-semibold rounded-2xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#6C5CE7] ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync Metrics</span>
          </button>

          <div className="bg-white border border-[#E5E7EB] p-1 rounded-2xl shadow-sm hidden sm:flex items-center gap-1">
            {(["Today", "Week", "Month", "Year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  timeRange === range
                    ? "bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white shadow-md shadow-[#6C5CE7]/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. DYNAMIC TOP STAT CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">৳{revenueVal.toLocaleString()}</h2>
              </div>
              <p className="text-slate-500 text-xs mt-1">Confirmed & Delivered sales</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>Verified Payments</span>
            <span className="font-bold">Live Synced</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-white border border-sky-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{ordersVal.toLocaleString()}</h2>
              </div>
              <p className="text-slate-500 text-xs mt-1">All customer orders</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#38BDF8] text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-sky-700 font-medium">
            <span>Database Records</span>
            <span className="font-bold">{ordersVal} Items</span>
          </div>
        </div>

        {/* Card 3: Active Customers */}
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white border border-purple-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Registered Customers
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{customersVal.toLocaleString()}</h2>
              </div>
              <p className="text-slate-500 text-xs mt-1">Verified user accounts</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs text-purple-700 font-medium">
            <span>Customer Portal</span>
            <span className="font-bold">Active</span>
          </div>
        </div>

        {/* Card 4: Actionable Pending Orders */}
        <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white border border-amber-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Pending Orders
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pendingOrdersVal}</h2>
              </div>
              <p className="text-slate-500 text-xs mt-1">Awaiting packing / shipping</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-700 font-medium">
            <span>Payment Verifications</span>
            <span className="font-bold">{pendingPaymentsVal} Queue</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. DYNAMIC RECHARTS (Monthly Sales & Category Breakdown) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Area Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Live Monthly Sales Revenue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Database aggregated monthly revenue totals</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-3 h-3 rounded-full bg-[#6C5CE7]" />
              <span className="text-slate-600">Sales (৳)</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "16px",
                    border: "none",
                    color: "#FFF",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                  }}
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#6C5CE7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Category Sales Distribution */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Category Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Revenue breakdown by product categories</p>
              </div>
            </div>

            <div className="h-52 w-full my-2">
              {categorySales.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No category sales records
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySales}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categorySales.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        borderRadius: "12px",
                        color: "#FFF",
                      }}
                      formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, "Revenue"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto">
            {categorySales.map((d: any) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-700 font-medium truncate">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">৳{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. DYNAMIC RECENT ORDERS & LOW STOCK ALERTS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="xl:col-span-2 bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] bg-slate-50/50">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Recent Database Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time customer transactions</p>
            </div>
            <Link href="/admin/orders" className="text-xs text-[#6C5CE7] hover:underline font-bold">
              View all orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No recent orders found</p>
              </div>
            ) : (
              <table className="w-full text-xs md:text-sm text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="p-4 pl-6">Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="p-4 pl-6">
                        <Link href={`/admin/orders/${order.id}`} className="text-[#6C5CE7] hover:underline font-mono text-xs font-bold">
                          #{order.orderNumber}
                        </Link>
                        <p className="text-slate-400 text-[10px] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-900 font-bold text-xs">
                          {order.customer?.profile?.fullName || order.customer?.email?.split("@")[0]}
                        </p>
                        <p className="text-slate-400 text-[10px]">{order.customer?.email}</p>
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
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] bg-slate-50/50">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Low Stock Alerts ({lowStockCountVal})
            </h2>
            <Link href="/admin/inventory" className="text-xs text-[#6C5CE7] hover:underline font-bold">
              Inventory →
            </Link>
          </div>

          <div className="divide-y divide-[#E5E7EB] flex-1 overflow-y-auto max-h-96">
            {lowStockAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">All products are well stocked</p>
              </div>
            ) : (
              lowStockAlerts.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-[#6C5CE7]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-xs font-bold truncate">{item.name}</p>
                    <p className="text-slate-400 text-[10px]">{item.category?.name}</p>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${item.stockQty === 0 ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                    {item.stockQty === 0 ? "Out of Stock" : `${item.stockQty} left`}
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
