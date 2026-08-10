"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Tag,
  RefreshCw,
  ChevronRight,
  FolderTree,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  X,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  parentId?: string | null;
  parentCategory?: { id?: string; name: string; slug: string } | null;
  childCategories?: Category[];
  _count?: { products: number; childCategories?: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    description: "",
    imageUrl: "",
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/categories?includeInactive=true");
      setCategories(data.data.categories || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const parentCategories = categories.filter((c) => !c.parentId);

  const openCreate = (defaultParentId: string = "") => {
    setForm({
      name: "",
      slug: "",
      parentId: defaultParentId,
      description: "",
      imageUrl: "",
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
    });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId || "",
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      isFeatured: Boolean(cat.isFeatured),
      sortOrder: cat.sortOrder || 0,
    });
    setEditTarget(cat);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, imageUrl: data.data.url }));
      toast.success("Category image uploaded successfully");
    } catch {
      toast.error("Failed to upload category image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        parentId: form.parentId ? form.parentId : null,
      };
      if (editTarget) {
        await api.put(`/categories/${editTarget.id}`, payload);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created successfully");
      }
      setShowForm(false);
      fetchCategories();
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
      await api.delete(`/categories/${deleteTarget.id}`);
      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const parentCount = categories.filter((c) => !c.parentId).length;
  const subCount = categories.filter((c) => c.parentId).length;
  const featuredCount = categories.filter((c) => c.isFeatured).length;

  return (
    <div className="space-y-5 max-w-[1500px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Category Hierarchy Manager
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {categories.length} categories
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Manage multi-tier parent categories, subcategories, banners, and display order.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchCategories}
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#5C685F]" /> Refresh
          </Button>
          <Button
            onClick={() => openCreate()}
            className="bg-[#123524] hover:bg-[#1B4A34] text-white rounded-xl shadow-xs font-bold text-xs h-9 px-4 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </div>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total categories</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Tag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {categories.length}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Complete hierarchy
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Parent tiers</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <FolderTree className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {parentCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Root catalog tiers
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Subcategories</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {subCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Child sub-groups
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Featured tiers</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {featuredCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Homepage highlights
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-2xl border border-[#E4E8E4] shadow-xs">
        <Search className="w-4 h-4 text-[#8B958D] ml-1 shrink-0" />
        <input
          type="text"
          placeholder="Search categories by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-[#131914] placeholder:text-[#8B958D] bg-transparent border-0 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-[#8B958D] hover:text-[#131914] cursor-pointer mr-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Main Categories Tree & Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-2xl border border-[#E4E8E4]">
          <Loader2 className="w-8 h-8 animate-spin text-[#123524]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-12 text-center space-y-3">
          <p className="text-[#131914] font-bold text-sm">No categories found.</p>
          <Button onClick={() => openCreate()} className="bg-[#123524] hover:bg-[#1B4A34] text-white rounded-xl text-xs font-bold cursor-pointer">
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E8E4] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F1F6F2] border-b border-[#E4E8E4] text-[#5C685F] font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">CATEGORY IMAGE & NAME</th>
                  <th className="py-3 px-4">HIERARCHY TYPE</th>
                  <th className="py-3 px-4">PRODUCTS</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">SORT ORDER</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8E4]/60 font-medium text-[#131914]">
                {filtered.map((cat) => {
                  const isParent = !cat.parentId;
                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-[#F1F6F2]/70 transition-colors ${
                        isParent ? "bg-white" : "bg-[#F5F7F5]/30"
                      }`}
                    >
                      {/* Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {!isParent && (
                            <span className="text-[#8B958D] ml-2">└──</span>
                          )}
                          <div className="w-10 h-10 rounded-xl bg-[#F5F7F5] border border-[#E4E8E4] overflow-hidden shrink-0 flex items-center justify-center">
                            {cat.imageUrl ? (
                              <img src={cat.imageUrl} alt={cat.name || "Category"} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-[#8B958D]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#131914]">{cat.name}</span>
                              {cat.isFeatured && (
                                <span className="bg-[#FBEEE0] text-[#B5601A] text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  Featured
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8B958D] font-mono">/{cat.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Hierarchy Type */}
                      <td className="py-3 px-4">
                        {isParent ? (
                          <span className="inline-flex items-center gap-1 bg-[#E4EEE7] text-[#123524] font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            <FolderTree className="w-3 h-3" /> Root Parent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-[#F5F7F5] text-[#5C685F] border border-[#E4E8E4] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Child Subcategory
                          </span>
                        )}
                      </td>

                      {/* Products count */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[#131914] font-['Manrope']">
                          {cat._count?.products || 0}
                        </span>
                        <span className="text-[10px] text-[#8B958D] ml-1">items</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            cat.isActive !== false
                              ? "bg-[#E6F5EB] text-[#1F8A4C]"
                              : "bg-[#FBEAEA] text-[#C23B3B]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cat.isActive !== false ? "bg-[#1F8A4C]" : "bg-[#C23B3B]"
                            }`}
                          />
                          <span>{cat.isActive !== false ? "Live" : "Inactive"}</span>
                        </span>
                      </td>

                      {/* Sort Order */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-[#5C685F]">#{cat.sortOrder || 0}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isParent && (
                            <button
                              type="button"
                              onClick={() => openCreate(cat.id)}
                              className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#123524] hover:bg-[#E4EEE7] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                              title="Add Subcategory under this parent"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline text-[10px]">Add Sub</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(cat)}
                            className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#123524] hover:bg-[#F1F6F2] transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#C23B3B] hover:bg-[#FBEAEA] transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg rounded-3xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              {editTarget ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure category details, parent hierarchy, images, and sorting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Parent Category Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Parent Category (Optional - Leave blank for Main Category)
              </Label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">None (Top-Level Main Category)</option>
                {parentCategories
                  .filter((c) => !editTarget || c.id !== editTarget.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Category Name & Custom Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">
                  Category Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Saree, Kids"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800">Custom Slug</Label>
                <Input
                  placeholder="e.g. cotton-saree"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="rounded-xl text-xs h-10"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Category Banner/Image</Label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt={form.name || "Category preview"} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{form.imageUrl ? "Change Image" : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: "" })}
                      className="ml-2 text-xs text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Description</Label>
              <textarea
                rows={2}
                placeholder="Brief category summary for storefront banner..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Active & Featured Toggles */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Active Status</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Featured on Homepage</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || uploadingImage}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editTarget ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-rose-600">
              Confirm Category Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Are you sure you want to delete category "<strong>{deleteTarget?.name}</strong>"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
