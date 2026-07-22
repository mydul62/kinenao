"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, RefreshCw, Loader2, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Customer {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    fullName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
  };
  _count?: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20, role: "CUSTOMER" };
      if (search) params.search = search;
      const { data } = await api.get("/dashboard/customers", { params });
      setCustomers(data.data.customers || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
      setTotal(data.data.pagination?.total || 0);
    } catch {
      // Fallback to auth/me users endpoint
      try {
        const { data } = await api.get("/auth/users", { params: { page, limit: 20 } });
        setCustomers(data.data.users || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotal(data.data.pagination?.total || 0);
      } catch {
        toast.error("Failed to load customers");
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">{total} registered customers</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <Button variant="outline" onClick={fetch} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Users className="h-10 w-10 mb-2 text-slate-600" /><p>No customers found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Customer</th>
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Phone</th>
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Orders</th>
                <th className="p-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {c.profile?.avatarUrl ? (
                        <img src={c.profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-xs">{c.email.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <span className="text-white font-medium text-xs">{c.profile?.fullName || "No name"}</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="text-slate-300 text-xs">{c.email}</span></td>
                  <td className="p-4"><span className="text-slate-400 text-xs">{c.profile?.phoneNumber || "—"}</span></td>
                  <td className="p-4"><span className="text-white text-xs font-bold">{c._count?.orders || 0}</span></td>
                  <td className="p-4"><span className="text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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
    </div>
  );
}
