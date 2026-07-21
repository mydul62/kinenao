"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Loader2, Award, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
  _count?: { products: number };
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", logoUrl: "", isActive: true });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/brands");
      setBrands(data.data.brands || []);
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const autoSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const openCreate = () => {
    setForm({ name: "", slug: "", logoUrl: "", isActive: true });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (brand: Brand) => {
    setForm({ name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl || "", isActive: brand.isActive });
    setEditTarget(brand);
    setShowForm(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(f => ({ ...f, logoUrl: data.data.url }));
      toast.success("Logo uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editTarget) {
        await api.patch(`/brands/${editTarget.id}`, form);
        toast.success("Brand updated");
      } else {
        await api.post("/brands", form);
        toast.success("Brand created");
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
      await api.delete(`/brands/${deleteTarget.id}`);
      toast.success("Brand deleted");
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
          <h1 className="text-2xl font-black text-white">Brands</h1>
          <p className="text-slate-400 text-sm mt-1">{brands.length} total brands</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Brand
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brands..." className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <Button variant="outline" onClick={fetch} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-48 text-slate-400">
            <Award className="h-10 w-10 mb-2 text-slate-600" />
            <p>No brands found</p>
          </div>
        ) : (
          filtered.map(brand => (
            <div key={brand.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-start gap-3">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} className="w-12 h-12 rounded-lg object-contain bg-white p-1 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{brand.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{brand.slug}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${brand.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {brand.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700">
                <Button size="sm" variant="outline" onClick={() => openEdit(brand)} className="flex-1 border-slate-600 text-slate-300 hover:text-white text-xs h-7">
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDeleteTarget(brand)} className="border-red-800/50 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-7">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Brand" : "New Brand"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Brand Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editTarget ? f.slug : autoSlug(e.target.value) }))} placeholder="Brand name" className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Slug *</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="brand-slug" className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 font-mono" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Logo</Label>
              {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-contain bg-white p-1" />}
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
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editTarget ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription className="text-slate-400">
              Delete <strong className="text-white">{deleteTarget?.name}</strong>? Products associated with this brand will become unbranded.
            </DialogDescription>
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
