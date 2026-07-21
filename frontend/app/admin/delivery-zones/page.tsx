"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Loader2, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DeliveryZone {
  id: string;
  zoneName: string;
  charge: number;
  estDeliveryTime: string;
}

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<DeliveryZone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ zoneName: "", charge: "", estDeliveryTime: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/delivery-zones");
      setZones(data.data.deliveryZones || []);
    } catch {
      toast.error("Failed to load delivery zones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, charge: parseFloat(form.charge) };
      if (editTarget) {
        await api.patch(`/delivery-zones/${editTarget.id}`, payload);
        toast.success("Delivery zone updated");
      } else {
        await api.post("/delivery-zones", payload);
        toast.success("Delivery zone created");
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
      await api.delete(`/delivery-zones/${deleteTarget.id}`);
      toast.success("Zone deleted");
      setDeleteTarget(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Delivery Zones</h1>
          <p className="text-slate-400 text-sm mt-1">{zones.length} zones configured</p>
        </div>
        <Button onClick={() => { setForm({ zoneName: "", charge: "", estDeliveryTime: "" }); setEditTarget(null); setShowForm(true); }} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Zone
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : zones.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-48 text-slate-400">
            <Truck className="h-10 w-10 mb-2 text-slate-600" /><p>No delivery zones yet</p>
          </div>
        ) : zones.map(zone => (
          <div key={zone.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-white font-bold">{zone.zoneName}</p>
                <p className="text-slate-400 text-sm">ETA: {zone.estDeliveryTime}</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center mb-4">
              <p className="text-slate-400 text-xs">Delivery Charge</p>
              <p className="text-white font-black text-2xl">৳{zone.charge}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setForm({ zoneName: zone.zoneName, charge: String(zone.charge), estDeliveryTime: zone.estDeliveryTime }); setEditTarget(zone); setShowForm(true); }} className="flex-1 border-slate-600 text-slate-300 hover:text-white text-xs h-7">
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDeleteTarget(zone)} className="border-red-800/50 text-red-400 hover:bg-red-500/10 text-xs h-7">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Delivery Zone" : "New Delivery Zone"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Zone Name *</Label>
              <Input value={form.zoneName} onChange={e => setForm(f => ({ ...f, zoneName: e.target.value }))} placeholder="e.g. Dhaka City" className="bg-slate-900 border-slate-600 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Delivery Charge (৳) *</Label>
              <Input type="number" step="0.01" value={form.charge} onChange={e => setForm(f => ({ ...f, charge: e.target.value }))} placeholder="e.g. 60" className="bg-slate-900 border-slate-600 text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Est. Delivery Time *</Label>
              <Input value={form.estDeliveryTime} onChange={e => setForm(f => ({ ...f, estDeliveryTime: e.target.value }))} placeholder="e.g. 2-4 hours" className="bg-slate-900 border-slate-600 text-white" required />
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
            <DialogTitle>Delete Zone</DialogTitle>
            <DialogDescription className="text-slate-400">Delete <strong className="text-white">{deleteTarget?.zoneName}</strong>?</DialogDescription>
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
