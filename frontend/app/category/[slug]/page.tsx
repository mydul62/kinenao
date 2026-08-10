import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryClientView from "@/components/category/CategoryClientView";
import { MessageCircle } from "lucide-react";
import {
  getCategoryBySlug,
  getAllCategoriesTree,
  getProducts,
} from "@/lib/server-api";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string; sort?: string }>;
}

/**
 * Dynamic SEO Metadata generated on the Server
 */
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | KineNao",
      description: "Browse products on KineNao online store.",
    };
  }

  return {
    title: `${category.name} | KineNao Store`,
    description:
      category.description ||
      `Buy authentic ${category.name} online with cash on delivery at KineNao.`,
    openGraph: {
      title: `${category.name} | KineNao`,
      description: category.description || `Explore ${category.name} products.`,
      images: category.imageUrl ? [{ url: category.imageUrl }] : [],
    },
  };
}

/**
 * Server-Side Rendered Category Page (Next.js 15 Server Component)
 */
export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { sub, sort } = await searchParams;

  // 1. Fetch category data on the server
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // 2. Fetch all categories tree & products on the server in parallel
  const [categories, productsData] = await Promise.all([
    getAllCategoriesTree(),
    getProducts({
      categoryId: category.id,
      sortBy: sort || "newest",
      limit: 50,
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f3ec] text-slate-900 selection:bg-[#123524] selection:text-white">
      <Header />

      <main className="flex-1">
        <CategoryClientView
          category={category}
          categories={categories}
          initialProducts={productsData.products}
          initialSubcat={sub || null}
          initialSort={sort || "newest"}
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
