import React from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeClientView from "@/components/home/HomeClientView";
import {
  getAllBanners,
  getAllCategoriesTree,
  getAllBrands,
  getAllFaqs,
  getAllTestimonials,
  getProducts,
} from "@/lib/server-api";

export const metadata: Metadata = {
  title: "KineNao - 100% Authentic E-Commerce Store in Bangladesh",
  description:
    "Shop authentic sarees, three-pieces, beauty cosmetics, fresh fruits & vegetables, groceries, and watches with cash on delivery across Bangladesh.",
};

/**
 * Server-Side Rendered Homepage (Next.js 15 Server Component)
 */
export default async function HomePage() {
  // Fetch all initial homepage data on the server in parallel
  const [banners, categories, brands, faqs, testimonials, productsData] =
    await Promise.all([
      getAllBanners(),
      getAllCategoriesTree(),
      getAllBrands(),
      getAllFaqs(),
      getAllTestimonials(),
      getProducts({ limit: 50 }),
    ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f3ec] text-slate-900 selection:bg-[#123524] selection:text-white font-['Inter',sans-serif]">
      <Header />

      <main className="flex-1 py-4 sm:py-6">
        <HomeClientView
          categories={categories}
          banners={banners}
          allProducts={productsData.products}
          brands={brands}
          faqs={faqs}
          testimonials={testimonials}
        />
      </main>

      <Footer />
    </div>
  );
}
