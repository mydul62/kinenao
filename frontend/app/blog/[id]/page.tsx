"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/lib/blogData";
import { ArrowLeft, Clock, Calendar, MessageSquare, Share2, Heart, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);

  const post = blogPosts.find((p) => p.id === id);

  const relatedPosts = blogPosts
    .filter((p) => p.id !== id && (p.category === post?.category || p.id !== blogPosts[0].id))
    .slice(0, 3);

  // Comments state
  const [comments, setComments] = useState<any[]>([
    {
      id: "1",
      name: "Alyssa Miller",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      content: "This skincare guide is exactly what I was looking for! I've been struggling with dry skin all season, definitely trying the Vitamin C tip.",
      date: "2 hours ago"
    },
    {
      id: "2",
      name: "Jessica Taylor",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
      content: "Incredibly detailed post. The brush cleaning schedule is a lifesaver, I always forget how often they need to be washed!",
      date: "1 day ago"
    }
  ]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState(24);
  const [hasLiked, setHasLiked] = useState(false);

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-950 text-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
          <h2 className="text-xl font-bold">Article not found</h2>
          <Link href="/blog" className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/95 transition-all">
            Back to Journal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
      toast.success("Added to your favorites!");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      name: commentName,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100", // fallback avatar
      content: commentText,
      date: "Just now"
    };

    setComments([newComment, ...comments]);
    setCommentName("");
    setCommentText("");
    toast.success("Comment posted successfully!");
  };

  // Parse markdown-like content to JSX
  const renderContent = () => {
    return post.content.split("\n\n").map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (trimmed.startsWith("###")) {
        return (
          <h3 key={index} className="text-xl font-black text-white mt-10 mb-4 border-l-3 border-primary pl-4 tracking-tight">
            {trimmed.replace("###", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("*")) {
        return (
          <ul key={index} className="list-disc list-inside text-neutral-300 text-sm leading-relaxed my-4 space-y-2.5 pl-4 font-medium">
            {trimmed.split("\n").map((li, i) => (
              <li key={i}>{li.replace("*", "").trim()}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={index} className="text-neutral-350 text-sm leading-relaxed mb-6 font-medium">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white selection:bg-primary selection:text-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,94,94,0.04),transparent_50%)] pointer-events-none" />

        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-xs font-bold text-neutral-400 hover:text-primary transition-colors gap-1.5 z-10 relative"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>

        {/* Article Metadata */}
        <div className="space-y-4 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-primary text-white">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between border-y border-neutral-900 py-5 gap-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-800"
              />
              <div>
                <p className="text-xs font-bold text-white leading-none">{post.author.name}</p>
                <p className="text-[9px] text-neutral-500 mt-1">{post.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-neutral-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-primary" /> {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-primary" /> {post.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Large Cover Image */}
        <div className="aspect-[21/9] rounded-3xl overflow-hidden border border-neutral-900 shadow-2xl relative z-10">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Content Body */}
        <div className="max-w-2xl mx-auto py-4 relative z-10 border-b border-neutral-900 pb-10">
          {renderContent()}

          {/* Likes & Share Action bar */}
          <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-neutral-900">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                hasLiked
                  ? "bg-primary border-primary text-white scale-105"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
            >
              <Heart className={`h-4.5 w-4.5 ${hasLiked ? "fill-white" : ""}`} />
              <span>{likes} Favorites</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 cursor-pointer transition-all"
            >
              <Share2 className="h-4.5 w-4.5" />
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-2xl mx-auto space-y-8 pt-8">
          <h4 className="text-lg font-black text-white flex items-center gap-2">
            <MessageSquare className="text-primary h-5 w-5" /> Discussion ({comments.length})
          </h4>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-4 bg-neutral-900/30 border border-neutral-850 p-6 rounded-2xl">
            <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-300">Join the discussion</h5>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-colors placeholder:text-neutral-600"
                required
              />
              <textarea
                placeholder="Share your thoughts or questions..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-colors placeholder:text-neutral-600 resize-none"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                Post Comment
                <Send className="h-3 w-3" />
              </button>
            </div>
          </form>

          {/* Comment List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 border-b border-neutral-900 pb-4">
                <img
                  src={comment.avatar}
                  alt={comment.name}
                  className="w-9 h-9 rounded-full object-cover border border-neutral-800 flex-shrink-0"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{comment.name}</span>
                    <span className="text-[9px] text-neutral-500">{comment.date}</span>
                  </div>
                  <p className="text-xs text-neutral-455 leading-relaxed font-medium">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Articles Suggestions */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-neutral-900 pt-12 space-y-6">
            <h4 className="text-lg font-black text-white">Recommended Reading</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.id}`}
                  className="group flex flex-col bg-neutral-900/20 border border-neutral-850 rounded-2xl overflow-hidden shadow transition-all duration-300 hover:border-primary/20"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" />
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <h5 className="text-xs font-black text-white line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {related.title}
                    </h5>
                    <p className="text-[9px] text-neutral-500 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" /> {related.readTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
