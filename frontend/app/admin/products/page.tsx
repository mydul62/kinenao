"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
  RefreshCw,
  Sparkles,
  Filter,
  Film,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  stockQty: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  thumbnail?: string | null;
  videoUrl?: string | null;
  variants?: any[];
  category: { name: string };
  brand?: { name: string };
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await api.get("/products", { params });
      setProducts(data.data.products || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
      setTotal(data.data.pagination?.total || 0);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      toast.success("Product deleted successfully");
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Product Catalogue
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {total} Items
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Manage inventory, video shopping showcases, color variants, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchProducts}
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>

          <Link href="/admin/products/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="Search products by title, SKU, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs md:text-sm bg-transparent border-0 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-3xl border">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <p className="text-slate-600 font-bold text-sm">No products found.</p>
          <Link href="/admin/products/new">
            <Button className="bg-emerald-600 text-white rounded-xl">Add First Product</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4">Thumbnail & Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Media & Variants</th>
                  <th className="py-3.5 px-4">Price (৳)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {products.map((prod) => {
                  const hasVideo = Boolean(prod.videoUrl);
                  const variantCount = prod.variants ? prod.variants.length : 0;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.thumbnail || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop"}
                            alt={prod.name || "Product"}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">SKU: {prod.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                          {prod.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      {/* Video & Variants */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {hasVideo && (
                            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Film className="w-3 h-3 text-emerald-400" /> Video
                            </span>
                          )}
                          {variantCount > 0 && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Layers className="w-3 h-3" /> {variantCount} Colors
                            </span>
                          )}
                          {!hasVideo && variantCount === 0 && (
                            <span className="text-slate-400 text-[11px]">Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          ৳{prod.discountPrice ? prod.discountPrice : prod.price}
                        </div>
                        {prod.discountPrice && (
                          <div className="text-[11px] text-slate-400 line-through">
                            ৳{prod.price}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        {prod.stockQty > 0 ? (
                          <span className="font-bold text-emerald-700">{prod.stockQty} in stock</span>
                        ) : (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {prod.isActive ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/products/${prod.id}/edit`}>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(prod)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete"
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

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-rose-600">
              Confirm Product Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Are you sure you want to delete product "<strong>{deleteTarget?.name}</strong>"?
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
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
