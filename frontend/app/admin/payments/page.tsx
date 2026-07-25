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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Payment Verification Queue
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {orders.length} Pending Verifications
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Review bKash/Nagad TrxIDs, sender mobile numbers, and payment receipt screenshots.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or TrxID..."
            className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all"
          />
        </div>

        <Button
          variant="outline"
          onClick={fetchPayments}
          size="sm"
          className="border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refresh
        </Button>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <CheckCircle className="h-12 w-12 mb-3 text-emerald-500" />
              <p className="font-bold text-slate-800 text-base">All payments verified!</p>
              <p className="text-xs text-slate-400 mt-1">No pending payment submissions right now.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Method</th>
                  <th className="py-4 px-4">Txn ID & Sender</th>
                  <th className="py-4 px-4">Paid Amount</th>
                  <th className="py-4 px-4">Order Total</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-[#6C5CE7] font-extrabold font-mono text-xs">
                        #{order.orderNumber}
                      </span>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="text-slate-900 font-bold text-xs">
                        {order.customer?.profile?.fullName || order.customer?.email?.split("@")[0]}
                      </p>
                      <p className="text-slate-400 text-[11px]">{order.customer?.email}</p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {order.paymentMethod?.logoUrl && (
                          <img
                            src={order.paymentMethod.logoUrl}
                            alt=""
                            className="w-6 h-6 rounded object-contain"
                          />
                        )}
                        <span className="text-slate-800 font-semibold text-xs">
                          {order.paymentMethod?.name || "bKash"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {order.transactionId || "No TrxID"}
                      </span>
                      {order.senderNumber && (
                        <p className="text-slate-500 text-[11px] font-mono mt-0.5">From: {order.senderNumber}</p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-emerald-600 font-extrabold text-xs">
                        ৳{order.paidAmount?.toLocaleString() || "—"}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      ৳{order.grandTotal.toLocaleString()}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-[#6C5CE7]/10 text-slate-600 hover:text-[#6C5CE7] transition-all"
                          title="View proof details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(order.id, true)}
                          className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-all"
                          title="Approve payment"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(order.id, false)}
                          className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition-all"
                          title="Reject payment"
                        >
                          <XCircle className="h-4 w-4" />
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
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">
              Payment Submission — Order #{selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#F8FAFC] border border-[#E5E7EB] p-4 rounded-xl">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Method</p>
                  <p className="text-slate-900 font-bold mt-0.5">{selectedOrder.paymentMethod?.name || "bKash"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Transaction ID</p>
                  <p className="text-[#6C5CE7] font-mono font-extrabold mt-0.5">{selectedOrder.transactionId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Sender Number</p>
                  <p className="text-slate-900 font-mono font-bold mt-0.5">{selectedOrder.senderNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Paid Amount</p>
                  <p className="text-emerald-600 font-extrabold mt-0.5">৳{selectedOrder.paidAmount || "N/A"}</p>
                </div>
              </div>

              {selectedOrder.customerNote && (
                <div>
                  <p className="text-slate-500 text-xs font-bold mb-1">Customer Note</p>
                  <p className="text-slate-800 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3">
                    {selectedOrder.customerNote}
                  </p>
                </div>
              )}

              {selectedOrder.paymentScreenshotUrl && (
                <div>
                  <p className="text-slate-500 text-xs font-bold mb-2">Payment Proof Screenshot</p>
                  <img
                    src={selectedOrder.paymentScreenshotUrl}
                    alt="Payment proof"
                    className="w-full rounded-xl border border-slate-200 max-h-64 object-contain bg-slate-50 p-2"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleVerify(selectedOrder.id, true)}
                  disabled={verifying}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve Payment
                </Button>
                <Button
                  onClick={() => handleVerify(selectedOrder.id, false)}
                  disabled={verifying}
                  variant="outline"
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl"
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
