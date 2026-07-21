"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Loader2, Package, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

const statusBadge = (active: boolean) =>
  active
    ? "bg-emerald-500/10 text-emerald-400"
    : "bg-red-500/10 text-red-400";

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
      toast.success("Product deleted");
      setDeleteTarget(null);
      fetchProducts();
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
          <h1 className="text-2xl font-black text-white">Products</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total products</p>
        </div>
        <Link href="/admin/products/new" className={cn(buttonVariants({ variant: "default" }), "bg-primary hover:bg-primary/90")}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or SKU..."
            className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <Button variant="outline" onClick={fetchProducts} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Package className="h-10 w-10 mb-2 text-slate-600" />
              <p>No products found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Product</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">SKU</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Category</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Price</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Flags</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium text-xs line-clamp-1">{product.name}</p>
                          <p className="text-slate-500 text-[10px]">{product.brand?.name || "No brand"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-slate-300">{product.sku}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-slate-300">{product.category?.name}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-bold text-xs">৳{product.discountPrice || product.price}</p>
                      {product.discountPrice && (
                        <p className="text-slate-500 line-through text-[10px]">৳{product.price}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold ${product.stockQty === 0 ? "text-red-400" : product.stockQty <= 10 ? "text-yellow-400" : "text-emerald-400"}`}>
                        {product.stockQty}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        {product.isFeatured && <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">Featured</span>}
                        {product.isBestSeller && <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold">Best Seller</span>}
                        {product.isFlashSale && <span className="text-[9px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-bold">Flash Sale</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusBadge(product.isActive)}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <a href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded bg-slate-700 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors">
                          <Edit className="h-3.5 w-3.5" />
                        </a>
                        <button onClick={() => setDeleteTarget(product)} className="p-1.5 rounded bg-slate-700 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-slate-400 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="border-slate-700 text-slate-400 hover:text-white bg-slate-800 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="border-slate-700 text-slate-400 hover:text-white bg-slate-800 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-slate-600 text-slate-300 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
