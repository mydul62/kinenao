"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts, BlogPost } from "@/lib/blogData";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, Sparkles, Send, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["All", "Skincare", "Makeup", "Trends", "Beauty Tools"];

  const filteredPosts = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

  const featuredPost = blogPosts[0];
  const regularPosts = filteredPosts.filter(post => post.id !== featuredPost.id || activeCategory !== "All");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubmitting(true);
    try {
      // Simulate newsletter subscribe
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Thank you for subscribing to our beauty updates!");
      setNewsletterEmail("");
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

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
            THE GLOW <span className="text-primary font-normal italic font-serif uppercase">Chronicles</span>
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Professional skincare rituals, creative makeup guides, and product tutorials curated by our expert beauticians.
          </p>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl space-y-16">
        
        {/* Featured Hero Post */}
        {activeCategory === "All" && featuredPost && (
          <div className="group relative bg-neutral-900/40 border border-neutral-800/80 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-primary/20 hover:shadow-primary/5">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 relative aspect-video lg:aspect-auto min-h-[300px] lg:h-[480px] overflow-hidden">
                <img
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent lg:hidden" />
              </div>
              <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center space-y-6 bg-neutral-900/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-primary text-white">
                    {featuredPost.category}
                  </span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> {featuredPost.readTime}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
                  {featuredPost.title}
                </h2>
                
                <p className="text-neutral-450 text-xs sm:text-sm leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={featuredPost.author.avatarUrl}
                    alt={featuredPost.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{featuredPost.author.name}</p>
                    <p className="text-[9px] text-neutral-500 mt-1">{featuredPost.author.role}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center text-xs font-bold text-primary group/link hover:underline gap-1"
                  >
                    Read Full Article
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-y border-neutral-900 py-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeCategory === category
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/10 scale-105"
                  : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col bg-neutral-900/20 border border-neutral-800/80 rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:border-primary/20 hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-103"
                />
                <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-neutral-950/80 backdrop-blur-md text-primary border border-primary/20">
                  {post.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary" /> {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="border-t border-neutral-800/60 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-800"
                    />
                    <div>
                      <p className="text-[10px] font-bold text-white leading-none">{post.author.name}</p>
                      <p className="text-[8px] text-neutral-500 mt-0.5">{post.author.role}</p>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${post.id}`}
                    className="p-2 rounded-xl bg-neutral-900 hover:bg-primary text-neutral-400 hover:text-white transition-all border border-neutral-800 hover:border-primary"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 space-y-3 bg-neutral-900/40 border border-neutral-850 rounded-3xl">
            <BookOpen className="h-10 w-10 text-neutral-700 mx-auto" />
            <p className="text-neutral-400 text-sm font-semibold">No articles found in this category.</p>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="relative rounded-3xl overflow-hidden border border-neutral-850 p-8 md:p-12 bg-[radial-gradient(circle_at_bottom_left,rgba(229,94,94,0.06),transparent_50%)]">
          <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
            <h3 className="text-2xl font-black tracking-tight text-white">Subscribe to Beauty Tips</h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Get skincare recommendations, makeup inspiration, and early access to promotions delivered directly to your inbox weekly.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-colors placeholder:text-neutral-600"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                {submitting ? "Subscribing..." : "Subscribe"}
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
