"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    sortOrder: 0,
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/banners");
      setBanners(data.data.banners || []);
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, imageUrl: data.data.url }));
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTarget) {
        await api.patch(`/banners/${editTarget.id}`, form);
        toast.success("Banner updated successfully");
      } else {
        await api.post("/banners", form);
        toast.success("Banner created successfully");
      }
      setShowForm(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/banners/${deleteTarget.id}`);
      toast.success("Banner deleted successfully");
      setDeleteTarget(null);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const activeBannersCount = banners.filter((b) => b.isActive).length;
  const withCtaCount = banners.filter((b) => b.linkUrl).length;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Marketing Banners
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {banners.length} slides
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Manage main promotional sliders, banner text overlays, and call-to-action link targets.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              title: "",
              subtitle: "",
              imageUrl: "",
              linkUrl: "",
              isActive: true,
              sortOrder: banners.length,
            });
            setEditTarget(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New Banner
        </button>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Banners</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {banners.length}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Hero slides configured
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Live Active Slides</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {activeBannersCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Visible on homepage
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Target Links</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <span className="font-extrabold text-[10px]">🔗</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {withCtaCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              Directing traffic
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Carousel Status</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {banners.length > 0 ? "Enabled" : "Empty"}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Auto-cycling
            </p>
          </div>
        </div>
      </div>

      {/* 3. Grid of Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-[#5C685F] bg-white rounded-2xl border border-[#E4E8E4]">
            <ImageIcon className="h-12 w-12 mb-3 text-[#8B958D]" />
            <p className="font-bold text-[#131914] text-base">No banners created yet</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white border border-[#E4E8E4] rounded-2xl overflow-hidden shadow-xs hover:border-[#123524]/40 transition-all flex flex-col"
            >
              <div className="relative aspect-[21/9] bg-slate-900 overflow-hidden">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-extrabold text-sm sm:text-base font-['Manrope']">{banner.title}</p>
                  {banner.subtitle && <p className="text-[#E4EEE7] text-xs mt-0.5">{banner.subtitle}</p>}
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${
                      banner.isActive
                        ? "bg-[#E6F5EB] text-[#1F8A4C] border-emerald-200"
                        : "bg-[#FBEAEA] text-[#C23B3B] border-rose-200"
                    }`}
                  >
                    {banner.isActive ? "• Live" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4 flex items-center justify-between bg-[#F1F6F2]">
                <div>
                  <span className="text-xs font-bold text-[#5C685F]">Sort Priority: #{banner.sortOrder}</span>
                  {banner.linkUrl && (
                    <p className="text-[#123524] text-xs font-mono truncate max-w-xs mt-0.5 font-semibold">
                      Target: {banner.linkUrl}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setForm({
                        title: banner.title,
                        subtitle: banner.subtitle || "",
                        imageUrl: banner.imageUrl,
                        linkUrl: banner.linkUrl || "",
                        isActive: banner.isActive,
                        sortOrder: banner.sortOrder,
                      });
                      setEditTarget(banner);
                      setShowForm(true);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-[#E4E8E4] text-[#5C685F] hover:text-[#123524] hover:bg-white transition-all cursor-pointer"
                    title="Edit banner"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(banner)}
                    className="p-1.5 rounded-lg bg-white border border-[#E4E8E4] text-[#5C685F] hover:text-[#C23B3B] hover:bg-[#FBEAEA] transition-all cursor-pointer"
                    title="Delete banner"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">
              {editTarget ? "Edit Banner" : "Create New Banner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Banner Headline Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Glowing Luxury Skincare Sale"
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Subtitle Text</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Get up to 30% off on all organic serums"
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Call-to-Action Link URL</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/shop?category=skincare"
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Sort Order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Banner Image *</Label>
              {form.imageUrl && (
                <div className="relative aspect-[21/9] bg-[#F5F7F5] rounded-xl overflow-hidden mb-2 border border-[#E4E8E4]">
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-[#C23B3B] rounded-lg text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer text-[#5C685F] hover:text-[#123524] text-xs font-semibold border border-[#E4E8E4] bg-[#F5F7F5] rounded-xl px-4 py-2.5 transition-colors">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-[#123524]" />}
                {uploading ? "Uploading..." : "Upload Banner Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
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
                disabled={submitting || !form.imageUrl}
                className="bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editTarget ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-lg font-['Manrope']">Delete Banner</DialogTitle>
            <DialogDescription className="text-[#5C685F] text-xs mt-1">
              Are you sure you want to delete <strong className="text-[#131914]">{deleteTarget?.title}</strong>?
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
