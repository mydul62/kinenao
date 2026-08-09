import React from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogListClient from "@/components/blog/BlogListClient";
import { blogPosts } from "@/lib/blogData";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Beauty Journal & Skincare Guides | KineNao Blog",
  description:
    "Read professional skincare rituals, makeup tutorials, and beauty tips curated by KineNao experts.",
};

/**
 * Server-Side Rendered Blog List Page (Next.js 15 Server Component)
 */
export default async function BlogListPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white selection:bg-primary selection:text-white">
      <Header />

      {/* Hero Banner Section */}
      <div className="relative overflow-hidden border-b border-neutral-900 bg-neutral-950 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,94,94,0.08),transparent_45%)]" />
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="container mx-auto px-4 max-w-6xl text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            <Sparkles className="h-3 w-3 animate-pulse" /> Beauty Journal & Tips
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl font-sans">
            THE GLOW{" "}
            <span className="text-primary font-normal italic font-serif uppercase">
              Chronicles
            </span>
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Professional skincare rituals, creative makeup guides, and product tutorials curated by
            our expert beauticians.
          </p>
        </div>
      </div>

      <main className="flex-1 py-10">
        <BlogListClient posts={blogPosts} />
      </main>

      <Footer />
    </div>
  );
}
