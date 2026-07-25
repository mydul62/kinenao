"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, RefreshCw, Loader2, Star, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "pending") params.isApproved = "false";
      if (filter === "approved") params.isApproved = "true";
      const { data } = await api.get("/reviews", { params });
      setReviews(data.data.reviews || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleAction = async (id: string, approve: boolean) => {
    setProcessing(id);
    try {
      await api.patch(`/reviews/${id}`, { isApproved: approve });
      toast.success(approve ? "Review approved" : "Review unapproved");
      fetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = reviews.filter(
    (r) =>
      r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.customer?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Customer Product Reviews
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              Moderation Queue
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Approve or reject customer product ratings, written reviews, and uploaded photos.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          {/* Status Switcher */}
          <div className="flex items-center bg-[#F8FAFC] border border-[#E5E7EB] p-1 rounded-xl text-xs font-semibold">
            {(["pending", "approved", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  filter === f
                    ? "bg-[#6C5CE7] text-white shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or reviewer..."
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchReviews}
          size="sm"
          className="border-[#E5E7EB] text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refresh
        </Button>
      </div>

      {/* Review Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white rounded-[24px] border border-[#E5E7EB]">
            <Star className="h-12 w-12 mb-3 text-slate-300" />
            <p className="font-bold text-slate-800 text-base">No reviews found</p>
          </div>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                {review.product?.thumbnail ? (
                  <img
                    src={review.product.thumbnail}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                    <Star className="h-6 w-6 text-[#6C5CE7]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-sm">{review.product?.name}</h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Reviewed by: {review.customer?.profile?.fullName || review.customer?.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          review.isApproved
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending Moderation"}
                      </span>

                      {!review.isApproved && (
                        <button
                          onClick={() => handleAction(review.id, true)}
                          disabled={processing === review.id}
                          className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-all"
                          title="Approve review"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}

                      {review.isApproved && (
                        <button
                          onClick={() => handleAction(review.id, false)}
                          disabled={processing === review.id}
                          className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition-all"
                          title="Unapprove review"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-800 text-xs md:text-sm mt-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3">
                    "{review.reviewText}"
                  </p>

                  <p className="text-slate-400 text-[11px] mt-2">
                    Submitted on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
