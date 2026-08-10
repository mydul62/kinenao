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
  PENDING_PAYMENT: "bg-[#FBEEE0] text-[#B5601A]",
  PENDING_PAYMENT_VERIFICATION: "bg-[#FBEEE0] text-[#B5601A]",
  CONFIRMED: "bg-[#E4EEE7] text-[#123524]",
  PACKED: "bg-[#E4EEE7] text-[#123524]",
  SHIPPED: "bg-[#E4EEE7] text-[#123524]",
  OUT_FOR_DELIVERY: "bg-[#E4EEE7] text-[#123524]",
  DELIVERED: "bg-[#E6F5EB] text-[#1F8A4C]",
  CANCELLED: "bg-[#FBEAEA] text-[#C23B3B]",
};

const CATEGORY_COLORS = ["#123524", "#1F8A4C", "#34D399", "#8B958D", "#B5601A", "#C23B3B"];

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
        <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
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
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Executive Dashboard
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              Live Connected
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Real-time analytics directly synchronized with your database.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E4E8E4] text-[#131914] text-xs font-semibold rounded-xl hover:bg-[#F1F6F2] transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5C685F] ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync Metrics</span>
          </button>

          <div className="bg-white border border-[#E4E8E4] p-1 rounded-xl shadow-2xs hidden sm:flex items-center gap-1">
            {(["Today", "Week", "Month", "Year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  timeRange === range
                    ? "bg-[#123524] text-white shadow-xs font-bold"
                    : "text-[#5C685F] hover:text-[#131914] hover:bg-[#F1F6F2]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. DYNAMIC TOP 4 STAT CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Revenue</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              ৳{revenueVal.toLocaleString()}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>↑</span> Verified sales
            </p>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Orders</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {ordersVal.toLocaleString()}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              All transactions
            </p>
          </div>
        </div>

        {/* Card 3: Active Customers */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Active Customers</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {customersVal.toLocaleString()}
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              Verified accounts
            </p>
          </div>
        </div>

        {/* Card 4: Actionable Pending Orders */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Pending Orders</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50 font-black text-xs">
              ▲
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {pendingOrdersVal}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Awaiting packing
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. DYNAMIC RECHARTS (Monthly Sales & Category Breakdown) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Sales Area Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-extrabold text-[#131914] text-base font-['Manrope']">Live Monthly Sales Revenue</h3>
              <p className="text-xs text-[#5C685F] mt-0.5">Database aggregated monthly revenue totals</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#123524]" />
              <span className="text-[#5C685F]">Sales (৳)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#123524" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#123524" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E8E4" />
                <XAxis dataKey="month" stroke="#8B958D" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8B958D" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#123524",
                    borderRadius: "12px",
                    border: "none",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#123524"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Category Sales Distribution */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-[#131914] text-base font-['Manrope']">Category Distribution</h3>
                <p className="text-xs text-[#5C685F] mt-0.5">Revenue breakdown by product categories</p>
              </div>
            </div>

            <div className="h-44 w-full my-2">
              {categorySales.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#8B958D]">
                  No category sales records
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySales}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categorySales.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#123524",
                        borderRadius: "10px",
                        color: "#FFF",
                        fontSize: "11px",
                      }}
                      formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, "Revenue"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#E4E8E4] max-h-32 overflow-y-auto">
            {categorySales.map((d: any) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[#5C685F] font-medium truncate">{d.name}</span>
                </div>
                <span className="font-bold text-[#131914] shrink-0 font-['Manrope']">৳{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. DYNAMIC RECENT ORDERS & LOW STOCK ALERTS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Orders Table */}
        <div className="xl:col-span-2 bg-white border border-[#E4E8E4] rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#E4E8E4] bg-[#F1F6F2]">
            <div>
              <h2 className="font-extrabold text-[#131914] text-base font-['Manrope']">Recent Orders</h2>
              <p className="text-xs text-[#5C685F] mt-0.5">Real-time customer transactions</p>
            </div>
            <Link href="/admin/orders" className="text-xs text-[#123524] hover:underline font-bold">
              View all orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag className="h-10 w-10 text-[#8B958D] mx-auto mb-2" />
                <p className="text-[#5C685F] text-xs">No recent orders found</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E4E8E4] bg-[#F1F6F2]/50 text-[#5C685F] uppercase tracking-wider text-[10px] font-bold">
                    <th className="p-3 pl-4">ORDER</th>
                    <th className="p-3">CUSTOMER</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right pr-4">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E8E4]/60 font-medium text-[#131914]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F1F6F2]/70 transition-colors">
                      <td className="p-3 pl-4">
                        <Link href={`/admin/orders/${order.id}`} className="text-[#123524] hover:underline font-mono text-xs font-bold">
                          #{order.orderNumber}
                        </Link>
                        <p className="text-[#8B958D] text-[10px] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-[#131914] font-bold text-xs">
                          {order.customer?.profile?.fullName || order.customer?.email?.split("@")[0]}
                        </p>
                        <p className="text-[#8B958D] text-[10px]">{order.customer?.email}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors[order.status] || "bg-[#F5F7F5] text-[#5C685F]"}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-4">
                        <span className="text-[#131914] font-extrabold text-xs font-['Manrope']">৳{order.grandTotal.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#E4E8E4] bg-[#F1F6F2]">
            <h2 className="font-extrabold text-[#131914] text-base font-['Manrope'] flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-[#B5601A]" />
              Low Stock Alerts ({lowStockCountVal})
            </h2>
            <Link href="/admin/inventory" className="text-xs text-[#123524] hover:underline font-bold">
              Inventory →
            </Link>
          </div>

          <div className="divide-y divide-[#E4E8E4]/60 flex-1 overflow-y-auto max-h-80">
            {lowStockAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-10 w-10 text-[#8B958D] mx-auto mb-2" />
                <p className="text-[#5C685F] text-xs">All products are well stocked</p>
              </div>
            ) : (
              lowStockAlerts.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 p-3 hover:bg-[#F1F6F2]/70 transition-colors">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-[#E4E8E4] shrink-0" />
                  ) : (
                    <div className="w-8 h-8 bg-[#F5F7F5] rounded-lg flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-[#123524]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#131914] text-xs font-bold truncate">{item.name}</p>
                    <p className="text-[#8B958D] text-[10px]">{item.category?.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.stockQty === 0 ? "bg-[#FBEAEA] text-[#C23B3B]" : "bg-[#FBEEE0] text-[#B5601A]"}`}>
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
