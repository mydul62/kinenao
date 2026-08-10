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

  const dhakaZone = zones.find((z) => z.zoneName.toLowerCase().includes("dhaka"));
  const outsideZone = zones.find((z) => !z.zoneName.toLowerCase().includes("dhaka"));

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Delivery Zones
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {zones.length} zones
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Configure regional shipping fees, courier coverage, and estimated delivery times.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ zoneName: "", charge: "", estDeliveryTime: "" });
            setEditTarget(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Delivery Zone
        </button>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Covered Zones</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {zones.length}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Nationwide routes
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Inside Dhaka Metro</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50 font-bold text-xs">
              ৳
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              ৳{dhakaZone ? dhakaZone.charge : 60}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              {dhakaZone?.estDeliveryTime || "24-48 Hours"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Outside Dhaka</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7] font-bold text-xs">
              ৳
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              ৳{outsideZone ? outsideZone.charge : 120}
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              {outsideZone?.estDeliveryTime || "3-5 Business Days"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Integrated Couriers</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              Steadfast
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              API Auto-dispatch
            </p>
          </div>
        </div>
      </div>

      {/* 3. Grid of Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
          </div>
        ) : zones.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-[#5C685F] bg-white rounded-2xl border border-[#E4E8E4]">
            <Truck className="h-12 w-12 mb-3 text-[#8B958D]" />
            <p className="font-bold text-[#131914] text-base">No delivery zones configured</p>
          </div>
        ) : (
          zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs hover:border-[#123524]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3 mb-3.5">
                  <div className="w-10 h-10 bg-[#F1F6F2] rounded-xl flex items-center justify-center shrink-0 border border-[#E4EEE7]">
                    <Truck className="h-5 w-5 text-[#123524]" />
                  </div>
                  <div>
                    <h3 className="text-[#131914] font-extrabold text-sm font-['Manrope']">{zone.zoneName}</h3>
                    <p className="text-[#5C685F] text-xs mt-0.5 font-medium">
                      Estimated ETA: {zone.estDeliveryTime}
                    </p>
                  </div>
                </div>

                <div className="bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl p-3 text-center mb-4">
                  <p className="text-[#5C685F] text-[10px] font-bold uppercase tracking-wider">Shipping Charge</p>
                  <p className="text-[#131914] font-extrabold text-2xl mt-0.5 font-['Manrope']">৳{zone.charge}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#E4E8E4]">
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
                  className="flex-1 border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] text-xs font-semibold rounded-xl h-8 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 mr-1 text-[#5C685F]" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteTarget(zone)}
                  className="border-[#E4E8E4] text-[#C23B3B] hover:bg-[#FBEAEA] text-xs font-semibold rounded-xl h-8 cursor-pointer"
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
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">
              {editTarget ? "Edit Delivery Zone" : "Create Delivery Zone"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Zone Name *</Label>
              <Input
                value={form.zoneName}
                onChange={(e) => setForm((f) => ({ ...f, zoneName: e.target.value }))}
                placeholder="e.g. Inside Dhaka Metropolitan, Chittagong Division"
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Shipping Fee (৳) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.charge}
                onChange={(e) => setForm((f) => ({ ...f, charge: e.target.value }))}
                placeholder="60"
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Estimated Delivery Time *</Label>
              <Input
                value={form.estDeliveryTime}
                onChange={(e) => setForm((f) => ({ ...f, estDeliveryTime: e.target.value }))}
                placeholder="e.g. 24-48 Hours"
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
                required
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
                {editTarget ? "Update Zone" : "Create Zone"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">Delete Delivery Zone</DialogTitle>
            <DialogDescription className="text-[#5C685F] text-xs mt-1">
              Are you sure you want to delete <strong className="text-[#131914]">{deleteTarget?.zoneName}</strong>?
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
