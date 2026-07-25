"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, RefreshCw, Loader2, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20, role: "CUSTOMER" };
      if (search) params.search = search;
      const { data } = await api.get("/dashboard/customers", { params });
      setCustomers(data.data.customers || []);
      setTotalPages(data.data.pagination?.totalPages || 1);
      setTotal(data.data.pagination?.total || 0);
    } catch {
      try {
        const { data } = await api.get("/auth/users", { params: { page, limit: 20 } });
        setCustomers(data.data.users || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotal(data.data.pagination?.total || 0);
      } catch {
        toast.error("Failed to load customer accounts");
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Customer Accounts
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              {total} Registered Users
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            View registered customer profiles, contact information, order history, and registration dates.
          </p>
        </div>
      </div>

      {/* Controls */}
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
            placeholder="Search by customer name or email..."
            className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all"
          />
        </div>

        <Button
          variant="outline"
          onClick={fetchCustomers}
          size="sm"
          className="border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refresh
        </Button>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Users className="h-12 w-12 mb-3 text-slate-300" />
              <p className="font-bold text-slate-800 text-base">No customers found</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-6">Customer Profile</th>
                  <th className="py-4 px-4">Email Address</th>
                  <th className="py-4 px-4">Phone Number</th>
                  <th className="py-4 px-4">Total Purchases</th>
                  <th className="py-4 px-6 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {c.profile?.avatarUrl ? (
                          <img
                            src={c.profile.avatarUrl}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#6C5CE7]/15 text-[#6C5CE7] font-extrabold flex items-center justify-center text-xs shrink-0 ring-2 ring-[#6C5CE7]/20">
                            {c.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-slate-900 font-bold text-xs md:text-sm">
                          {c.profile?.fullName || c.email.split("@")[0]}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-700 font-medium">{c.email}</td>

                    <td className="py-4 px-4 text-slate-500 font-mono text-xs">
                      {c.profile?.phoneNumber || "Not provided"}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-[#6C5CE7] border border-purple-200">
                        {c._count?.orders || 0} Orders
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right text-slate-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
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
    </div>
  );
}
