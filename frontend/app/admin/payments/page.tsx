"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, RefreshCw, Loader2, CreditCard, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

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

  const fetchOrders = useCallback(async () => {
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

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleVerify = async (orderId: string, approve: boolean) => {
    setVerifying(true);
    try {
      const newStatus = approve ? "CONFIRMED" : "PENDING_PAYMENT";
      await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        note: approve ? "Payment verified by admin" : "Payment rejected — please resubmit"
      });
      toast.success(approve ? "Payment approved!" : "Payment rejected");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Payment Verification</h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} pending verifications</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order # or customer..." className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <Button variant="outline" onClick={fetchOrders} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <CheckCircle className="h-10 w-10 mb-2 text-emerald-600" />
              <p className="text-emerald-400 font-medium">All payments verified!</p>
              <p className="text-slate-500 text-sm mt-1">No pending verifications</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Order</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Method</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Txn ID</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Total</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <span className="text-primary font-bold font-mono text-xs">#{order.orderNumber}</span>
                      <p className="text-slate-500 text-[10px]">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-xs">{order.customer?.profile?.fullName || order.customer?.email?.split("@")[0]}</p>
                      <p className="text-slate-500 text-[10px]">{order.customer?.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {order.paymentMethod?.logoUrl && <img src={order.paymentMethod.logoUrl} alt="" className="w-5 h-5 rounded object-contain" />}
                        <span className="text-slate-300 text-xs">{order.paymentMethod?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-slate-300">{order.transactionId || "—"}</span>
                      {order.senderNumber && <p className="text-slate-500 text-[10px]">{order.senderNumber}</p>}
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold text-xs">৳{order.paidAmount || "—"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white text-xs">৳{order.grandTotal.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded bg-slate-700 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleVerify(order.id, true)} className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleVerify(order.id, false)} className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
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
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details — Order #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400 text-xs">Method</p><p className="text-white font-medium">{selectedOrder.paymentMethod?.name || "—"}</p></div>
                <div><p className="text-slate-400 text-xs">Transaction ID</p><p className="text-white font-mono text-xs">{selectedOrder.transactionId || "—"}</p></div>
                <div><p className="text-slate-400 text-xs">Sender Number</p><p className="text-white">{selectedOrder.senderNumber || "—"}</p></div>
                <div><p className="text-slate-400 text-xs">Paid Amount</p><p className="text-emerald-400 font-bold">৳{selectedOrder.paidAmount || "—"}</p></div>
              </div>
              {selectedOrder.customerNote && (
                <div><p className="text-slate-400 text-xs mb-1">Customer Note</p><p className="text-white text-sm bg-slate-900 rounded p-2">{selectedOrder.customerNote}</p></div>
              )}
              {selectedOrder.paymentScreenshotUrl && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">Payment Screenshot</p>
                  <img src={selectedOrder.paymentScreenshotUrl} alt="Payment proof" className="w-full rounded-lg border border-slate-700 max-h-64 object-contain" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => handleVerify(selectedOrder.id, true)} disabled={verifying} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
                <Button onClick={() => handleVerify(selectedOrder.id, false)} disabled={verifying} variant="outline" className="flex-1 border-red-700 text-red-400 hover:bg-red-500/10">
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
