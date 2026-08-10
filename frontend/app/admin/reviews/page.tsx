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

  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Product Reviews
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              {reviews.length} reviews
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Approve or reject customer product ratings, written reviews, and uploaded photos.
          </p>
        </div>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Total Reviews</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Star className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {reviews.length}
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Total feedback submissions
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Approved Reviews</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {approvedCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              Live on store pages
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Pending Approval</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <span className="font-extrabold text-[10px]">!</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {pendingCount}
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Awaiting moderation
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Avg Star Score</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              {avgRating} / 5.0
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              Storewide satisfaction
            </p>
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E4E8E4] shadow-xs">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          {/* Status Switcher */}
          <div className="flex items-center bg-[#F5F7F5] border border-[#E4E8E4] p-0.5 rounded-xl text-xs font-semibold">
            {(["pending", "approved", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  filter === f
                    ? "bg-[#123524] text-white shadow-xs font-bold"
                    : "text-[#5C685F] hover:text-[#131914]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B958D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or reviewer..."
              className="w-full bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#131914] placeholder:text-[#8B958D] focus:outline-none"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchReviews}
          size="sm"
          className="rounded-xl border-[#E4E8E4] bg-white text-[#131914] hover:bg-[#F1F6F2] font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer w-full sm:w-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#5C685F]" />
          Refresh
        </Button>
      </div>

      {/* 4. Review Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[#5C685F] bg-white rounded-2xl border border-[#E4E8E4]">
            <Star className="h-12 w-12 mb-3 text-[#8B958D]" />
            <p className="font-bold text-[#131914] text-base">No reviews found</p>
          </div>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs hover:border-[#123524]/40 transition-all"
            >
              <div className="flex items-start gap-3.5">
                {review.product?.thumbnail ? (
                  <img
                    src={review.product.thumbnail}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-[#E4E8E4] shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#F1F6F2] rounded-xl flex items-center justify-center shrink-0 border border-[#E4EEE7]">
                    <Star className="h-5 w-5 text-[#123524]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[#131914] font-extrabold text-sm font-['Manrope']">{review.product?.name}</h3>
                      <p className="text-[#5C685F] text-xs mt-0.5">
                        Reviewed by: {review.customer?.profile?.fullName || review.customer?.email}
                      </p>
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-[#E4E8E4]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          review.isApproved
                            ? "bg-[#E6F5EB] text-[#1F8A4C]"
                            : "bg-[#FBEEE0] text-[#B5601A]"
                        }`}
                      >
                        {review.isApproved ? "• Approved" : "Pending"}
                      </span>

                      {!review.isApproved && (
                        <button
                          onClick={() => handleAction(review.id, true)}
                          disabled={processing === review.id}
                          className="p-1.5 rounded-lg border border-emerald-200 bg-[#E6F5EB] text-[#1F8A4C] hover:bg-emerald-100 transition-all cursor-pointer"
                          title="Approve review"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}

                      {review.isApproved && (
                        <button
                          onClick={() => handleAction(review.id, false)}
                          disabled={processing === review.id}
                          className="p-1.5 rounded-lg border border-rose-200 bg-[#FBEAEA] text-[#C23B3B] hover:bg-rose-100 transition-all cursor-pointer"
                          title="Unapprove review"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[#131914] text-xs mt-2.5 bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl p-2.5">
                    "{review.reviewText}"
                  </p>

                  <p className="text-[#8B958D] text-[10px] mt-1.5">
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
