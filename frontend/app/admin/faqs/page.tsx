"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface FAQ { id: string; question: string; answer: string; isActive: boolean; sortOrder: number; }

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<FAQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", isActive: true, sortOrder: 0 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/faqs");
      setFaqs(data.data.faqs || []);
    } catch { toast.error("Failed to load FAQs"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) { await api.patch(`/faqs/${editTarget.id}`, form); toast.success("FAQ updated"); }
      else { await api.post("/faqs", form); toast.success("FAQ created"); }
      setShowForm(false); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed"); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/faqs/${deleteTarget.id}`);
      toast.success("FAQ deleted"); setDeleteTarget(null); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Delete failed"); } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-white">FAQs</h1><p className="text-slate-400 text-sm mt-1">{faqs.length} FAQs</p></div>
        <Button onClick={() => { setForm({ question: "", answer: "", isActive: true, sortOrder: faqs.length }); setEditTarget(null); setShowForm(true); }} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add FAQ
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-800 border border-slate-700 rounded-xl">
            <HelpCircle className="h-10 w-10 mb-2 text-slate-600" /><p>No FAQs yet</p>
          </div>
        ) : faqs.map((faq, i) => (
          <div key={faq.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary font-black text-xs">Q{i + 1}</span>
                  <span className={`text-[10px] font-bold px-1.5 rounded ${faq.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{faq.isActive ? "Active" : "Hidden"}</span>
                </div>
                <p className="text-white font-semibold text-sm mb-2">{faq.question}</p>
                <p className="text-slate-400 text-xs line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => { setForm({ question: faq.question, answer: faq.answer, isActive: faq.isActive, sortOrder: faq.sortOrder }); setEditTarget(faq); setShowForm(true); }} className="p-1.5 rounded bg-slate-700 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDeleteTarget(faq)} className="p-1.5 rounded bg-slate-700 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editTarget ? "Edit FAQ" : "New FAQ"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Question *</Label>
              <Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Enter question..." className="bg-slate-900 border-slate-600 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Answer *</Label>
              <Textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Enter answer..." rows={4} className="bg-slate-900 border-slate-600 text-white resize-none" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) }))} className="bg-slate-900 border-slate-600 text-white" />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label className="text-slate-300 text-sm">Active</Label>
                <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              </div>
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
          <DialogHeader><DialogTitle>Delete FAQ</DialogTitle><DialogDescription className="text-slate-400">Delete this FAQ entry?</DialogDescription></DialogHeader>
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
