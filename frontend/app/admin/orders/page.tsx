"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  Loader2,
  ShoppingBag,
  Eye,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  FileText,
  User,
  MapPin,
  CreditCard,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Check,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  productSku?: string;
  productImage?: string;
  variantName?: string;
  quantity: number;
  price: number;
  product?: { name: string; thumbnail?: string; sku?: string };
}

interface TimelineEvent {
  id: string;
  status: string;
  note?: string;
  timestamp: string;
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  grandTotal: number;
  deliveryCharge: number;
  createdAt: string;
  customer?: { email: string; profile?: { fullName?: string; phoneNumber?: string } } | null;
  guestInfo?: { fullName?: string; phone?: string; street?: string; city?: string; country?: string; orderNotes?: string } | null;
  paymentMethod?: { name: string; accountType?: string } | null;
  deliveryZone?: { zoneName: string; estDeliveryTime?: string } | null;
  senderNumber?: string | null;
  transactionId?: string | null;
  customerNote?: string | null;
  paymentScreenshotUrl?: string | null;
  orderItems?: OrderItem[];
  timelineEvents?: TimelineEvent[];
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-[#FBEEE0] text-[#B5601A] border-amber-200",
  PENDING_PAYMENT_VERIFICATION: "bg-[#FBEEE0] text-[#B5601A] border-amber-200",
  CONFIRMED: "bg-[#E4EEE7] text-[#123524] border-emerald-200",
  PACKED: "bg-blue-50 text-blue-800 border-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-800 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-purple-50 text-purple-800 border-purple-200",
  DELIVERED: "bg-[#E6F5EB] text-[#1F8A4C] border-emerald-300",
  CANCELLED: "bg-[#FBEAEA] text-[#C23B3B] border-rose-200",
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PENDING_PAYMENT_VERIFICATION: "Verifying Payment",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
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

const statusTabs = [
  { id: "", label: "All Orders", icon: Sparkles },
  { id: "PENDING_PAYMENT", label: "Pending Payment", icon: Clock },
  { id: "PENDING_PAYMENT_VERIFICATION", label: "Verifying Payment", icon: ShieldCheck },
  { id: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { id: "PACKED", label: "Packed", icon: Package },
  { id: "SHIPPED", label: "Shipped", icon: Truck },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: MapPin },
  { id: "DELIVERED", label: "Delivered", icon: Check },
  { id: "CANCELLED", label: "Cancelled", icon: AlertTriangle },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING_PAYMENT");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selection & Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<string>("");
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Detail Modal State
  const [activeOrderDetails, setActiveOrderDetails] = useState<Order | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingSingleId, setUpdatingSingleId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/orders", { params });
      setOrders(data.data.orders || []);
      if (data.data.statusCounts) {
        setStatusCounts(data.data.statusCounts);
      }
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

  // Real-time WebSocket Order Listener
  useEffect(() => {
    const socket = getSocket();

    const handleNewOrder = (newOrder: any) => {
      // Audio Chime Synthesizer
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch {
        // Fallback
      }

      toast.success(
        `🔔 নতুন অর্ডার প্রাপ্তি! Order #${newOrder.orderNumber} (৳${newOrder.grandTotal})`,
        {
          duration: 6000,
          description: `Customer: ${
            newOrder.guestInfo?.fullName || newOrder.customer?.profile?.fullName || "Guest Customer"
          }`,
          action: {
            label: "View Order",
            onClick: () => router.push(`/admin/orders/${newOrder.id}`),
          },
        }
      );

      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      setTotal((t) => t + 1);
    };

    const handleStatusUpdated = (data: { orderId: string; status: string }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === data.orderId ? { ...o, status: data.status } : o))
      );
      fetchOrders();
    };

    const handleBulkUpdated = (data: { orderIds: string[]; status: string }) => {
      setOrders((prev) =>
        prev.map((o) => (data.orderIds.includes(o.id) ? { ...o, status: data.status } : o))
      );
      fetchOrders();
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_status_updated", handleStatusUpdated);
    socket.on("bulk_orders_updated", handleBulkUpdated);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_updated", handleStatusUpdated);
      socket.off("bulk_orders_updated", handleBulkUpdated);
    };
  }, [router, fetchOrders]);

  // Bulk Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allCurrentIds = orders.map((o) => o.id);
      setSelectedIds(allCurrentIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  // Single Order Status Update
  const handleSingleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingSingleId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orders.find((o) => o.id === orderId)?.orderNumber || ""} updated to ${statusLabels[newStatus] || newStatus}`);
      fetchOrders();
      if (activeOrderDetails && activeOrderDetails.id === orderId) {
        setActiveOrderDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingSingleId(null);
    }
  };

  // Bulk Status Update Handler
  const handleApplyBulkStatus = async () => {
    if (!bulkTargetStatus) {
      toast.error("Please select a target status to apply");
      return;
    }
    setBulkUpdating(true);
    try {
      const res = await api.patch("/orders/bulk-status", {
        orderIds: selectedIds,
        status: bulkTargetStatus,
      });
      toast.success(res.data?.message || `Successfully updated ${selectedIds.length} orders`);
      setSelectedIds([]);
      setBulkTargetStatus("");
      setShowBulkConfirmModal(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bulk status update failed");
    } finally {
      setBulkUpdating(false);
    }
  };

  // View Details Trigger -> Navigates to Full Page View
  const handleViewDetails = (order: Order) => {
    router.push(`/admin/orders/${order.id}`);
  };

  // Summary Metrics
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const pendingCount = orders.filter((o) => o.status.includes("PENDING")).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const revenueStr = totalRevenue >= 100000 ? `৳${(totalRevenue / 100000).toFixed(1)}L` : `৳${totalRevenue.toLocaleString()}`;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif] pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Customer Orders Desk
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {total || orders.length} orders
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Manage bulk status changes, view customer invoices, track delivery & payment proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchOrders}
            size="sm"
            className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-[#5C685F] ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
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
              <span>✓</span> Total in system
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
              Completed & Received
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Pending Verification</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50 font-black text-xs">
              !
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {pendingCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Requires review
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
              Current page total
            </p>
          </div>
        </div>
      </div>

      {/* STATUS FILTER TABS STRIP */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 no-scrollbar scrollbar-none font-['Inter',sans-serif]">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          const count =
            tab.id === ""
              ? Object.values(statusCounts).reduce((a, b) => a + b, 0) || total
              : statusCounts[tab.id] || 0;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer border ${
                isActive
                  ? "bg-[#123524] text-white border-[#123524] shadow-xs ring-2 ring-[#123524]/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-300" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar & Status Filter */}
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
            placeholder="Search by order #, phone, transaction ID, or customer name..."
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
          className="h-9 px-3 bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl text-xs font-bold text-[#131914] focus:outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="">Filter by Status (All)</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s] || s}
            </option>
          ))}
        </select>
      </div>

      {/* 4. BULK ACTIONS SELECTION TOOLBAR */}
      {selectedIds.length > 0 && (
        <div className="bg-[#123524] text-white p-3.5 rounded-2xl shadow-md border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-extrabold px-3 py-1 rounded-xl">
              {selectedIds.length} order{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <p className="text-xs text-emerald-100 hidden md:block">
              Choose a target status to apply bulk fulfillment changes.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={bulkTargetStatus}
              onChange={(e) => setBulkTargetStatus(e.target.value)}
              className="h-9 px-3 bg-[#1B4A34] text-white border border-emerald-600 rounded-xl text-xs font-bold focus:outline-none cursor-pointer flex-1 sm:flex-none"
            >
              <option value="">Select Target Status...</option>
              {allStatuses.map((s) => (
                <option key={s} value={s} className="bg-[#123524] text-white">
                  Change to: {statusLabels[s] || s}
                </option>
              ))}
            </select>

            <Button
              disabled={!bulkTargetStatus}
              onClick={() => setShowBulkConfirmModal(true)}
              className="bg-[#1F8A4C] hover:bg-emerald-600 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Apply Status
            </Button>

            <Button
              variant="outline"
              onClick={() => setSelectedIds([])}
              className="border-emerald-700 text-emerald-100 hover:bg-[#1B4A34] hover:text-white text-xs font-semibold h-9 px-3 rounded-xl cursor-pointer"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* 5. ORDERS TABLE */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-[#5C685F]">
              <ShoppingBag className="h-12 w-12 mb-3 text-[#8B958D]" />
              <p className="font-bold text-[#131914] text-base">No orders found</p>
              <p className="text-xs text-[#5C685F] mt-1">
                Try adjusting your search query or status filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs relative">
              <thead className="sticky top-0 bg-[#F1F6F2] z-10 border-b border-[#E4E8E4] text-[#5C685F] uppercase tracking-wider text-[10px] font-extrabold shadow-2xs">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#123524] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">ORDER #</th>
                  <th className="py-3.5 px-4">CUSTOMER & CONTACT</th>
                  <th className="py-3.5 px-4">PAYMENT METHOD</th>
                  <th className="py-3.5 px-4">FULFILLMENT STATUS</th>
                  <th className="py-3.5 px-4">GRAND TOTAL</th>
                  <th className="py-3.5 px-4">DATE</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8E4]/60 font-medium text-[#131914]">
                {orders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  const custName =
                    order.customer?.profile?.fullName ||
                    order.guestInfo?.fullName ||
                    order.senderNumber ||
                    "Guest Customer";
                  const custContact =
                    order.customer?.email ||
                    order.guestInfo?.phone ||
                    order.senderNumber ||
                    "N/A";

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-[#E4EEE7]/40 border-l-4 border-l-[#123524]"
                          : "hover:bg-[#F1F6F2]/70"
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="w-4 h-4 rounded accent-[#123524] cursor-pointer"
                        />
                      </td>

                      {/* Order Number */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-[#123524] font-black font-mono text-xs hover:underline flex items-center gap-1 text-left cursor-pointer"
                        >
                          #{order.orderNumber}
                        </button>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <p className="text-[#131914] font-bold text-xs">{custName}</p>
                        <p className="text-[#8B958D] text-[10px] font-mono mt-0.5">
                          {custContact}
                        </p>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-[#5C685F]">
                        <span className="bg-[#F5F7F5] border border-[#E4E8E4] px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-[#131914]">
                          {order.paymentMethod?.name || "Cash on Delivery"}
                        </span>
                      </td>

                      {/* Fulfillment Status & Dropdown */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              statusColors[order.status] || "bg-[#F5F7F5] text-[#5C685F] border-slate-200"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {statusLabels[order.status] || order.status.replace(/_/g, " ")}
                          </span>

                          {/* Quick Single Row Status Dropdown */}
                          <select
                            value={order.status}
                            disabled={updatingSingleId === order.id}
                            onChange={(e) => handleSingleStatusUpdate(order.id, e.target.value)}
                            className="h-7 px-1.5 bg-[#F5F7F5] border border-[#E4E8E4] text-[#131914] text-[11px] font-semibold rounded-lg focus:outline-none cursor-pointer"
                          >
                            {allStatuses.map((st) => (
                              <option key={st} value={st}>
                                {statusLabels[st] || st}
                              </option>
                            ))}
                          </select>
                          {updatingSingleId === order.id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#123524]" />
                          )}
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 font-extrabold text-[#131914] font-['Manrope']">
                        ৳{order.grandTotal.toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#5C685F] text-xs font-mono">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-[#E4E8E4] bg-white text-[#123524] hover:bg-[#F1F6F2] transition-colors text-xs font-bold cursor-pointer"
                          title="View complete order details"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#E4E8E4] bg-[#F5F7F5]/50 flex items-center justify-between text-xs text-[#5C685F]">
            <span>
              Page {page} of {totalPages} ({total} total orders)
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

      {/* 6. BULK CONFIRMATION MODAL */}
      <Dialog open={showBulkConfirmModal} onOpenChange={setShowBulkConfirmModal}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6 max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-[#C23B3B]">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">
                Confirm Bulk Status Change
              </DialogTitle>
            </div>
            <DialogDescription className="text-[#5C685F] text-xs mt-2 leading-relaxed">
              Are you sure you want to update the status of{" "}
              <strong className="text-[#131914] font-bold">{selectedIds.length} selected order(s)</strong>{" "}
              to{" "}
              <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-[#E4EEE7] text-[#123524]">
                {statusLabels[bulkTargetStatus] || bulkTargetStatus}
              </span>
              ?
              {bulkTargetStatus === "CANCELLED" && (
                <span className="block mt-2 font-bold text-[#C23B3B] bg-[#FBEAEA] p-2 rounded-xl border border-rose-200">
                  ⚠️ Warning: Cancelling orders will release reserved inventory back to product stock.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowBulkConfirmModal(false)}
              className="border-[#E4E8E4] text-[#131914] hover:bg-[#F1F6F2] text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyBulkStatus}
              disabled={bulkUpdating}
              className="bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              {bulkUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm & Apply to {selectedIds.length} Order(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. QUICK ORDER DETAILS DRAWER / MODAL */}
      <Dialog open={!!activeOrderDetails} onOpenChange={() => setActiveOrderDetails(null)}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-3xl p-6 sm:p-8 max-w-5xl max-h-[90vh] overflow-y-auto font-['Inter',sans-serif]">
          {activeOrderDetails && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E4E8E4] pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#131914] font-['Manrope'] font-mono">
                      Order #{activeOrderDetails.orderNumber}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${
                        statusColors[activeOrderDetails.status] || "bg-[#F5F7F5] text-[#5C685F]"
                      }`}
                    >
                      {statusLabels[activeOrderDetails.status] || activeOrderDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C685F] mt-1 font-mono">
                    ID: {activeOrderDetails.id} • Placed on{" "}
                    {new Date(activeOrderDetails.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Open Dedicated Page & Status Switcher */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#5C685F]">Status:</label>
                    <select
                      value={activeOrderDetails.status}
                      onChange={(e) => handleSingleStatusUpdate(activeOrderDetails.id, e.target.value)}
                      className="h-9 px-2.5 bg-[#F5F7F5] border border-[#E4E8E4] text-[#131914] text-xs font-bold rounded-xl focus:outline-none cursor-pointer"
                    >
                      {allStatuses.map((st) => (
                        <option key={st} value={st}>
                          {statusLabels[st] || st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      const orderId = activeOrderDetails.id;
                      setActiveOrderDetails(null);
                      router.push(`/admin/orders/${orderId}`);
                    }}
                    className="bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer"
                  >
                    Open Full Page View →
                  </Button>
                </div>
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
                </div>
              ) : (
                <>
                  {/* Grid 2 Cols: Customer & Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Information */}
                    <div className="bg-[#F5F7F5] border border-[#E4E8E4] rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-[#123524] font-bold text-xs font-['Manrope'] border-b border-[#E4E8E4] pb-2">
                        <User className="w-4 h-4" /> Customer Details
                      </div>
                      <div className="text-xs space-y-1 pt-1">
                        <p>
                          <strong className="text-[#5C685F]">Name:</strong>{" "}
                          <span className="font-bold text-[#131914]">
                            {activeOrderDetails.customer?.profile?.fullName ||
                              activeOrderDetails.guestInfo?.fullName ||
                              "Guest Customer"}
                          </span>
                        </p>
                        <p>
                          <strong className="text-[#5C685F]">Phone:</strong>{" "}
                          <span className="font-mono text-[#131914]">
                            {activeOrderDetails.guestInfo?.phone ||
                              activeOrderDetails.customer?.profile?.phoneNumber ||
                              activeOrderDetails.senderNumber ||
                              "Not provided"}
                          </span>
                        </p>
                        <p>
                          <strong className="text-[#5C685F]">Email:</strong>{" "}
                          <span className="text-[#131914]">
                            {activeOrderDetails.customer?.email ||
                              (activeOrderDetails.guestInfo as any)?.email ||
                              "Guest checkout"}
                          </span>
                        </p>
                        {activeOrderDetails.customerNote && (
                          <p className="mt-2 bg-white p-2 rounded-xl border border-[#E4E8E4] text-[11px] text-[#5C685F] italic">
                            "{activeOrderDetails.customerNote}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery & Shipping Info */}
                    <div className="bg-[#F5F7F5] border border-[#E4E8E4] rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-[#123524] font-bold text-xs font-['Manrope'] border-b border-[#E4E8E4] pb-2">
                        <MapPin className="w-4 h-4" /> Delivery Information
                      </div>
                      <div className="text-xs space-y-1 pt-1">
                        <p>
                          <strong className="text-[#5C685F]">Zone:</strong>{" "}
                          <span className="font-bold text-[#131914]">
                            {activeOrderDetails.deliveryZone?.zoneName || "Standard Delivery"}
                          </span>
                        </p>
                        <p>
                          <strong className="text-[#5C685F]">Address:</strong>{" "}
                          <span className="text-[#131914]">
                            {activeOrderDetails.guestInfo?.street || "Not specified"}
                          </span>
                        </p>
                        <p>
                          <strong className="text-[#5C685F]">Payment Method:</strong>{" "}
                          <span className="font-semibold text-[#131914]">
                            {activeOrderDetails.paymentMethod?.name || "Cash on Delivery"}
                          </span>
                        </p>
                        {activeOrderDetails.transactionId && (
                          <p>
                            <strong className="text-[#5C685F]">Trx ID:</strong>{" "}
                            <span className="font-mono text-emerald-800 font-bold">
                              {activeOrderDetails.transactionId}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-[#131914] text-xs font-['Manrope'] uppercase tracking-wider">
                      Purchased Items ({activeOrderDetails.orderItems?.length || 0})
                    </h3>
                    <div className="bg-white border border-[#E4E8E4] rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-[#F1F6F2] text-[#5C685F] border-b border-[#E4E8E4] text-[10px] uppercase font-bold">
                            <th className="py-2.5 px-3">Item</th>
                            <th className="py-2.5 px-3">Price</th>
                            <th className="py-2.5 px-3">Qty</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4E8E4]/60">
                          {activeOrderDetails.orderItems && activeOrderDetails.orderItems.length > 0 ? (
                            activeOrderDetails.orderItems.map((item) => (
                              <tr key={item.id}>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2.5">
                                    {(item.productImage || item.product?.thumbnail) && (
                                      <img
                                        src={item.productImage || item.product?.thumbnail}
                                        alt=""
                                        className="w-9 h-9 rounded-lg object-cover border border-[#E4E8E4] shrink-0"
                                      />
                                    )}
                                    <div>
                                      <p className="font-bold text-[#131914]">
                                        {item.productName || item.product?.name || "Product"}
                                      </p>
                                      {item.variantName && (
                                        <p className="text-[10px] text-[#5C685F]">{item.variantName}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 font-mono">৳{item.price.toLocaleString()}</td>
                                <td className="py-2.5 px-3 font-bold">{item.quantity}</td>
                                <td className="py-2.5 px-3 text-right font-extrabold font-['Manrope']">
                                  ৳{(item.price * item.quantity).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-[#5C685F]">
                                No items listed
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-[#F5F7F5] border border-[#E4E8E4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-[#5C685F] space-y-1">
                      <p>Delivery Charge: ৳{activeOrderDetails.deliveryCharge || 0}</p>
                      <p className="text-[11px]">Payment Status: Automated Verification / COD</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#5C685F] font-bold">Grand Total Amount:</span>
                      <p className="text-2xl font-black text-[#123524] font-['Manrope'] leading-none mt-0.5">
                        ৳{activeOrderDetails.grandTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Events */}
                  {activeOrderDetails.timelineEvents && activeOrderDetails.timelineEvents.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h3 className="font-extrabold text-[#131914] text-xs font-['Manrope'] uppercase tracking-wider">
                        Order Fulfillment Timeline
                      </h3>
                      <div className="space-y-2 border-l-2 border-[#E4EEE7] pl-3 ml-2">
                        {activeOrderDetails.timelineEvents.map((evt) => (
                          <div key={evt.id} className="relative text-xs">
                            <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#123524] border-2 border-white" />
                            <p className="font-bold text-[#131914]">
                              {statusLabels[evt.status] || evt.status}
                            </p>
                            {evt.note && <p className="text-[#5C685F] text-[11px]">{evt.note}</p>}
                            <p className="text-[10px] text-[#8B958D] font-mono mt-0.5">
                              {new Date(evt.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end pt-4 border-t border-[#E4E8E4]">
                <Button
                  onClick={() => setActiveOrderDetails(null)}
                  className="bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
