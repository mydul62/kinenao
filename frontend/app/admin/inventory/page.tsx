"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Loader2, Package, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  thumbnail?: string;
  stockQty: number;
  reservedStockQty: number;
  soldQty: number;
  isActive: boolean;
  category: { name: string };
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [newStock, setNewStock] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (lowStockOnly) params.lowStock = "true";
      const { data } = await api.get("/inventory", { params });
      setItems(data.data.inventory || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [page, search, lowStockOnly]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdate = async () => {
    if (!editTarget || newStock === "") return;
    setUpdating(true);
    try {
      await api.patch(`/inventory/${editTarget.id}/stock`, { stockQty: parseInt(newStock) });
      toast.success("Stock quantity updated successfully");
      setEditTarget(null);
      fetchInventory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Inventory & Stock Control
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              Live Stock
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Real-time stock quantities, reserved orders, units sold, and low-stock alerts.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search items by product name or SKU..."
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all"
            />
          </div>

          <button
            onClick={() => {
              setLowStockOnly((v) => !v);
              setPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              lowStockOnly
                ? "bg-amber-100 border-amber-300 text-amber-800 shadow-sm"
                : "bg-[#F8FAFC] border-[#E5E7EB] text-slate-700 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock Only
          </button>
        </div>

        <Button
          variant="outline"
          onClick={fetchInventory}
          size="sm"
          className="border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refresh
        </Button>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Package className="h-12 w-12 mb-3 text-slate-300" />
              <p className="font-bold text-slate-800 text-base">No inventory items</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-6">Product Item</th>
                  <th className="py-4 px-4">SKU</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Available Stock</th>
                  <th className="py-4 px-4">Reserved</th>
                  <th className="py-4 px-4">Units Sold</th>
                  <th className="py-4 px-6 text-center">Quick Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-[#6C5CE7]" />
                          </div>
                        )}
                        <span className="text-slate-900 font-bold text-xs md:text-sm line-clamp-1">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {item.sku}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {item.category?.name || "Uncategorized"}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          item.stockQty === 0
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : item.stockQty <= 10
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {item.stockQty === 0 ? "Out of stock" : `${item.stockQty} in stock`}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-semibold">{item.reservedStockQty}</td>

                    <td className="py-4 px-4 text-slate-900 font-extrabold">{item.soldQty}</td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          setEditTarget(item);
                          setNewStock(String(item.stockQty));
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#6C5CE7]/10 text-slate-600 hover:text-[#6C5CE7] transition-all inline-flex"
                        title="Update stock count"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
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

      {/* Edit Stock Modal */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="bg-white border-[#E5E7EB] text-slate-900 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Update Stock Count</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Modifying inventory units for <strong className="text-slate-900">{editTarget?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">New Stock Quantity</Label>
              <Input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                min="0"
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-bold text-base rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white text-xs font-semibold rounded-xl"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
