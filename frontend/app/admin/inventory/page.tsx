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

  const inStockCount = items.filter((i) => i.stockQty > 10).length;
  const lowStockCount = items.filter((i) => i.stockQty > 0 && i.stockQty <= 10).length;
  const totalStockUnits = items.reduce((sum, i) => sum + (i.stockQty || 0), 0);
  const totalSoldUnits = items.reduce((sum, i) => sum + (i.soldQty || 0), 0);

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Stock Control
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              Live Stock
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Real-time stock quantities, reserved orders, units sold, and low-stock alerts.
          </p>
        </div>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Stock Units</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {totalStockUnits}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Available inventory
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">In Stock SKUs</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {inStockCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Healthy levels
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Low Stock Warning</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50 font-black text-xs">
              ▲
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {lowStockCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Below 10 units
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Sold Units</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <span className="font-extrabold text-[10px]">#</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {totalSoldUnits}
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              Cumulative sales
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E4E8E4] shadow-xs">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B958D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search items by product name or SKU..."
              className="w-full bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl pl-9 pr-4 py-2 text-xs text-[#131914] placeholder:text-[#8B958D] focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              setLowStockOnly((v) => !v);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              lowStockOnly
                ? "bg-[#FBEEE0] border-amber-300 text-[#B5601A]"
                : "bg-[#F5F7F5] border-[#E4E8E4] text-[#5C685F] hover:bg-[#F1F6F2]"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-[#B5601A]" />
            Low Stock
          </button>
        </div>

        <Button
          variant="outline"
          onClick={fetchInventory}
          size="sm"
          className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer w-full sm:w-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#5C685F]" />
          Refresh
        </Button>
      </div>

      {/* 4. Inventory Table Container */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-[#5C685F]">
              <Package className="h-12 w-12 mb-3 text-[#8B958D]" />
              <p className="font-bold text-[#131914] text-base">No inventory items</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4E8E4] bg-[#F1F6F2] text-[#5C685F] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">PRODUCT ITEM</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">AVAILABLE STOCK</th>
                  <th className="py-3 px-4">RESERVED</th>
                  <th className="py-3 px-4">UNITS SOLD</th>
                  <th className="py-3 px-4 text-right">EDIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8E4]/60 font-medium text-[#131914]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F1F6F2]/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border border-[#E4E8E4] shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-[#F5F7F5] rounded-lg flex items-center justify-center shrink-0 border border-[#E4E8E4]">
                            <Package className="h-4 w-4 text-[#123524]" />
                          </div>
                        )}
                        <span className="text-[#131914] font-bold text-xs line-clamp-1">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-[#5C685F] bg-[#F5F7F5] border border-[#E4E8E4] px-2 py-0.5 rounded-lg">
                        {item.sku}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#5C685F]">
                      <span className="bg-[#E4EEE7] text-[#123524] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {item.category?.name || "General"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          item.stockQty === 0
                            ? "bg-[#FBEAEA] text-[#C23B3B]"
                            : item.stockQty <= 10
                            ? "bg-[#FBEEE0] text-[#B5601A]"
                            : "bg-[#E6F5EB] text-[#1F8A4C]"
                        }`}
                      >
                        {item.stockQty === 0 ? "Out of stock" : `${item.stockQty} in stock`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#5C685F] font-semibold">{item.reservedStockQty}</td>

                    <td className="py-3 px-4 text-[#131914] font-extrabold font-['Manrope']">{item.soldQty}</td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditTarget(item);
                          setNewStock(String(item.stockQty));
                        }}
                        className="p-1.5 rounded-lg border border-[#E4E8E4] bg-white text-[#5C685F] hover:text-[#123524] hover:bg-[#F1F6F2] transition-all inline-flex cursor-pointer"
                        title="Update stock count"
                      >
                        <Edit className="h-3.5 w-3.5" />
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
          <div className="px-5 py-3 border-t border-[#E4E8E4] bg-[#F5F7F5]/50 flex items-center justify-between text-xs text-[#5C685F]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl h-8 px-3 text-xs border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl h-8 px-3 text-xs border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Stock Modal */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="bg-white border-[#E4E8E4] text-[#131914] rounded-2xl p-6 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#131914] font-bold text-base font-['Manrope']">Update Stock Level</DialogTitle>
            <DialogDescription className="text-[#5C685F] text-xs mt-1">
              Adjust physical available stock for <strong>{editTarget?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">Stock Quantity</Label>
              <Input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="border-[#E4E8E4] text-[#131914] hover:bg-[#F1F6F2] text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
