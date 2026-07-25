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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Homepage Banners
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {banners.length} Active Slides
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Add New Banner
        </button>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white rounded-[24px] border border-[#E5E7EB]">
            <ImageIcon className="h-12 w-12 mb-3 text-slate-300" />
            <p className="font-bold text-slate-800 text-base">No banners created yet</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white border border-[#E5E7EB] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[21/9] bg-slate-900 overflow-hidden">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-extrabold text-base md:text-lg">{banner.title}</p>
                  {banner.subtitle && <p className="text-purple-200 text-xs mt-0.5">{banner.subtitle}</p>}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${
                      banner.isActive
                        ? "bg-emerald-500 text-white border-emerald-400"
                        : "bg-rose-500 text-white border-rose-400"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-xs font-bold text-slate-500">Sort Priority: #{banner.sortOrder}</span>
                  {banner.linkUrl && (
                    <p className="text-[#6C5CE7] text-xs font-mono truncate max-w-xs mt-0.5">
                      Target: {banner.linkUrl}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
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
                    className="p-2 rounded-xl bg-white border border-[#E5E7EB] text-slate-600 hover:text-[#6C5CE7] transition-all shadow-sm"
                    title="Edit banner"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(banner)}
                    className="p-2 rounded-xl bg-white border border-[#E5E7EB] text-slate-600 hover:text-rose-600 transition-all shadow-sm"
                    title="Delete banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">
              {editTarget ? "Edit Banner" : "Create New Banner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Banner Headline Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Glowing Luxury Skincare Sale"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Subtitle Text</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Get up to 30% off on all organic serums"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Call-to-Action Link URL</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/shop?category=skincare"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Sort Order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Banner Image *</Label>
              {form.imageUrl && (
                <div className="relative aspect-[21/9] bg-slate-100 rounded-xl overflow-hidden mb-2 border border-slate-200">
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 rounded-lg text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-[#6C5CE7] text-xs font-semibold border border-[#E5E7EB] bg-[#F8FAFC] rounded-xl px-4 py-2.5 transition-colors">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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

            <div className="flex items-center justify-between py-2 border-t border-[#E5E7EB]">
              <Label className="text-slate-800 text-xs font-bold">Active Status</Label>
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
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !form.imageUrl}
                className="bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white text-xs font-semibold rounded-xl"
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
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Delete Banner</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.title}</strong>?
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
