"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Star, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reviews/my");
      setReviews(data.data.reviews || []);
    } catch { toast.error("Failed to load reviews"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-slate-800">My Reviews</h1>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Star className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No reviews written yet</p>
          <Link href="/shop" className="mt-4 inline-block text-primary text-sm font-semibold hover:underline">Shop and review products →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                {review.product?.thumbnail ? (
                  <img src={review.product.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1">
                  <Link href={`/product/${review.product?.id}`} className="font-semibold text-slate-800 text-sm hover:text-primary">
                    {review.product?.name}
                  </Link>
                  <div className="flex mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm mt-2">{review.reviewText}</p>
                  <p className="text-slate-400 text-xs mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${review.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {review.isApproved ? "Approved" : "Pending"}
                  </span>
                  <button onClick={() => handleDelete(review.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
