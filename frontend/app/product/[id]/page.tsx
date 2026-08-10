import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import { MessageCircle } from "lucide-react";
import { getProductBySlugOrId, getProducts } from "@/lib/server-api";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dynamic SEO Metadata for Product Page
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlugOrId(id);

  if (!product) {
    return {
      title: "Product Not Found | KineNao",
      description: "Find high quality products on KineNao online store.",
    };
  }

  const priceFormatted = `৳${(product.discountPrice || product.price).toLocaleString()}`;

  return {
    title: `${product.name} - ${priceFormatted} | KineNao`,
    description:
      product.description?.replace(/<[^>]*>?/gm, "").slice(0, 160) ||
      `Buy authentic ${product.name} at ${priceFormatted} with cash on delivery at KineNao.`,
    openGraph: {
      title: `${product.name} | KineNao`,
      description: `Buy ${product.name} at the best price online in Bangladesh.`,
      images: product.thumbnail || (product.images && product.images[0])
        ? [{ url: product.thumbnail || product.images[0] }]
        : [],
    },
  };
}

/**
 * Server-Side Rendered Product Details Page (Next.js 15 Server Component)
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  // 1. Fetch product data on the server
  const product = await getProductBySlugOrId(id);

  if (!product) {
    notFound();
  }

  // 2. Fetch related products on the server in parallel
  const relatedData = await getProducts({
    categoryId: product.categoryId || undefined,
    limit: 6,
  });

  const relatedProducts = relatedData.products.filter(
    (p: any) => p.id !== product.id
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f4ef] text-slate-900 selection:bg-[#0d8a4e] selection:text-white">
      <Header />

      <main className="flex-1">
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </main>

      {/* Floating WhatsApp Contact Button */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 w-12 h-12 md:w-14 md:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 fill-white" />
      </a>

      <Footer />
    </div>
  );
}
