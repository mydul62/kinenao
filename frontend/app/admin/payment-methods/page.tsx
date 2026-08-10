"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, CreditCard, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PaymentMethod {
  id: string;
  name: string;
  logoUrl?: string;
  accountNumber: string;
  accountName?: string;
  accountType?: string;
  instructions: string;
  isActive: boolean;
}

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    accountNumber: "",
    accountName: "",
    accountType: "",
    instructions: "",
    isActive: true,
  });

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/payment-methods");
      setMethods(data.data.paymentMethods || []);
    } catch {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, logoUrl: data.data.url }));
      toast.success("Logo uploaded successfully");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) {
        await api.patch(`/payment-methods/${editTarget.id}`, form);
        toast.success("Payment method updated successfully");
      } else {
        await api.post("/payment-methods", form);
        toast.success("Payment method created successfully");
      }
      setShowForm(false);
      fetchMethods();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/payment-methods/${deleteTarget.id}`);
      toast.success("Deleted successfully");
      setDeleteTarget(null);
      fetchMethods();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setForm({
      name: "",
      logoUrl: "",
      accountNumber: "",
      accountName: "",
      accountType: "",
      instructions: "",
      isActive: true,
    });
    setEditTarget(null);
    setShowForm(true);
  };

  const activeMethods = methods.filter((m) => m.isActive).length;
  const mobileBankingCount = methods.filter((m) =>
    m.name.toLowerCase().includes("bkash") ||
    m.name.toLowerCase().includes("nagad") ||
    m.name.toLowerCase().includes("rocket")
  ).length;
  const codCount = methods.filter((m) =>
    m.name.toLowerCase().includes("cash") || m.name.toLowerCase().includes("cod")
  ).length;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Payment Methods
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {methods.length} gateways
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Configure mobile banking (bKash, Nagad, Rocket), bank accounts, and COD options.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Payment Method
        </button>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Configured Gateways</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {methods.length}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Total payment rails
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Active In Checkout</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {activeMethods}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Available to customers
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">MFS Gateways</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <span className="font-extrabold text-[10px]">MFS</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {mobileBankingCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              bKash / Nagad / Rocket
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Cash On Delivery</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50 font-bold text-xs">
              ৳
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {codCount > 0 ? "Active" : "Standard"}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Doorstep payment
            </p>
          </div>
        </div>
      </div>

      {/* 3. Grid of Payment Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
          </div>
        ) : methods.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-[#5C685F] bg-white rounded-2xl border border-[#E4E8E4]">
            <CreditCard className="h-12 w-12 mb-3 text-[#8B958D]" />
            <p className="font-bold text-[#131914] text-base">No payment methods configured</p>
          </div>
        ) : (
          methods.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs hover:border-[#123524]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {m.logoUrl ? (
                    <img
                      src={m.logoUrl}
                      alt={m.name}
                      className="w-11 h-11 rounded-xl object-contain bg-[#F5F7F5] p-1 border border-[#E4E8E4] shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 bg-[#F1F6F2] rounded-xl flex items-center justify-center shrink-0 border border-[#E4EEE7]">
                      <CreditCard className="h-5 w-5 text-[#123524]" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-[#131914] font-extrabold text-sm font-['Manrope']">{m.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.isActive
                          ? "bg-[#E6F5EB] text-[#1F8A4C]"
                          : "bg-[#F5F7F5] text-[#5C685F]"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {m.isActive ? "• Live Gateway" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl p-3 space-y-1.5 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-[#5C685F] font-medium">Account Number:</span>
                    <span className="text-[#131914] font-mono font-bold">{m.accountNumber}</span>
                  </div>
                  {m.accountName && (
                    <div className="flex justify-between">
                      <span className="text-[#5C685F] font-medium">Account Name:</span>
                      <span className="text-[#131914] font-semibold">{m.accountName}</span>
                    </div>
                  )}
                  {m.accountType && (
                    <div className="flex justify-between">
                      <span className="text-[#5C685F] font-medium">Type:</span>
                      <span className="text-[#131914] font-semibold">{m.accountType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#E4E8E4]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForm({
                      name: m.name,
                      logoUrl: m.logoUrl || "",
                      accountNumber: m.accountNumber,
                      accountName: m.accountName || "",
                      accountType: m.accountType || "",
                      instructions: m.instructions,
                      isActive: m.isActive,
                    });
                    setEditTarget(m);
                    setShowForm(true);
                  }}
                  className="flex-1 border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] text-xs font-semibold rounded-xl h-8 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 mr-1 text-[#5C685F]" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteTarget(m)}
                  className="border-[#E4E8E4] text-[#C23B3B] hover:bg-[#FBEAEA] text-xs font-semibold rounded-xl h-8 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">
              {editTarget ? "Edit Payment Method" : "Create Payment Method"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[#131914] text-xs font-bold">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. bKash Personal"
                  className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#131914] text-xs font-bold">Account Number *</Label>
                <Input
                  value={form.accountNumber}
                  onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  placeholder="01700000000"
                  className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] font-mono rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#131914] text-xs font-bold">Account Holder</Label>
                <Input
                  value={form.accountName}
                  onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                  placeholder="KineNao Ltd"
                  className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#131914] text-xs font-bold">Account Type</Label>
                <Input
                  value={form.accountType}
                  onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value }))}
                  placeholder="Personal / Merchant"
                  className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Payment Instructions *</Label>
              <Textarea
                value={form.instructions}
                onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                placeholder="Send money to this bKash number and enter TrxID..."
                rows={3}
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Method Logo</Label>
              {form.logoUrl && (
                <img
                  src={form.logoUrl}
                  alt=""
                  className="w-12 h-12 rounded-xl object-contain bg-[#F5F7F5] p-1 border border-[#E4E8E4] mb-2"
                />
              )}
              <label className="flex items-center gap-2 cursor-pointer text-[#5C685F] hover:text-[#123524] text-xs font-semibold border border-[#E4E8E4] bg-[#F5F7F5] rounded-xl px-4 py-2.5 transition-colors">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-[#123524]" />}
                {uploading ? "Uploading..." : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-[#E4E8E4]">
              <Label className="text-[#131914] text-xs font-bold">Active Status</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-[#E4E8E4] text-[#131914] hover:bg-[#F1F6F2] text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editTarget ? "Update Method" : "Create Method"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">Delete Method</DialogTitle>
            <DialogDescription className="text-[#5C685F] text-xs mt-1">
              Are you sure you want to delete <strong className="text-[#131914]">{deleteTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-[#E4E8E4] text-[#131914] hover:bg-[#F1F6F2] text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[#C23B3B] hover:bg-[#a82e2e] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
