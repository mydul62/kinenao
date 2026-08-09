"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  LayoutDashboard,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  LogOut,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartSubtotal,
    formattedReservationTimer,
    isReservationExpired,
    resetReservationTimer,
  } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [announcementText, setAnnouncementText] = useState(
    "FREE SHIPPING ON ALL ORDERS OF ৳1500 | 100% AUTHENTIC COSMETICS | ⚡ SPECIAL DISCOUNT ON ALL PRODUCTS!"
  );

  useEffect(() => {
    // Fetch categories and website settings directly from database API
    Promise.all([api.get("/categories?type=tree"), api.get("/settings")])
      .then(([catRes, setRes]) => {
        const cats = catRes.data?.data?.categories || [];
        setCategories(cats);

        const settingsData = setRes.data?.data?.settings || {};
        const textVal = settingsData.announcementText?.value || settingsData.announcementText;
        if (textVal && typeof textVal === "string") {
          setAnnouncementText(textVal);
        }
      })
      .catch((err) => {
        console.error("Error fetching header data from DB:", err);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <header className="w-full bg-background">
      {/* 1. Red Top Bar with Slow Smooth Scrolling Promotional Ticker */}
      <div className="bg-primary text-primary-foreground text-[10px] font-bold h-9 flex items-center justify-between px-3 md:px-4 tracking-wider uppercase border-b relative overflow-hidden">
        {/* Center Dynamic Scrolling Promotional Marquee Ticker */}
        <div className="flex-1 overflow-hidden mx-3 relative flex items-center h-full">
          <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-white font-extrabold text-[11px] tracking-widest">
            <span>{announcementText}</span>
            <span className="text-amber-300 font-bold">✦</span>
            <span>{announcementText}</span>
            <span className="text-amber-300 font-bold">✦</span>
            <span>{announcementText}</span>
            <span className="text-amber-300 font-bold">✦</span>
            <span>{announcementText}</span>
          </div>
        </div>

        {/* Right Social Icons & Links */}
        <div className="flex items-center gap-3 z-10 bg-primary pl-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <a href="#" className="hover:opacity-80 transition-opacity"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:opacity-80 transition-opacity"><Twitter className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:opacity-80 transition-opacity"><Instagram className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:opacity-80 transition-opacity"><Youtube className="h-3.5 w-3.5" /></a>
          </div>
          <span className="hidden sm:inline text-white/40">|</span>
          <a href="/#faqs" className="hover:underline">Contact Us</a>
          <a href="/#faqs" className="hover:underline">FAQS</a>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="w-full flex h-20 items-center justify-between px-[4px] sm:px-3">
          
          {/* Logo - Akira Typographic Style */}
          <Link href="/" className="flex items-center gap-1 font-black text-2xl tracking-widest text-foreground font-sans">
            K I N E N A O <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block self-end mb-1.5" />
          </Link>

          {/* Navigation Menu Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-extrabold uppercase tracking-widest text-foreground">
            <Link href="/" className="text-primary hover:text-primary transition-colors">
              Home
            </Link>
            
            {/* Shop Link with HOT Badge */}
            <div className="relative">
              <Link href="/shop" className="hover:text-primary transition-colors">
                Shop
              </Link>
              <span className="absolute -top-3.5 -right-3 bg-primary text-[7px] font-bold text-white px-1 py-0.5 rounded uppercase leading-none">
                Hot
              </span>
            </div>

            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>

            <Link href="/#faqs" className="hover:text-primary transition-colors">
              Pages
            </Link>

            {/* Elementor Live Link with Blue Badge */}
            <div className="relative">
              <Link href="/shop" className="hover:text-primary transition-colors">
                Elementor Live
              </Link>
              <span className="absolute -top-3.5 -right-9 bg-blue-500 text-[6px] font-bold text-white px-1 py-0.5 rounded uppercase leading-none whitespace-nowrap">
                52+ Widgets
              </span>
            </div>
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-5">
            {/* Account link */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-foreground hover:text-primary cursor-pointer transition-colors">
                  Your Account
                </button>
                <div className="absolute right-0 top-6 z-20 w-48 rounded border bg-card p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    <span className="inline-block bg-primary/10 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded mt-1">
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    href={user?.role === "CUSTOMER" ? "/dashboard" : "/admin/dashboard"}
                    className="flex items-center gap-2 rounded px-3 py-2 text-xs font-bold hover:bg-muted transition-all"
                  >
                    <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 rounded px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition-all text-left cursor-pointer"
                  >
                    <LogOut className="h-4.5 w-4.5" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[11px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
              >
                Your Account
              </Link>
            )}

            {/* Search Trigger (Standard dialog or input toggler) */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 focus:w-48 h-8 pl-3 pr-8 rounded border border-border bg-muted/40 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/20 text-xs transition-all"
              />
              <button type="submit" className="absolute right-2.5 text-muted-foreground hover:text-primary">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Wishlist */}
            <Link href="/dashboard" className="p-1 hover:text-primary text-foreground transition-colors hidden sm:block">
              <Heart className="h-4.5 w-4.5" />
            </Link>

            {/* Cart Trigger with summary */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 hover:text-primary text-foreground transition-colors cursor-pointer"
            >
              <div className="relative p-1">
                <ShoppingBag className="h-4.5 w-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center border border-background">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold tracking-wider hidden md:inline">
                ৳{cartSubtotal.toFixed(2)}
              </span>
            </button>

            {/* Mobile Menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 hover:text-primary text-foreground"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Full-Screen / Slide-Out Mobile Navigation & Category Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col md:hidden overflow-hidden border-r border-slate-200"
            >
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between border-b px-5 bg-slate-900 text-white">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-black text-lg tracking-widest text-white flex items-center gap-1.5"
                >
                  K I N E N A O
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block self-end mb-1" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search all products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button type="submit" className="absolute right-3 text-slate-400 hover:text-emerald-600">
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {/* Primary Nav Links */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-center border border-slate-100 transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-emerald-600 text-white text-center shadow-xs font-black transition-colors"
                  >
                    Shop All
                  </Link>
                </div>

                {/* Database Categories Accordion Tree */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      ALL CATEGORIES ({categories.length})
                    </h3>
                  </div>

                  <div className="space-y-1">
                    {categories.map((cat) => {
                      const hasChildren = cat.childCategories && cat.childCategories.length > 0;
                      const isExpanded = Boolean(expandedCats[cat.id || cat.slug]);

                      return (
                        <div key={cat.id || cat.slug} className="border border-slate-100 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 transition-colors">
                            <Link
                              href={`/category/${cat.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex-1 text-xs font-extrabold text-slate-800 hover:text-emerald-700 truncate"
                            >
                              {cat.name}
                            </Link>

                            {hasChildren && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleCategoryExpand(cat.id || cat.slug);
                                }}
                                className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    isExpanded ? "rotate-180 text-emerald-600" : ""
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Subcategories list */}
                          {hasChildren && isExpanded && (
                            <div className="bg-slate-50/80 px-3 py-1.5 space-y-1 border-t border-slate-100">
                              {cat.childCategories.map((sub: any) => (
                                <Link
                                  key={sub.id || sub.slug}
                                  href={`/category/${cat.slug}?sub=${sub.slug}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block py-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors"
                                >
                                  • {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between">
                    <Link
                      href={user?.role === "CUSTOMER" ? "/dashboard" : "/admin/dashboard"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:underline"
                    >
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-2.5 bg-slate-900 text-white rounded-xl text-center text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sliding Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-sm border-l bg-card shadow-2xl flex flex-col"
            >
              <div className="flex h-16 items-center justify-between border-b px-6">
                <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="text-primary h-4.5 w-4.5" /> Shopping Cart
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full p-1.5 hover:bg-muted cursor-pointer transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length > 0 && (
                  <div
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isReservationExpired
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`w-4 h-4 ${
                          isReservationExpired ? "text-rose-600 animate-pulse" : "text-emerald-700"
                        }`}
                      />
                      <span>
                        {isReservationExpired
                          ? "কার্ট রিজার্ভেশনের সময় শেষ!"
                          : `আপনার কার্ট সংরক্ষিত আছে: ${formattedReservationTimer}`}
                      </span>
                    </div>
                    {isReservationExpired && (
                      <button
                        onClick={resetReservationTimer}
                        className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                      >
                        রিনিউ করুন
                      </button>
                    )}
                  </div>
                )}

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground/60" />
                    <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Your cart is empty</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-2 bg-primary text-primary-foreground font-bold px-4 py-2 text-xs hover:bg-primary/95 transition-all cursor-pointer"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const price = item.discountPrice !== null ? item.discountPrice : item.price;
                    return (
                      <div key={item.id} className="flex gap-4 border-b pb-4">
                        <img
                          src={item.thumbnail || "/file.svg"}
                          alt={item.name}
                          className="h-14 w-14 object-cover border bg-muted"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-xs line-clamp-1">{item.name}</h3>
                            {item.variantName && (
                              <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-1.5 py-0.2 rounded mt-0.5">
                                কালার / ভ্যারিয়েন্ট: {item.variantName}
                              </span>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              ৳{price} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border bg-muted/40">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:text-primary cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:text-primary cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive hover:text-destructive/80 p-1 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-6 space-y-4 bg-muted/10">
                  <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span className="text-primary text-base">৳{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <a
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full block bg-primary text-primary-foreground font-extrabold py-3 text-center text-xs uppercase tracking-widest shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    Proceed to Checkout
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
