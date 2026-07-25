"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Loader2, Percent, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Coupon {
  id: string;
  code: string;
  type: "FIXED" | "PERCENTAGE" | "FREE_DELIVERY";
  value: number;
  minPurchase: number;
  usageLimit: number;
  usageCount: number;
  expiresAt: string;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "FIXED",
    value: "",
    minPurchase: "0",
    usageLimit: "100",
    expiresAt: "",
    isActive: true,
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data.data.coupons || []);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setForm({
      code: "",
      type: "FIXED",
      value: "",
      minPurchase: "0",
      usageLimit: "100",
      expiresAt: "",
      isActive: true,
    });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minPurchase: String(coupon.minPurchase),
      usageLimit: String(coupon.usageLimit),
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      isActive: coupon.isActive,
    });
    setEditTarget(coupon);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value) || 0,
        minPurchase: parseFloat(form.minPurchase) || 0,
        usageLimit: parseInt(form.usageLimit) || 1,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      };
      if (editTarget) {
        await api.patch(`/coupons/${editTarget.id}`, payload);
        toast.success("Coupon updated successfully");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created successfully");
      }
      setShowForm(false);
      fetchCoupons();
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
      await api.delete(`/coupons/${deleteTarget.id}`);
      toast.success("Coupon deleted successfully");
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const typeLabel = (t: string) => (t === "FIXED" ? "Fixed ৳" : t === "PERCENTAGE" ? "% Off" : "Free Shipping");
  const typeColor = (t: string) =>
    t === "FIXED"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : t === "PERCENTAGE"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Promotional Coupons
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {coupons.length} Coupons
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Create discount promo codes, usage limits, and campaign expiration dates.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Add New Coupon
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by promo code..."
            className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all"
          />
        </div>

        <Button
          variant="outline"
          onClick={fetchCoupons}
          size="sm"
          className="border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refresh
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Percent className="h-12 w-12 mb-3 text-slate-300" />
              <p className="font-bold text-slate-800 text-base">No coupons found</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-6">Promo Code</th>
                  <th className="py-4 px-4">Discount Type</th>
                  <th className="py-4 px-4">Value</th>
                  <th className="py-4 px-4">Min Spend</th>
                  <th className="py-4 px-4">Usage Limit</th>
                  <th className="py-4 px-4">Expires On</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map((coupon) => {
                  const expired = new Date(coupon.expiresAt) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-slate-900 font-extrabold text-xs bg-purple-50 text-[#6C5CE7] border border-purple-200 px-3 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeColor(coupon.type)}`}>
                          {typeLabel(coupon.type)}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        {coupon.type === "FREE_DELIVERY" ? "Free Delivery" : coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `৳${coupon.value}`}
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-semibold">৳{coupon.minPurchase}</td>

                      <td className="py-4 px-4 text-slate-600 font-semibold">
                        {coupon.usageCount} / {coupon.usageLimit}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`text-xs font-semibold ${expired ? "text-rose-600" : "text-slate-600"}`}>
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            expired
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : coupon.isActive
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#6C5CE7]/10 text-slate-600 hover:text-[#6C5CE7] transition-all"
                            title="Edit coupon"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(coupon)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-all"
                            title="Delete coupon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">
              {editTarget ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Promo Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. BEAUTY20"
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-mono rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Discount Type *</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] text-slate-900 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold focus:outline-none"
                >
                  <option value="FIXED">Fixed Amount (৳)</option>
                  <option value="PERCENTAGE">Percentage (% Off)</option>
                  <option value="FREE_DELIVERY">Free Shipping</option>
                </select>
              </div>

              {form.type !== "FREE_DELIVERY" && (
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-bold uppercase">Discount Value *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder={form.type === "PERCENTAGE" ? "20" : "500"}
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Min Order Spend (৳)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.minPurchase}
                  onChange={(e) => setForm((f) => ({ ...f, minPurchase: e.target.value }))}
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Usage Limit</Label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Expiration Date *</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-[#E5E7EB]">
              <Label className="text-slate-800 text-xs font-bold">Active Campaign Status</Label>
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
                {editTarget ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Delete Coupon</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.code}</strong>?
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
