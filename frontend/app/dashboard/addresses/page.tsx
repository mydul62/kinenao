"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, MapPin, Edit, Trash2, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Address {
  id: string;
  street: string;
  city: string;
  area?: string;
  postalCode?: string;
  isDefault: boolean;
}

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ street: "", city: "", area: "", postalCode: "", isDefault: false });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/addresses");
      setAddresses(data.data.addresses || []);
    } catch { toast.error("Failed to load addresses"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) { await api.patch(`/addresses/${editTarget.id}`, form); toast.success("Address updated"); }
      else { await api.post("/addresses", form); toast.success("Address added"); }
      setShowForm(false); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed"); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/addresses/${id}`); toast.success("Address removed"); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">My Addresses</h1>
        <Button onClick={() => { setForm({ street: "", city: "", area: "", postalCode: "", isDefault: false }); setEditTarget(null); setShowForm(true); }} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Address
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No addresses saved yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white border rounded-xl p-5 relative ${addr.isDefault ? "border-primary" : "border-slate-200"}`}>
              {addr.isDefault && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" /> Default
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-semibold text-sm">{addr.street}</p>
                  <p className="text-slate-500 text-xs">{addr.area ? `${addr.area}, ` : ""}{addr.city}</p>
                  {addr.postalCode && <p className="text-slate-500 text-xs">ZIP: {addr.postalCode}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => { setForm({ street: addr.street, city: addr.city, area: addr.area || "", postalCode: addr.postalCode || "", isDefault: addr.isDefault }); setEditTarget(addr); setShowForm(true); }} className="flex-1 text-xs h-7">
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(addr.id)} className="border-red-200 text-red-500 hover:bg-red-50 text-xs h-7">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTarget ? "Edit Address" : "Add Address"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Street Address *</Label>
              <Input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="e.g. 123 Main Street" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Dhaka" required />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Gulshan" />
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="1212" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Set as default address</Label>
              <Switch checked={form.isDefault} onCheckedChange={v => setForm(f => ({ ...f, isDefault: v }))} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editTarget ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
