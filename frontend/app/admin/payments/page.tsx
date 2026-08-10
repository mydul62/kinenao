"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, RefreshCw, Loader2, CreditCard, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PaymentOrder {
  id: string;
  orderNumber: number;
  status: string;
  grandTotal: number;
  paidAmount?: number;
  transactionId?: string;
  senderNumber?: string;
  paymentScreenshotUrl?: string;
  customerNote?: string;
  paymentMethod?: { name: string; logoUrl?: string };
  customer: { email: string; profile?: { fullName?: string } };
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 30, status: "PENDING_PAYMENT_VERIFICATION" };
      if (search) params.search = search;
      const { data } = await api.get("/orders", { params });
      setOrders(data.data.orders || []);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleVerify = async (orderId: string, approve: boolean) => {
    setVerifying(true);
    try {
      const newStatus = approve ? "CONFIRMED" : "PENDING_PAYMENT";
      await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        note: approve ? "Payment verified by admin" : "Payment rejected — please resubmit",
      });
      toast.success(approve ? "Payment approved!" : "Payment rejected");
      setSelectedOrder(null);
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setVerifying(false);
    }
  };

  const totalUnverifiedVol = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const bkashCount = orders.filter((o) => o.paymentMethod?.name?.toLowerCase().includes("bkash")).length;
  const nagadCount = orders.filter((o) => o.paymentMethod?.name?.toLowerCase().includes("nagad")).length;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Payment Receipts
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {orders.length} in queue
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Review bKash/Nagad TrxIDs, sender mobile numbers, and payment receipt screenshots.
          </p>
        </div>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Pending Verification</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {orders.length}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Requires review
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Unverified Volume</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7] font-bold text-xs font-['Manrope']">
              ৳
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              ৳{totalUnverifiedVol.toLocaleString()}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Awaiting confirmation
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">bKash Transfers</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEAEA] text-[#C23B3B] flex items-center justify-center border border-rose-200/50">
              <span className="font-extrabold text-[10px]">bK</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {bkashCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Mobile banking submissions
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Nagad Transfers</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <span className="font-extrabold text-[10px]">Ng</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {nagadCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Mobile banking submissions
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E4E8E4] shadow-xs">
        <div className="flex items-center gap-2 bg-[#F5F7F5] px-3.5 py-2 rounded-xl border border-[#E4E8E4] w-full sm:flex-1">
          <Search className="w-4 h-4 text-[#8B958D] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or TrxID..."
            className="w-full text-xs text-[#131914] placeholder:text-[#8B958D] bg-transparent border-0 focus:outline-none"
          />
        </div>

        <Button
          variant="outline"
          onClick={fetchPayments}
          size="sm"
          className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer w-full sm:w-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#5C685F]" />
          Refresh
        </Button>
      </div>

      {/* 4. Payments Table */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-[#5C685F]">
              <CheckCircle className="h-12 w-12 mb-3 text-[#1F8A4C]" />
              <p className="font-bold text-[#131914] text-base">All payments verified!</p>
              <p className="text-xs text-[#5C685F] mt-1">No pending payment submissions right now.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E8E4] bg-[#F1F6F2] text-[#5C685F] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">ORDER</th>
                  <th className="py-3 px-4">CUSTOMER</th>
                  <th className="py-3 px-4">METHOD</th>
                  <th className="py-3 px-4">TXN ID & SENDER</th>
                  <th className="py-3 px-4">PAID AMOUNT</th>
                  <th className="py-3 px-4">ORDER TOTAL</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8E4]/60 font-medium text-[#131914]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F1F6F2]/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-[#123524] font-extrabold font-mono text-xs">
                        #{order.orderNumber}
                      </span>
                      <p className="text-[#8B958D] text-[10px] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-[#131914] font-bold text-xs">
                        {order.customer?.profile?.fullName || order.customer?.email?.split("@")[0]}
                      </p>
                      <p className="text-[#8B958D] text-[10px]">{order.customer?.email}</p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {order.paymentMethod?.logoUrl && (
                          <img
                            src={order.paymentMethod.logoUrl}
                            alt=""
                            className="w-5 h-5 rounded object-contain"
                          />
                        )}
                        <span className="text-[#131914] font-semibold text-xs">
                          {order.paymentMethod?.name || "bKash"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-[#131914] bg-[#F5F7F5] border border-[#E4E8E4] px-2 py-0.5 rounded-lg">
                        {order.transactionId || "No TrxID"}
                      </span>
                      {order.senderNumber && (
                        <p className="text-[#5C685F] text-[10px] font-mono mt-0.5">From: {order.senderNumber}</p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[#1F8A4C] font-extrabold text-xs font-['Manrope']">
                        ৳{order.paidAmount?.toLocaleString() || "—"}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-extrabold text-[#131914] font-['Manrope']">
                      ৳{order.grandTotal.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#123524] hover:bg-[#F1F6F2] transition-colors cursor-pointer"
                          title="View proof details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleVerify(order.id, true)}
                          className="p-1.5 rounded-lg border border-emerald-200 bg-[#E6F5EB] text-[#1F8A4C] hover:bg-emerald-100 transition-colors cursor-pointer"
                          title="Approve payment"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleVerify(order.id, false)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-[#FBEAEA] text-[#C23B3B] hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Reject payment"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">
              Payment Submission — Order #{selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#F5F7F5] border border-[#E4E8E4] p-4 rounded-xl">
                <div>
                  <p className="text-[#5C685F] font-semibold uppercase text-[10px]">Method</p>
                  <p className="text-[#131914] font-bold mt-0.5">{selectedOrder.paymentMethod?.name || "bKash"}</p>
                </div>
                <div>
                  <p className="text-[#5C685F] font-semibold uppercase text-[10px]">Transaction ID</p>
                  <p className="text-[#123524] font-mono font-extrabold mt-0.5">{selectedOrder.transactionId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[#5C685F] font-semibold uppercase text-[10px]">Sender Number</p>
                  <p className="text-[#131914] font-mono font-bold mt-0.5">{selectedOrder.senderNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[#5C685F] font-semibold uppercase text-[10px]">Paid Amount</p>
                  <p className="text-[#1F8A4C] font-extrabold mt-0.5">৳{selectedOrder.paidAmount || "N/A"}</p>
                </div>
              </div>

              {selectedOrder.customerNote && (
                <div>
                  <p className="text-[#5C685F] text-xs font-bold mb-1">Customer Note</p>
                  <p className="text-[#131914] text-xs bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl p-3">
                    {selectedOrder.customerNote}
                  </p>
                </div>
              )}

              {selectedOrder.paymentScreenshotUrl && (
                <div>
                  <p className="text-[#5C685F] text-xs font-bold mb-2">Payment Proof Screenshot</p>
                  <img
                    src={selectedOrder.paymentScreenshotUrl}
                    alt="Payment proof"
                    className="w-full rounded-xl border border-[#E4E8E4] max-h-64 object-contain bg-[#F5F7F5] p-2"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleVerify(selectedOrder.id, true)}
                  disabled={verifying}
                  className="flex-1 bg-[#123524] hover:bg-[#1B4A34] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve Payment
                </Button>
                <Button
                  onClick={() => handleVerify(selectedOrder.id, false)}
                  disabled={verifying}
                  variant="outline"
                  className="flex-1 border-[#E4E8E4] text-[#C23B3B] hover:bg-[#FBEAEA] font-bold text-xs rounded-xl cursor-pointer"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Reject Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
