import React from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopClientView from "@/components/shop/ShopClientView";
import { MessageCircle } from "lucide-react";
import {
  getAllCategoriesTree,
  getAllBrands,
  getProducts,
} from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Shop Catalog | KineNao Store",
  description:
    "Explore our complete collection of products with instant cash on delivery across Bangladesh.",
};

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sub?: string;
    sort?: string;
    page?: string;
  }>;
}

/**
 * Server-Side Rendered Shop Catalog Page (Next.js 15 Server Component)
 */
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { search, category, sub, sort, page } = await searchParams;

  // Fetch all initial data on the server in parallel
  const [categories, brands, productsData] = await Promise.all([
    getAllCategoriesTree(),
    getAllBrands(),
    getProducts({
      search: search || "",
      categoryId: sub || category || "",
      sortBy: sort || "newest",
      page: page || 1,
      limit: 250,
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-500 selection:text-white">
      <Header />

      <main className="flex-1">
        <ShopClientView
          categories={categories}
          brands={brands}
          initialProducts={productsData.products}
          pagination={productsData.pagination}
          initialCategory={category || ""}
          initialSubcat={sub || ""}
          initialSort={sort || "newest"}
          initialSearch={search || ""}
        />
      </main>

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        className="fixed bottom-6 right-4 sm:right-6 z-40 w-12 h-12 md:w-14 md:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 fill-white" />
      </a>

      <Footer />
    </div>
  );
}
