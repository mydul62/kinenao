"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Heart, ShoppingCart, Loader2, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CustomerWishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data.data.wishlist || []);
    } catch { toast.error("Failed to load wishlist"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.success("Removed from wishlist");
      fetch();
    } catch { toast.error("Failed to remove"); }
  };

  const handleAddToCart = (product: any) => {
    addToCart({ id: product.id, name: product.name, price: product.discountPrice || product.price, thumbnail: product.thumbnail, stockQty: product.stockQty });
    toast.success("Added to cart!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-slate-800">My Wishlist</h1>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Your wishlist is empty</p>
          <Link href="/shop" className="mt-4 inline-block text-primary text-sm font-semibold hover:underline">Browse Products →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item: any) => {
            const product = item.product || item;
            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:border-slate-300 transition-colors">
                <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <Link href={`/product/${product.id}`} className="font-semibold text-slate-800 text-sm hover:text-primary line-clamp-2">{product.name}</Link>
                  <p className="text-primary font-black mt-1">৳{product.discountPrice || product.price}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleAddToCart(product)} disabled={product.stockQty === 0} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {product.stockQty === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button onClick={() => handleRemove(product.id)} className="p-2 border border-red-200 rounded-lg text-red-400 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
