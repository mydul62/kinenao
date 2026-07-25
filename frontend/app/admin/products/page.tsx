"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Loader2, Package, RefreshCw, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  sku: string;
  price: number;
  discountPrice?: number;
  stockQty: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  thumbnail?: string;
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
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Product Catalogue
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {total} Items
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Manage inventory, pricing, stock levels, and promotional badges.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Add New Product
        </Link>
      </div>

      {/* Search & Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by name, SKU, category..."
            className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            onClick={fetchProducts}
            size="sm"
            className="border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Product Data Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Package className="h-12 w-12 mb-3 text-slate-300" />
              <p className="font-bold text-slate-800 text-base">No products found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Try adjusting your search criteria or create a new product item.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-6">Product Item</th>
                  <th className="py-4 px-4">SKU</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Badges</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-purple-50/40 transition-colors group"
                  >
                    {/* Item Image & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-[#6C5CE7]" />
                          </div>
                        )}
                        <div>
                          <p className="text-slate-900 font-bold text-xs md:text-sm group-hover:text-[#6C5CE7] transition-colors line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            {product.brand?.name || "No Brand"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {product.sku}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {product.category?.name || "Uncategorized"}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4">
                      <p className="text-slate-900 font-extrabold text-xs md:text-sm">
                        ৳{(product.discountPrice || product.price).toLocaleString()}
                      </p>
                      {product.discountPrice && (
                        <p className="text-slate-400 line-through text-[10px]">
                          ৳{product.price.toLocaleString()}
                        </p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          product.stockQty === 0
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : product.stockQty <= 10
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {product.stockQty === 0 ? "Out of stock" : `${product.stockQty} in stock`}
                      </span>
                    </td>

                    {/* Promotional Badges */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.isFeatured && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                            Featured
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="text-[10px] bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                            Best Seller
                          </span>
                        )}
                        {product.isFlashSale && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                            Flash Sale
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          product.isActive
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            product.isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-[#6C5CE7]/10 text-slate-600 hover:text-[#6C5CE7] transition-all"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-all"
                          title="Delete product"
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E7EB] bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Delete Product</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.name}</strong>? This action cannot be undone.
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
