"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <p className="text-slate-400">Order not found</p>
        <Button onClick={() => router.back()} className="mt-4 bg-primary text-white">Go Back</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.grandTotal - order.deliveryCharge;

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 sm:p-12 font-sans relative">
      {/* Control bar - hidden during print */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 print:hidden">
        <Button variant="outline" onClick={() => router.back()} className="text-slate-600 border-slate-300 hover:bg-slate-100">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Order
        </Button>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white">
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </Button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto border border-slate-200 p-8 rounded-lg shadow-sm print:border-0 print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">KN</span>
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">KineNao</span>
            </div>
            <p className="text-xs text-slate-500">Fresh Groceries Delivered Fast</p>
            <p className="text-xs text-slate-500 mt-1">Dhaka, Bangladesh</p>
            <p className="text-xs text-slate-500">support@kinenao.com</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">INVOICE</h1>
            <p className="text-xs font-mono text-slate-500 mt-1">Invoice #: {order.orderNumber}</p>
            <p className="text-xs text-slate-500 mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Customer & Order details */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bill To:</h2>
            <p className="font-bold text-sm text-slate-800">{order.customer?.profile?.fullName || "Valued Customer"}</p>
            <p className="text-xs text-slate-600 mt-1">{order.customer?.email}</p>
            {order.customer?.profile?.phoneNumber && (
              <p className="text-xs text-slate-600">{order.customer.profile.phoneNumber}</p>
            )}
            {order.deliveryAddress ? (
              <p className="text-xs text-slate-500 mt-2">
                {order.deliveryAddress.street}, {order.deliveryAddress.area}, {order.deliveryAddress.city}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-2">No Address Specified</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Details:</h2>
            <p className="text-xs text-slate-700">Payment Method: <span className="font-semibold">{order.paymentMethod?.name || "Manual Payment"}</span></p>
            {order.transactionId && <p className="text-xs text-slate-700 font-mono mt-0.5">Txn: {order.transactionId}</p>}
            {order.senderNumber && <p className="text-xs text-slate-700 mt-0.5">Sender: {order.senderNumber}</p>}
            {order.paidAmount && <p className="text-xs text-slate-700 mt-0.5">Amount Paid: <span className="font-bold">৳{order.paidAmount}</span></p>}
          </div>
        </div>

        {/* Product Items Table */}
        <div className="mb-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5">Product</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.orderItems?.map((item: any) => (
                <tr key={item.id} className="text-slate-800">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-sm text-slate-800">{item.product?.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">SKU: {item.product?.sku || "—"}</p>
                  </td>
                  <td className="py-3 text-center text-sm">{item.quantity}</td>
                  <td className="py-3 text-right text-sm">৳{item.price.toLocaleString()}</td>
                  <td className="py-3 text-right text-sm font-semibold">৳{(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Charge</span>
              <span>৳{order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
              <span>Grand Total</span>
              <span>৳{order.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400">
          <p>Thank you for shopping with KineNao!</p>
          <p className="mt-1">This is a system generated invoice.</p>
        </div>
      </div>
    </div>
  );
}
