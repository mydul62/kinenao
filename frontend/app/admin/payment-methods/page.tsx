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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Payment Gateways & Accounts
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {methods.length} Gateways
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Configure mobile banking (bKash, Nagad, Rocket), bank accounts, and COD options.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Payment Method
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
          </div>
        ) : methods.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white rounded-[24px] border border-[#E5E7EB]">
            <CreditCard className="h-12 w-12 mb-3 text-slate-300" />
            <p className="font-bold text-slate-800 text-base">No payment methods configured</p>
          </div>
        ) : (
          methods.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  {m.logoUrl ? (
                    <img
                      src={m.logoUrl}
                      alt={m.name}
                      className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                      <CreditCard className="h-6 w-6 text-[#6C5CE7]" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-slate-900 font-extrabold text-base">{m.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        m.isActive
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {m.isActive ? "Active Gateway" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3 space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Account Number:</span>
                    <span className="text-slate-900 font-mono font-bold">{m.accountNumber}</span>
                  </div>
                  {m.accountName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Account Name:</span>
                      <span className="text-slate-800 font-semibold">{m.accountName}</span>
                    </div>
                  )}
                  {m.accountType && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Type:</span>
                      <span className="text-slate-800 font-semibold">{m.accountType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
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
                  className="flex-1 border-[#E5E7EB] text-slate-700 hover:bg-purple-50 hover:text-[#6C5CE7] text-xs font-semibold rounded-xl h-8"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteTarget(m)}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl h-8"
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
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">
              {editTarget ? "Edit Payment Method" : "Create Payment Method"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. bKash Personal"
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Account Number *</Label>
                <Input
                  value={form.accountNumber}
                  onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  placeholder="01700000000"
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-mono rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Account Holder</Label>
                <Input
                  value={form.accountName}
                  onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                  placeholder="KineNao Ltd"
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Account Type</Label>
                <Input
                  value={form.accountType}
                  onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value }))}
                  placeholder="Personal / Merchant"
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Payment Instructions *</Label>
              <Textarea
                value={form.instructions}
                onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                placeholder="Send money to this bKash number and enter TrxID..."
                rows={3}
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl text-xs resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Method Logo</Label>
              {form.logoUrl && (
                <img
                  src={form.logoUrl}
                  alt=""
                  className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 mb-2"
                />
              )}
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-[#6C5CE7] text-xs font-semibold border border-[#E5E7EB] bg-[#F8FAFC] rounded-xl px-4 py-2.5 transition-colors">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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

            <div className="flex items-center justify-between py-2 border-t border-[#E5E7EB]">
              <Label className="text-slate-800 text-xs font-bold">Active Status</Label>
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
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white text-xs font-semibold rounded-xl"
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
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Delete Method</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
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
