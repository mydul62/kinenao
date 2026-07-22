"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, RefreshCw, Loader2, Star, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  isApproved: boolean;
  helpfulVotes: number;
  images: string[];
  createdAt: string;
  customer: { email: string; profile?: { fullName?: string } };
  product: { name: string; thumbnail?: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "pending") params.isApproved = "false";
      if (filter === "approved") params.isApproved = "true";
      const { data } = await api.get("/reviews", { params });
      setReviews(data.data.reviews || []);
    } catch { toast.error("Failed to load reviews"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAction = async (id: string, approve: boolean) => {
    setProcessing(id);
    try {
      await api.patch(`/reviews/${id}`, { isApproved: approve });
      toast.success(approve ? "Review approved" : "Review rejected");
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = reviews.filter(r =>
    r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.customer?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Reviews</h1>
        <p className="text-slate-400 text-sm mt-1">Moderate and manage customer reviews</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
          {(["pending", "approved", "all"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or customer..." className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <Button variant="outline" onClick={fetch} size="icon" className="border-slate-700 text-slate-400 hover:text-white bg-slate-800">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-800 border border-slate-700 rounded-xl">
            <Star className="h-10 w-10 mb-2 text-slate-600" /><p>No reviews found</p>
          </div>
        ) : filtered.map(review => (
          <div key={review.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-start gap-4">
              {review.product?.thumbnail ? (
                <img src={review.product.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-bold text-sm">{review.product?.name}</p>
                    <p className="text-slate-400 text-xs">{review.customer?.profile?.fullName || review.customer?.email}</p>
                    <div className="flex mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${review.isApproved ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                    {!review.isApproved && (
                      <button onClick={() => handleAction(review.id, true)} disabled={processing === review.id} className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {review.isApproved && (
                      <button onClick={() => handleAction(review.id, false)} disabled={processing === review.id} className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-300 text-sm mt-2 line-clamp-3">{review.reviewText}</p>
                <p className="text-slate-600 text-xs mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
