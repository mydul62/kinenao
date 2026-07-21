import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import { api } from "@/lib/api";
import { Star, ArrowLeft, Shield, RotateCcw, Truck, MessageSquare } from "lucide-react";
import { mockProducts } from "@/lib/mockData";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id: slug } = await params;

  let product: any = null;
  let relatedProducts: any[] = [];
  let reviews: any[] = [];

  try {
    // 1. Fetch active product by slug from API
    const prodRes = await api.get(`/products/slug/${slug}`);
    product = prodRes.data.data.product;

    if (product) {
      // 2. Fetch related items
      const relRes = await api.get(`/products?categoryId=${product.categoryId}&limit=4`);
      relatedProducts = (relRes.data.data.products || []).filter((p: any) => p.id !== product.id);

      // 3. Fetch reviews
      const revRes = await api.get(`/reviews/product/${product.id}`);
      reviews = revRes.data.data.reviews || [];
    }
  } catch (error) {
    console.error("Error loading product details from backend, falling back to mock:", error);
  }

  // Fallback lookup from mockData
  if (!product) {
    const foundMock = mockProducts.find(p => p.slug === slug || p.id === slug);
    if (foundMock) {
      product = foundMock;
      // Get related from mock
      relatedProducts = mockProducts.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 3);
      // Generate some dummy reviews for the mock item
      reviews = [
        {
          id: "rev-1",
          rating: 5,
          comment: "Absolutely authentic and high-quality! The formula is perfect, exactly like bought from store.",
          createdAt: new Date().toISOString(),
          user: { profile: { fullName: "Sadia Islam" } }
        },
        {
          id: "rev-2",
          rating: 4,
          comment: "Very elegant packaging and pigmentation is amazing. Highly recommended beauty product.",
          createdAt: new Date().toISOString(),
          user: { profile: { fullName: "Nusrat Jahan" } }
        }
      ];
    }
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-rose-50/20">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-24 text-center space-y-4">
          <h2 className="text-2xl font-black text-primary uppercase tracking-wider">Product Not Found</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            The requested beauty product "{slug}" could not be located in our catalog index.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-primary/90"
          >
            Browse Storefront
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.thumbnail || "/file.svg"];

  return (
    <div className="flex flex-col min-h-screen bg-rose-50/20">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
          </Link>
        </div>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start bg-white p-6 md:p-8 rounded-3xl border border-rose-100/50 shadow-sm">
          {/* Gallery Column */}
          <ProductGallery images={imagesList} name={product.name} />

          {/* Details Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-block bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.category?.name || "Beauty"}
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 text-yellow-500 text-sm">
                <div className="flex items-center gap-0.5">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-bold text-slate-800">
                    {reviews.length > 0
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                      : "4.8"}
                  </span>
                </div>
                <span className="text-slate-400 text-xs font-semibold">
                  | {reviews.length} Customer reviews
                </span>
              </div>
            </div>

            {/* Price Detail */}
            <div className="border-y border-rose-100/60 py-4 flex items-baseline gap-2">
              {product.discountPrice !== null ? (
                <>
                  <span className="text-3xl font-black text-slate-900">৳{product.discountPrice}</span>
                  <span className="text-slate-400 line-through text-sm">৳{product.price}</span>
                </>
              ) : (
                <span className="text-3xl font-black text-slate-900">৳{product.price}</span>
              )}
              {product.weight && (
                <span className="text-xs text-slate-500 ml-3">
                  ({product.weight} {product.unit})
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Product Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description || "Fresh and premium quality cosmetic item, sourced carefully and handled under strict sanitary guidelines to ensure best formulation and safety."}
              </p>
            </div>

            {/* Add to Cart */}
            <div className="pt-2">
              <AddToCartButton product={product} />
            </div>

            {/* Value Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-rose-100/50">
              <div className="flex flex-col items-center text-center p-3 bg-rose-50/20 border border-rose-100/30 rounded-2xl">
                <Truck className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Swift Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-rose-50/20 border border-rose-100/30 rounded-2xl">
                <RotateCcw className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-rose-50/20 border border-rose-100/30 rounded-2xl">
                <Shield className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">100% Authentic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="border-t border-rose-100/50 pt-12 space-y-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Customer Reviews
          </h2>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="border border-rose-100/40 p-5 rounded-2xl space-y-2 bg-white shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-800">{rev.user?.profile?.fullName || "Verified Buyer"}</span>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-current" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block">
                  Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4">No reviews recorded yet for this beauty product.</p>
            )}
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-rose-100/50 pt-12 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Related Products</h2>
              <p className="text-xs text-slate-500 mt-1">Recommended beauty picks for you in this category.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-rose-100/50 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col"
                >
                  <Link href={`/product/${prod.slug}`} className="relative aspect-square block bg-rose-50/10 border-b border-rose-100/30">
                    <img
                      src={prod.thumbnail || "/file.svg"}
                      alt={prod.name}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                    />
                  </Link>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <Link
                        href={`/product/${prod.slug}`}
                        className="block font-bold text-sm text-slate-800 hover:text-primary transition-colors truncate"
                      >
                        {prod.name}
                      </Link>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-semibold text-slate-700">{prod.rating || "4.8"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-sm text-slate-900">
                        ৳{prod.price}
                      </span>
                      <Link
                        href={`/product/${prod.slug}`}
                        className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
