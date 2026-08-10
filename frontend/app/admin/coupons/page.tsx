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

  const typeLabel = (t: string) => (t === "FIXED" ? "Fixed ৳" : t === "PERCENTAGE" ? "% Off" : "Free Delivery");
  const typeColor = (t: string) =>
    t === "FIXED"
      ? "bg-[#F1F6F2] text-[#123524]"
      : t === "PERCENTAGE"
      ? "bg-[#E4EEE7] text-[#123524]"
      : "bg-[#E6F5EB] text-[#1F8A4C]";

  const activeCount = coupons.filter((c) => c.isActive && new Date(c.expiresAt) >= new Date()).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const percentageCount = coupons.filter((c) => c.type === "PERCENTAGE").length;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Promotional Coupons
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {coupons.length} coupons
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Create discount promo codes, usage limits, and campaign expiration dates.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New Coupon
        </button>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Coupons</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {coupons.length}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Configured codes
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Active Promo</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {activeCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Available to customers
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Redemptions</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <span className="font-extrabold text-[10px]">#</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {totalRedemptions}
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              Times redeemed
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Percent Off</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {percentageCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Discount campaigns
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E4E8E4] shadow-xs">
        <div className="flex items-center gap-2 bg-[#F5F7F5] px-3.5 py-2 rounded-xl border border-[#E4E8E4] w-full sm:flex-1">
          <Search className="w-4 h-4 text-[#8B958D] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by promo code..."
            className="w-full text-xs text-[#131914] placeholder:text-[#8B958D] bg-transparent border-0 focus:outline-none"
          />
        </div>

        <Button
          variant="outline"
          onClick={fetchCoupons}
          size="sm"
          className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer w-full sm:w-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#5C685F]" />
          Refresh
        </Button>
      </div>

      {/* 4. Coupons Table */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-[#5C685F]">
              <Percent className="h-12 w-12 mb-3 text-[#8B958D]" />
              <p className="font-bold text-[#131914] text-base">No coupons found</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E8E4] bg-[#F1F6F2] text-[#5C685F] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">PROMO CODE</th>
                  <th className="py-3 px-4">DISCOUNT TYPE</th>
                  <th className="py-3 px-4">VALUE</th>
                  <th className="py-3 px-4">MIN SPEND</th>
                  <th className="py-3 px-4">USAGE LIMIT</th>
                  <th className="py-3 px-4">EXPIRES ON</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8E4]/60 font-medium text-[#131914]">
                {filtered.map((coupon) => {
                  const expired = new Date(coupon.expiresAt) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-[#F1F6F2]/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs bg-[#E4EEE7] text-[#123524] px-2.5 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${typeColor(coupon.type)}`}>
                          {typeLabel(coupon.type)}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-[#131914] font-['Manrope']">
                        {coupon.type === "FREE_DELIVERY" ? "Free Delivery" : coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `৳${coupon.value}`}
                      </td>

                      <td className="py-3 px-4 text-[#5C685F] font-semibold">৳{coupon.minPurchase}</td>

                      <td className="py-3 px-4 text-[#5C685F]">
                        {coupon.usageCount} / {coupon.usageLimit}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold ${expired ? "text-[#C23B3B]" : "text-[#5C685F]"}`}>
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            expired
                              ? "bg-[#FBEAEA] text-[#C23B3B]"
                              : coupon.isActive
                              ? "bg-[#E6F5EB] text-[#1F8A4C]"
                              : "bg-[#F5F7F5] text-[#5C685F]"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {expired ? "Expired" : coupon.isActive ? "Live" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(coupon)}
                            className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#123524] hover:bg-[#F1F6F2] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(coupon)}
                            className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#C23B3B] hover:bg-[#FBEAEA] transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                {editTarget ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">Delete Coupon</DialogTitle>
            <DialogDescription className="text-[#5C685F] text-xs mt-1">
              Are you sure you want to delete <strong className="text-[#131914]">{deleteTarget?.code}</strong>?
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
