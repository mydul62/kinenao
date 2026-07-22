"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, MessageSquare, Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Testimonial { id: string; customerName: string; avatarUrl?: string; message: string; rating: number; isActive: boolean; sortOrder: number; }

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ customerName: "", avatarUrl: "", message: "", rating: 5, isActive: true, sortOrder: 0 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/testimonials");
      setItems(data.data.testimonials || []);
    } catch { toast.error("Failed to load testimonials"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(f => ({ ...f, avatarUrl: data.data.url }));
    } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) { await api.patch(`/testimonials/${editTarget.id}`, form); toast.success("Updated"); }
      else { await api.post("/testimonials", form); toast.success("Created"); }
      setShowForm(false); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed"); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/testimonials/${deleteTarget.id}`);
      toast.success("Deleted"); setDeleteTarget(null); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Delete failed"); } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-white">Testimonials</h1><p className="text-slate-400 text-sm mt-1">{items.length} testimonials</p></div>
        <Button onClick={() => { setForm({ customerName: "", avatarUrl: "", message: "", rating: 5, isActive: true, sortOrder: items.length }); setEditTarget(null); setShowForm(true); }} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-800 border border-slate-700 rounded-xl">
            <MessageSquare className="h-10 w-10 mb-2 text-slate-600" /><p>No testimonials yet</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              {item.avatarUrl ? (
                <img src={item.avatarUrl} alt={item.customerName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{item.customerName.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-sm">{item.customerName}</p>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                  ))}
                </div>
              </div>
              <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${item.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {item.isActive ? "Active" : "Hidden"}
              </span>
            </div>
            <p className="text-slate-400 text-xs line-clamp-3 mb-4">{item.message}</p>
            <div className="flex gap-2 pt-3 border-t border-slate-700">
              <Button size="sm" variant="outline" onClick={() => { setForm({ customerName: item.customerName, avatarUrl: item.avatarUrl || "", message: item.message, rating: item.rating, isActive: item.isActive, sortOrder: item.sortOrder }); setEditTarget(item); setShowForm(true); }} className="flex-1 border-slate-600 text-slate-300 text-xs h-7">
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDeleteTarget(item)} className="border-red-800/50 text-red-400 hover:bg-red-500/10 text-xs h-7">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Testimonial" : "New Testimonial"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Customer Name *</Label>
              <Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="John Doe" className="bg-slate-900 border-slate-600 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Message *</Label>
              <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Customer testimonial..." rows={3} className="bg-slate-900 border-slate-600 text-white resize-none" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))} className="p-1">
                    <Star className={`h-5 w-5 ${n <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Avatar</Label>
              {form.avatarUrl && <img src={form.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />}
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white text-sm border border-slate-600 rounded-lg px-3 py-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload Avatar"}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
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
          <DialogHeader><DialogTitle>Delete Testimonial</DialogTitle><DialogDescription className="text-slate-400">Delete testimonial by <strong className="text-white">{deleteTarget?.customerName}</strong>?</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-slate-600 text-slate-300">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">{deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
