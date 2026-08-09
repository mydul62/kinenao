"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, Sparkles, Send, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { BlogPost } from "@/lib/blogData";

interface BlogListClientProps {
  posts: BlogPost[];
}

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["All", "Skincare", "Makeup", "Trends", "Beauty Tools"];

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  const featuredPost = posts[0];
  const regularPosts = filteredPosts.filter(
    (post) => post.id !== featuredPost?.id || activeCategory !== "All"
  );

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Thank you for subscribing to our updates!");
      setNewsletterEmail("");
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Category Tabs */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Featured Post */}
        {activeCategory === "All" && featuredPost && (
          <div className="group relative overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md transition-all hover:border-primary/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="relative aspect-16/10 lg:aspect-auto lg:col-span-7 overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent lg:hidden" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-400">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {featuredPost.readTime}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white group-hover:text-primary transition-colors leading-tight">
                  <Link href={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="h-8 w-8 rounded-full border border-neutral-700 object-cover"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-bold text-neutral-200">
                        {featuredPost.author.name}
                      </span>
                      <span className="block text-[10px] text-neutral-500">{featuredPost.date}</span>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    Read Article <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {regularPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/30 backdrop-blur-xs transition-all hover:border-primary/40 hover:-translate-y-1"
            >
              <Link href={`/blog/${post.id}`} className="relative aspect-16/10 overflow-hidden block">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">
                  {post.category}
                </span>
              </Link>

              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                    <Calendar className="h-3 w-3" />
                    <span>{post.date}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="h-6 w-6 rounded-full object-cover border border-neutral-700"
                    />
                    <span className="text-[11px] font-medium text-neutral-300">
                      {post.author.name}
                    </span>
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                  >
                    Read <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter Signup Banner */}
      <div className="container mx-auto px-4 max-w-4xl pt-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-neutral-900 to-primary/10 border border-primary/30 p-8 sm:p-12 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">Subscribe to Beauty Tips</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Get weekly skincare secrets, makeup trends, and exclusive discount codes directly to
              your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary font-medium"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Subscribe</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
