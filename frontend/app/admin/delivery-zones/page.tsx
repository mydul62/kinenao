"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Truck, RefreshCw } from "lucide-react";
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

  const fetchZones = useCallback(async () => {
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

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, charge: parseFloat(form.charge) || 0 };
      if (editTarget) {
        await api.patch(`/delivery-zones/${editTarget.id}`, payload);
        toast.success("Delivery zone updated successfully");
      } else {
        await api.post("/delivery-zones", payload);
        toast.success("Delivery zone created successfully");
      }
      setShowForm(false);
      fetchZones();
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
      toast.success("Delivery zone deleted successfully");
      setDeleteTarget(null);
      fetchZones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Delivery Zones & Charges
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {zones.length} Zones
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Configure regional shipping fees, courier coverage, and estimated delivery times.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ zoneName: "", charge: "", estDeliveryTime: "" });
            setEditTarget(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Delivery Zone
        </button>
      </div>

      {/* Grid of Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
          </div>
        ) : zones.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white rounded-[24px] border border-[#E5E7EB]">
            <Truck className="h-12 w-12 mb-3 text-slate-300" />
            <p className="font-bold text-slate-800 text-base">No delivery zones configured</p>
          </div>
        ) : (
          zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-[#6C5CE7]" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-extrabold text-base">{zone.zoneName}</h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">
                      Estimated ETA: {zone.estDeliveryTime}
                    </p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 text-center mb-5">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Shipping Charge</p>
                  <p className="text-slate-900 font-black text-2xl mt-1">৳{zone.charge}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForm({
                      zoneName: zone.zoneName,
                      charge: String(zone.charge),
                      estDeliveryTime: zone.estDeliveryTime,
                    });
                    setEditTarget(zone);
                    setShowForm(true);
                  }}
                  className="flex-1 border-[#E5E7EB] text-slate-700 hover:bg-purple-50 hover:text-[#6C5CE7] text-xs font-semibold rounded-xl h-9"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteTarget(zone)}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl h-9"
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
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">
              {editTarget ? "Edit Delivery Zone" : "Create Delivery Zone"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Zone Name *</Label>
              <Input
                value={form.zoneName}
                onChange={(e) => setForm((f) => ({ ...f, zoneName: e.target.value }))}
                placeholder="e.g. Inside Dhaka Metropolitan, Chittagong Division"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Shipping Fee (৳) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.charge}
                onChange={(e) => setForm((f) => ({ ...f, charge: e.target.value }))}
                placeholder="60"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Estimated Delivery Time *</Label>
              <Input
                value={form.estDeliveryTime}
                onChange={(e) => setForm((f) => ({ ...f, estDeliveryTime: e.target.value }))}
                placeholder="e.g. 24-48 Hours"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                required
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
                {editTarget ? "Update Zone" : "Create Zone"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Delete Delivery Zone</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.zoneName}</strong>?
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
