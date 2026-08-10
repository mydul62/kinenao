import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogDetailClient from "@/components/blog/BlogDetailClient";
import { blogPosts } from "@/lib/blogData";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dynamic SEO Metadata for Blog Article
 */
export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return {
      title: "Article Not Found | KineNao Blog",
      description: "Read beauty guides and articles on KineNao.",
    };
  }

  return {
    title: `${post.title} | KineNao Beauty Journal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.imageUrl }],
    },
  };
}

/**
 * Server-Side Rendered Blog Detail Page (Next.js 15 Server Component)
 */
export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter(
      (p) => p.id !== id && (p.category === post.category || p.id !== blogPosts[0].id)
    )
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white selection:bg-primary selection:text-white">
      <Header />

      <main className="flex-1">
        <BlogDetailClient post={post} relatedPosts={relatedPosts} />
      </main>

      <Footer />
    </div>
  );
}
