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
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  category: { id: string; name: string; slug: string };
  brand?: { name: string };
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch categories for filter dropdown
  useEffect(() => {
    api
      .get("/categories?includeInactive=true")
      .then((res) => {
        setCategories(res.data?.data?.categories || []);
      })
      .catch(console.error);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus === "active") params.isActive = true;
      if (selectedStatus === "draft") params.isActive = false;

      const { data } = await api.get("/products", { params });
      let list: Product[] = data.data.products || [];

      // Client side stock filter if applied
      if (selectedStock === "in_stock") {
        list = list.filter((p) => p.stockQty > 0);
      } else if (selectedStock === "low_stock") {
        list = list.filter((p) => p.stockQty > 0 && p.stockQty <= 5);
      } else if (selectedStock === "out_of_stock") {
        list = list.filter((p) => p.stockQty <= 0);
      }

      setProducts(list);
      setTotalPages(data.data.pagination?.totalPages || 1);
      setTotal(data.data.pagination?.total || 0);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, selectedStatus, selectedStock]);

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

  const handleToggleStatus = async (product: Product) => {
    try {
      await api.patch(`/products/${product.id}`, {
        isActive: !product.isActive,
      });
      toast.success(
        product.isActive ? `"${product.name}" moved to Draft` : `"${product.name}" is now Live!`
      );
      fetchProducts();
    } catch (err: any) {
      toast.error("Failed to update status");
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
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm font-bold text-xs h-10 px-4">
              <Plus className="h-4 w-4 mr-1.5" /> Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by title, SKU, or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-transparent border-0 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Live / Published</option>
            <option value="draft">Draft / Hidden</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-3xl border">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-700 font-bold text-sm">No products found.</p>
          <p className="text-slate-400 text-xs">
            Try adjusting your search criteria or add your first product.
          </p>
          <Link href="/admin/products/new">
            <Button className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
              <Plus className="w-4 h-4 mr-1" /> Add Product Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Media & Variants</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {products.map((p) => {
                  const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Name & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || "/file.svg"}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                          />
                          <div className="max-w-[240px]">
                            <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-xl">
                          {p.category?.name || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-black text-slate-900 text-xs">
                            ৳{(p.discountPrice || p.price).toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-400 line-through ml-1.5">
                              ৳{p.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-extrabold text-xs px-2 py-0.5 rounded-lg ${
                            p.stockQty > 5
                              ? "text-emerald-700 bg-emerald-50"
                              : p.stockQty > 0
                              ? "text-amber-700 bg-amber-50"
                              : "text-rose-700 bg-rose-50"
                          }`}
                        >
                          {p.stockQty > 0 ? `${p.stockQty} in stock` : "Out of stock"}
                        </span>
                      </td>

                      {/* Media & Variants */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {p.videoUrl && (
                            <span
                              className="p-1 rounded-md bg-red-50 text-red-600"
                              title="Product has Video"
                            >
                              <Film className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {p.variants && p.variants.length > 0 && (
                            <span
                              className="p-1 rounded-md bg-purple-50 text-purple-600 font-bold text-[10px] px-1.5"
                              title={`${p.variants.length} Variants`}
                            >
                              <Layers className="w-3 h-3 inline mr-0.5" />
                              {p.variants.length}
                            </span>
                          )}
                          {p.isFeatured && (
                            <span
                              className="p-1 rounded-md bg-amber-50 text-amber-600"
                              title="Featured Product"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                            p.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {p.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Live</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-500" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View on Storefront */}
                          <Link
                            href={`/product/${p.slug || p.id}`}
                            target="_blank"
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors"
                            title="View on Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-700 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-500">
                Page {page} of {totalPages} ({total} Total Products)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl h-8 px-3 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl h-8 px-3 text-xs"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-3xl p-6 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900">Delete Product</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This will
              remove all associated media and variants from the store.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2.5 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
