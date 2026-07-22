"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Loader2, CreditCard, RefreshCw, Upload, CheckCircle } from "lucide-react";
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
  const [form, setForm] = useState({ name: "", logoUrl: "", accountNumber: "", accountName: "", accountType: "", instructions: "", isActive: true });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/payment-methods");
      setMethods(data.data.paymentMethods || []);
    } catch { toast.error("Failed to load payment methods"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(f => ({ ...f, logoUrl: data.data.url }));
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) {
        await api.patch(`/payment-methods/${editTarget.id}`, form);
        toast.success("Payment method updated");
      } else {
        await api.post("/payment-methods", form);
        toast.success("Payment method created");
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
      await api.delete(`/payment-methods/${deleteTarget.id}`);
      toast.success("Deleted");
      setDeleteTarget(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setForm({ name: "", logoUrl: "", accountNumber: "", accountName: "", accountType: "", instructions: "", isActive: true });
    setEditTarget(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Payment Methods</h1>
          <p className="text-slate-400 text-sm mt-1">{methods.length} methods configured</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Method
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : methods.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-48 text-slate-400">
            <CreditCard className="h-10 w-10 mb-2 text-slate-600" /><p>No payment methods yet</p>
          </div>
        ) : methods.map(m => (
          <div key={m.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              {m.logoUrl ? (
                <img src={m.logoUrl} alt={m.name} className="w-12 h-12 rounded-xl object-contain bg-white p-1 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <p className="text-white font-bold">{m.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {m.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex gap-2"><span className="text-slate-500 text-xs min-w-20">Account:</span><span className="text-white text-xs font-mono">{m.accountNumber}</span></div>
              {m.accountName && <div className="flex gap-2"><span className="text-slate-500 text-xs min-w-20">Name:</span><span className="text-white text-xs">{m.accountName}</span></div>}
              {m.accountType && <div className="flex gap-2"><span className="text-slate-500 text-xs min-w-20">Type:</span><span className="text-white text-xs">{m.accountType}</span></div>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setForm({ name: m.name, logoUrl: m.logoUrl || "", accountNumber: m.accountNumber, accountName: m.accountName || "", accountType: m.accountType || "", instructions: m.instructions, isActive: m.isActive }); setEditTarget(m); setShowForm(true); }} className="flex-1 border-slate-600 text-slate-300 text-xs h-7">
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDeleteTarget(m)} className="border-red-800/50 text-red-400 hover:bg-red-500/10 text-xs h-7">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Payment Method" : "New Payment Method"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. bKash" className="bg-slate-900 border-slate-600 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Account Number *</Label>
                <Input value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} placeholder="01XXXXXXXXX" className="bg-slate-900 border-slate-600 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Account Name</Label>
                <Input value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} placeholder="Account holder name" className="bg-slate-900 border-slate-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Account Type</Label>
                <Input value={form.accountType} onChange={e => setForm(f => ({ ...f, accountType: e.target.value }))} placeholder="e.g. Personal, Merchant" className="bg-slate-900 border-slate-600 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Instructions *</Label>
              <Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Step by step payment instructions..." rows={3} className="bg-slate-900 border-slate-600 text-white resize-none" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Logo</Label>
              {form.logoUrl && <img src={form.logoUrl} alt="" className="w-12 h-12 rounded object-contain bg-white p-1" />}
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white text-sm border border-slate-600 rounded-lg px-3 py-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload Logo"}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
              </label>
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
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription className="text-slate-400">Delete <strong className="text-white">{deleteTarget?.name}</strong>?</DialogDescription>
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
