"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Mail, RefreshCw, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Subscriber { id: string; email: string; createdAt: string; }

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/newsletter");
      setSubscribers(data.data.subscribers || []);
    } catch { toast.error("Failed to load subscribers"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/newsletter/${deleteTarget.id}`);
      toast.success("Subscriber removed"); setDeleteTarget(null); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Delete failed"); } finally { setDeleting(false); }
  };

  const exportCSV = () => {
    const csv = ["Email,Date Subscribed", ...filtered.map(s => `${s.email},${new Date(s.createdAt).toLocaleDateString()}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "newsletter-subscribers.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Newsletter</h1>
          <p className="text-slate-400 text-sm mt-1">{subscribers.length} subscribers</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emails..." className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <Button variant="outline" onClick={fetch} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Mail className="h-10 w-10 mb-2 text-slate-600" /><p>No subscribers yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">#</th>
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Subscribed</th>
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-4"><span className="text-slate-500 text-xs">{i + 1}</span></td>
                  <td className="p-4"><span className="text-white text-xs">{s.email}</span></td>
                  <td className="p-4"><span className="text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</span></td>
                  <td className="p-4">
                    <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded bg-slate-700 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Remove Subscriber</DialogTitle><DialogDescription className="text-slate-400">Remove <strong className="text-white">{deleteTarget?.email}</strong> from the newsletter?</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-slate-600 text-slate-300">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">{deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Remove</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
