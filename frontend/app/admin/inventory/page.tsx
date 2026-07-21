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

  const fetch = useCallback(async () => {
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

  useEffect(() => { fetch(); }, [fetch]);

  const handleUpdate = async () => {
    if (!editTarget || newStock === "") return;
    setUpdating(true);
    try {
      await api.patch(`/inventory/${editTarget.id}/stock`, { stockQty: parseInt(newStock) });
      toast.success("Stock updated");
      setEditTarget(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Inventory</h1>
        <p className="text-slate-400 text-sm mt-1">Track and manage product stock levels</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or SKU..." className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <button
          onClick={() => { setLowStockOnly(v => !v); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${lowStockOnly ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}
        >
          <AlertTriangle className="h-4 w-4" /> Low Stock Only
        </button>
        <Button variant="outline" onClick={fetch} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Package className="h-10 w-10 mb-2 text-slate-600" />
              <p>No inventory items</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Product</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">SKU</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Category</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Reserved</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Sold</th>
                  <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="w-9 h-9 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 bg-slate-700 rounded flex-shrink-0 flex items-center justify-center">
                            <Package className="h-4 w-4 text-slate-500" />
                          </div>
                        )}
                        <span className="text-white font-medium text-xs line-clamp-1">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4"><span className="font-mono text-xs text-slate-400">{item.sku}</span></td>
                    <td className="p-4"><span className="text-xs text-slate-300">{item.category?.name}</span></td>
                    <td className="p-4">
                      <span className={`text-sm font-bold ${item.stockQty === 0 ? "text-red-400" : item.stockQty <= 10 ? "text-yellow-400" : "text-emerald-400"}`}>
                        {item.stockQty}
                      </span>
                      {item.stockQty === 0 && <span className="ml-1 text-[10px] text-red-400 bg-red-500/10 px-1 rounded">OUT</span>}
                      {item.stockQty > 0 && item.stockQty <= 10 && <span className="ml-1 text-[10px] text-yellow-400 bg-yellow-500/10 px-1 rounded">LOW</span>}
                    </td>
                    <td className="p-4"><span className="text-xs text-slate-400">{item.reservedStockQty}</span></td>
                    <td className="p-4"><span className="text-xs text-slate-400">{item.soldQty}</span></td>
                    <td className="p-4">
                      <button onClick={() => { setEditTarget(item); setNewStock(String(item.stockQty)); }} className="p-1.5 rounded bg-slate-700 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-slate-400 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-slate-700 text-slate-400 hover:text-white bg-slate-800 text-xs">Previous</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="border-slate-700 text-slate-400 hover:text-white bg-slate-800 text-xs">Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription className="text-slate-400">
              Updating stock for <strong className="text-white">{editTarget?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">New Stock Quantity</Label>
              <Input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} min="0" className="bg-slate-900 border-slate-600 text-white" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditTarget(null)} className="border-slate-600 text-slate-300">Cancel</Button>
              <Button onClick={handleUpdate} disabled={updating} className="bg-primary hover:bg-primary/90">
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
