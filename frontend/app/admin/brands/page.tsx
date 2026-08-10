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

  const fetchBrands = useCallback(async () => {
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

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const filtered = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

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
      const { data } = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, logoUrl: data.data.url }));
      toast.success("Logo uploaded successfully");
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
        toast.success("Brand updated successfully");
      } else {
        await api.post("/brands", form);
        toast.success("Brand created successfully");
      }
      setShowForm(false);
      fetchBrands();
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
      toast.success("Brand deleted successfully");
      setDeleteTarget(null);
      fetchBrands();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const activeBrands = brands.filter((b) => b.isActive).length;
  const totalBrandProducts = brands.reduce((sum, b) => sum + (b._count?.products || 0), 0);
  const withLogoCount = brands.filter((b) => b.logoUrl).length;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Brand Directory
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {brands.length} brands
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Manage cosmetic & beauty brand partners, logos, and status filters.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New Brand
        </button>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Brands</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {brands.length}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Partner brands
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Active Brands</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {activeBrands}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Live in catalogue
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Brand SKUs</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <span className="font-extrabold text-[10px]">#</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {totalBrandProducts}
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              Associated products
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">With Logos</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {withLogoCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              High-res media
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E4E8E4] shadow-xs">
        <div className="flex items-center gap-2 bg-[#F5F7F5] px-3.5 py-2 rounded-xl border border-[#E4E8E4] w-full sm:flex-1">
          <Search className="w-4 h-4 text-[#8B958D] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="w-full text-xs text-[#131914] placeholder:text-[#8B958D] bg-transparent border-0 focus:outline-none"
          />
        </div>

        <Button
          variant="outline"
          onClick={fetchBrands}
          size="sm"
          className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer w-full sm:w-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#5C685F]" />
          Refresh
        </Button>
      </div>

      {/* 4. Brands Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-[#5C685F] bg-white rounded-2xl border border-[#E4E8E4]">
            <Award className="h-12 w-12 mb-3 text-[#8B958D]" />
            <p className="font-bold text-[#131914] text-base">No brands found</p>
          </div>
        ) : (
          filtered.map((brand) => (
            <div
              key={brand.id}
              className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs hover:border-[#123524]/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-11 h-11 rounded-xl object-contain bg-[#F5F7F5] p-1 border border-[#E4E8E4] shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 bg-[#F1F6F2] rounded-xl flex items-center justify-center shrink-0 border border-[#E4EEE7]">
                    <Award className="h-5 w-5 text-[#123524]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[#131914] font-extrabold text-sm truncate font-['Manrope']">{brand.name}</p>
                  <p className="text-[#8B958D] text-xs font-mono">{brand.slug}</p>
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      brand.isActive
                        ? "bg-[#E6F5EB] text-[#1F8A4C]"
                        : "bg-[#F5F7F5] text-[#5C685F]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {brand.isActive ? "• Live" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E4E8E4]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(brand)}
                  className="flex-1 border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] text-xs font-semibold rounded-xl h-8 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 mr-1 text-[#5C685F]" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteTarget(brand)}
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
              {editTarget ? "Edit Brand" : "Create New Brand"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Brand Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: editTarget ? f.slug : autoSlug(e.target.value),
                  }))
                }
                placeholder="e.g. Dior, Chanel, Fenty Beauty"
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] placeholder:text-[#8B958D] rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="dior-paris"
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] placeholder:text-[#8B958D] rounded-xl font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Brand Logo</Label>
              {form.logoUrl && (
                <img
                  src={form.logoUrl}
                  alt="Logo preview"
                  className="w-14 h-14 rounded-xl object-contain bg-[#F5F7F5] p-1 border border-[#E4E8E4] mb-2"
                />
              )}
              <label className="flex items-center gap-2 cursor-pointer text-[#5C685F] hover:text-[#123524] text-xs font-semibold border border-[#E4E8E4] bg-[#F5F7F5] rounded-xl px-4 py-2.5 transition-colors">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-[#123524]" />}
                {uploading ? "Uploading..." : "Upload Logo Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-[#E4E8E4]">
              <Label className="text-[#131914] text-xs font-bold">Active Status</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
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
                {editTarget ? "Update Brand" : "Create Brand"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">Delete Brand</DialogTitle>
            <DialogDescription className="text-[#5C685F] text-xs mt-1">
              Are you sure you want to delete <strong className="text-[#131914]">{deleteTarget?.name}</strong>?
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
