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
  const [form, setForm] = useState({ code: "", type: "FIXED", value: "", minPurchase: "0", usageLimit: "1", expiresAt: "", isActive: true });

  const fetch = useCallback(async () => {
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

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setForm({ code: "", type: "FIXED", value: "", minPurchase: "0", usageLimit: "1", expiresAt: "", isActive: true });
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
      expiresAt: coupon.expiresAt.slice(0, 10),
      isActive: coupon.isActive
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
        value: parseFloat(form.value),
        minPurchase: parseFloat(form.minPurchase),
        usageLimit: parseInt(form.usageLimit),
        expiresAt: new Date(form.expiresAt).toISOString(),
      };
      if (editTarget) {
        await api.patch(`/coupons/${editTarget.id}`, payload);
        toast.success("Coupon updated");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created");
      }
      setShowForm(false);
      fetch();
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
      toast.success("Coupon deleted");
      setDeleteTarget(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const typeLabel = (t: string) => t === "FIXED" ? "Fixed ৳" : t === "PERCENTAGE" ? "%" : "Free Delivery";
  const typeColor = (t: string) => t === "FIXED" ? "bg-blue-500/10 text-blue-400" : t === "PERCENTAGE" ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Coupons</h1>
          <p className="text-slate-400 text-sm mt-1">{coupons.length} total coupons</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Coupon
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupon code..." className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <Button variant="outline" onClick={fetch} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Percent className="h-10 w-10 mb-2 text-slate-600" /><p>No coupons found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Code</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Type</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Value</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Min Purchase</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Usage</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Expires</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(coupon => {
                  const expired = new Date(coupon.expiresAt) < new Date();
                  return (
                    <tr key={coupon.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4"><span className="font-mono text-white font-bold text-xs bg-slate-700 px-2 py-1 rounded">{coupon.code}</span></td>
                      <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeColor(coupon.type)}`}>{typeLabel(coupon.type)}</span></td>
                      <td className="p-4"><span className="text-white font-bold text-xs">{coupon.type === "FREE_DELIVERY" ? "—" : coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `৳${coupon.value}`}</span></td>
                      <td className="p-4"><span className="text-slate-400 text-xs">৳{coupon.minPurchase}</span></td>
                      <td className="p-4"><span className="text-slate-400 text-xs">{coupon.usageCount}/{coupon.usageLimit}</span></td>
                      <td className="p-4"><span className={`text-xs ${expired ? "text-red-400" : "text-slate-400"}`}>{new Date(coupon.expiresAt).toLocaleDateString()}</span></td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${coupon.isActive && !expired ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                          {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(coupon)} className="p-1.5 rounded bg-slate-700 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteTarget(coupon)} className="p-1.5 rounded bg-slate-700 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Coupon" : "New Coupon"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Coupon Code *</Label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" className="bg-slate-900 border-slate-600 text-white font-mono" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Type *</Label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 text-sm">
                  <option value="FIXED">Fixed Amount</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FREE_DELIVERY">Free Delivery</option>
                </select>
              </div>
              {form.type !== "FREE_DELIVERY" && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Value *</Label>
                  <Input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === "PERCENTAGE" ? "%" : "৳"} className="bg-slate-900 border-slate-600 text-white" required />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Min Purchase (৳)</Label>
                <Input type="number" step="0.01" value={form.minPurchase} onChange={e => setForm(f => ({ ...f, minPurchase: e.target.value }))} className="bg-slate-900 border-slate-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Usage Limit</Label>
                <Input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="bg-slate-900 border-slate-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Expires On *</Label>
                <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="bg-slate-900 border-slate-600 text-white" required />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">Active</Label>
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-600 text-slate-300">Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editTarget ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription className="text-slate-400">Delete coupon <strong className="text-white">{deleteTarget?.code}</strong>?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-slate-600 text-slate-300">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
