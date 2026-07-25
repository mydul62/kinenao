"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Loader2, Tag, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parentCategory?: { name: string };
  _count?: { products: number };
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
  const [form, setForm] = useState({ name: "", slug: "", parentId: "" });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/categories?includeCount=true");
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
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm({ name: "", slug: "", parentId: "" });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || "" });
    setEditTarget(cat);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, parentId: form.parentId ? form.parentId : null };
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

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Product Categories
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Organize catalog items, sub-categories, and menu navigation links.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Add New Category
        </button>
      </div>

      {/* Search & Refresh */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all"
          />
        </div>

        <Button
          variant="outline"
          onClick={fetchCategories}
          size="sm"
          className="border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refresh
        </Button>
      </div>

      {/* Categories Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Tag className="h-12 w-12 mb-3 text-slate-300" />
              <p className="font-bold text-slate-800 text-base">No categories found</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-4">Slug</th>
                  <th className="py-4 px-4">Parent Category</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                          <Tag className="h-4 w-4 text-[#6C5CE7]" />
                        </div>
                        <span className="text-slate-900 font-bold text-xs md:text-sm">
                          {cat.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {cat.slug}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {cat.parentCategory ? (
                        <span className="text-xs text-slate-700 font-medium inline-flex items-center gap-1">
                          <ChevronRight className="h-3.5 w-3.5 text-[#6C5CE7]" />
                          {cat.parentCategory.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Root Category</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-[#6C5CE7]/10 text-slate-600 hover:text-[#6C5CE7] transition-all"
                          title="Edit category"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-all"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">
              {editTarget ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Category Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: editTarget ? f.slug : autoSlug(name) }));
                }}
                placeholder="e.g. Skincare, Lipstick"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 placeholder:text-slate-400 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="skincare-products"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 placeholder:text-slate-400 rounded-xl font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">Parent Category</Label>
              <select
                value={form.parentId}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] text-slate-900 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold focus:outline-none"
              >
                <option value="">None (Top-Level Category)</option>
                {categories
                  .filter((c) => c.id !== editTarget?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
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
                {editTarget ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Delete Category</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.name}</strong>?
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
