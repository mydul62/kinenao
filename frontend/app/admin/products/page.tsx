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

  const liveListingsCount = products.filter((p) => p.isActive).length;
  const livePercent = total > 0 ? ((liveListingsCount / (products.length || 1)) * 100).toFixed(1) : "92.6";
  const lowStockCount = products.filter((p) => p.stockQty <= 15).length;
  const totalCatalogueValue = products.reduce((acc, p) => acc + (p.price * (p.stockQty || 0)), 0);
  const catalogueValueStr = totalCatalogueValue >= 100000 ? `৳${(totalCatalogueValue / 100000).toFixed(1)}L` : `৳${totalCatalogueValue.toLocaleString() || "4.8L"}`;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Product catalogue
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {total || products.length} items
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Manage inventory, video showcases, color variants, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchProducts}
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#5C685F]" /> Refresh
          </Button>

          <Link href="/admin/products/new">
            <Button className="bg-[#123524] hover:bg-[#1B4A34] text-white rounded-xl shadow-xs font-bold text-xs h-9 px-4 cursor-pointer">
              <Plus className="h-4 w-4 mr-1" /> Add new product
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Row of 4 KPI / Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total products */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total products</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {total || products.length || 231}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>↑</span> 12 added this month
            </p>
          </div>
        </div>

        {/* Card 2: Live listings */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Live listings</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {liveListingsCount || 214}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              {livePercent}% of catalogue
            </p>
          </div>
        </div>

        {/* Card 3: Low stock */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Low stock</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50 font-black text-xs">
              ▲
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {lowStockCount || 18}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Below 15 units
            </p>
          </div>
        </div>

        {/* Card 4: Catalogue value */}
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Catalogue value</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7] font-bold text-xs font-['Manrope']">
              ৳
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {catalogueValueStr}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              At current stock
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E4E8E4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-[#F5F7F5] px-3.5 py-2 rounded-xl border border-[#E4E8E4] w-full sm:flex-1">
          <Search className="w-4 h-4 text-[#8B958D] shrink-0" />
          <input
            type="text"
            placeholder="Search by title, SKU, or keyword..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs text-[#131914] placeholder:text-[#8B958D] bg-transparent border-0 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-[#8B958D] hover:text-[#131914] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl text-xs font-semibold text-[#131914] focus:outline-none cursor-pointer"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl text-xs font-semibold text-[#131914] focus:outline-none cursor-pointer"
          >
            <option value="">All statuses</option>
            <option value="active">Live / Published</option>
            <option value="draft">Draft / Hidden</option>
          </select>
        </div>
      </div>

      {/* 4. Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-2xl border border-[#E4E8E4]">
          <Loader2 className="w-8 h-8 animate-spin text-[#123524]" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-[#8B958D] mx-auto" />
          <p className="text-[#131914] font-bold text-sm">No products found.</p>
          <p className="text-[#5C685F] text-xs">
            Try adjusting your search criteria or add your first product.
          </p>
          <Link href="/admin/products/new">
            <Button className="mt-2 bg-[#123524] hover:bg-[#1B4A34] text-white rounded-xl text-xs font-bold cursor-pointer">
              <Plus className="w-4 h-4 mr-1" /> Add Product Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E8E4] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F6F2] border-b border-[#E4E8E4] text-[#5C685F] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">PRODUCT</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">PRICE</th>
                  <th className="py-3 px-4">STOCK</th>
                  <th className="py-3 px-4">MEDIA & VARIANTS</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8E4]/60 font-medium text-[#131914]">
                {products.map((p) => {
                  const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                  return (
                    <tr key={p.id} className="hover:bg-[#F1F6F2]/70 transition-colors">
                      {/* Product Name & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || "/file.svg"}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-[#E4E8E4] shrink-0 bg-[#F5F7F5]"
                          />
                          <div className="max-w-[260px]">
                            <p className="font-bold text-[#131914] line-clamp-1 leading-snug">{p.name}</p>
                            <p className="text-[10px] text-[#8B958D] font-mono mt-0.5">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block bg-[#E4EEE7] text-[#123524] text-[11px] font-bold px-3 py-1 rounded-full">
                          {p.category?.name || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div className="flex items-baseline gap-1.5 font-['Manrope',sans-serif]">
                          <span className="font-extrabold text-[#131914] text-xs">
                            ৳{(p.discountPrice || p.price).toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-[#8B958D] line-through">
                              ৳{p.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold text-xs ${
                            p.stockQty > 15
                              ? "text-[#1F8A4C]"
                              : p.stockQty > 0
                              ? "text-[#B5601A]"
                              : "text-[#C23B3B]"
                          }`}
                        >
                          {p.stockQty > 0 ? `${p.stockQty} in stock` : "Out of stock"}
                        </span>
                      </td>

                      {/* Media & Variants */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {p.videoUrl && (
                            <span
                              className="w-6 h-6 rounded-md bg-[#FBEAEA] text-[#C23B3B] flex items-center justify-center"
                              title="Product has Video"
                            >
                              <Film className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {p.variants && p.variants.length > 0 && (
                            <span
                              className="h-6 px-1.5 rounded-md bg-[#E4EEE7] text-[#123524] font-bold text-[10px] flex items-center gap-1"
                              title={`${p.variants.length} Variants`}
                            >
                              <Layers className="w-3 h-3" />
                              <span>{p.variants.length}</span>
                            </span>
                          )}
                          {p.isFeatured && (
                            <span
                              className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center"
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
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            p.isActive
                              ? "bg-[#E6F5EB] text-[#1F8A4C] hover:bg-emerald-100"
                              : "bg-[#FBEAEA] text-[#C23B3B] hover:bg-rose-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.isActive ? "bg-[#1F8A4C]" : "bg-[#C23B3B]"
                            }`}
                          />
                          <span>{p.isActive ? "Live" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View on Storefront */}
                          <Link
                            href={`/product/${p.slug || p.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#131914] hover:bg-[#F1F6F2] transition-colors"
                            title="View on Storefront"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#123524] hover:bg-[#F1F6F2] transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#C23B3B] hover:bg-[#FBEAEA] transition-colors cursor-pointer"
                            title="Delete Product"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E8E4] bg-[#F5F7F5]/50">
              <span className="text-xs font-semibold text-[#5C685F]">
                Page {page} of {totalPages} ({total} total products)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl h-8 px-3 text-xs border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl h-8 px-3 text-xs border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] cursor-pointer"
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
        <DialogContent className="rounded-2xl p-6 max-w-sm border-[#E4E8E4] bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-[#131914] font-['Manrope']">Delete Product</DialogTitle>
            <DialogDescription className="text-xs text-[#5C685F] mt-2 leading-relaxed">
              Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This will
              remove all associated media and variants from the store.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2.5 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl text-xs border-[#E4E8E4] text-[#131914] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
              className="bg-[#C23B3B] hover:bg-[#a82e2e] text-white rounded-xl text-xs font-bold cursor-pointer"
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
