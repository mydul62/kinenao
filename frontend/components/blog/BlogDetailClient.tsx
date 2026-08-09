"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, MessageSquare, Share2, Heart, Send } from "lucide-react";
import { toast } from "sonner";
import { BlogPost } from "@/lib/blogData";

interface BlogDetailClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogDetailClient({ post, relatedPosts }: BlogDetailClientProps) {
  const [likes, setLikes] = useState(24);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([
    {
      id: "1",
      name: "Alyssa Miller",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      content:
        "This skincare guide is exactly what I was looking for! I've been struggling with dry skin all season, definitely trying the Vitamin C tip.",
      date: "2 hours ago",
    },
    {
      id: "2",
      name: "Jessica Taylor",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
      content:
        "Incredibly detailed post. The brush cleaning schedule is a lifesaver, I always forget how often they need to be washed!",
      date: "1 day ago",
    },
  ]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      toast.success("Thank you for loving this article!");
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      name: commentName,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
      content: commentText,
      date: "Just now",
    };

    setComments([newComment, ...comments]);
    setCommentName("");
    setCommentText("");
    toast.success("Your comment has been posted!");
  };

  return (
    <article className="container mx-auto px-4 max-w-4xl py-12 space-y-12">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Articles
      </Link>

      {/* Article Header */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          {post.category}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-7 w-7 rounded-full border border-neutral-700 object-cover"
            />
            <span className="font-semibold text-neutral-200">{post.author.name}</span>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {post.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readTime}
          </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-16/9 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="prose prose-invert prose-neutral max-w-none text-neutral-300 leading-relaxed space-y-6 text-sm sm:text-base">
        <p className="text-lg text-neutral-200 leading-relaxed font-serif italic border-l-2 border-primary pl-4 my-6">
          {post.excerpt}
        </p>
        <div className="space-y-4">
          <p>{post.content}</p>
        </div>
      </div>

      {/* Action Strip: Likes & Share */}
      <div className="flex items-center justify-between py-6 border-t border-b border-neutral-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            hasLiked
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <Heart className={`h-4 w-4 ${hasLiked ? "fill-rose-400 text-rose-400" : ""}`} />
          <span>
            {likes} {likes === 1 ? "Like" : "Likes"}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-bold transition-all cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Article</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="space-y-8 pt-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>Comments ({comments.length})</span>
        </h3>

        {/* Comment Form */}
        <form
          onSubmit={handleAddComment}
          className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Leave a response
          </h4>
          <input
            type="text"
            required
            placeholder="Your name"
            value={commentName}
            onChange={(e) => setCommentName(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary font-medium"
          />
          <textarea
            required
            rows={3}
            placeholder="Share your thoughts or questions on this article..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary font-medium"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Post Comment</span>
          </button>
        </form>

        {/* Comment List */}
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="h-7 w-7 rounded-full object-cover border border-neutral-700"
                  />
                  <span className="text-xs font-bold text-neutral-200">{c.name}</span>
                </div>
                <span className="text-[10px] text-neutral-500">{c.date}</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed pl-9">{c.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-neutral-800">
          <h3 className="text-xl font-black text-white">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                href={`/blog/${rp.id}`}
                className="group bg-neutral-900/30 border border-neutral-800 rounded-2xl overflow-hidden hover:border-primary/40 transition-all p-3 space-y-2.5 block"
              >
                <div className="aspect-16/10 rounded-xl overflow-hidden">
                  <img
                    src={rp.image}
                    alt={rp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[10px] font-bold text-primary block uppercase">
                  {rp.category}
                </span>
                <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                  {rp.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
