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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { mockCategories } from "@/lib/mockData";

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateQuantity, cartCount, cartSubtotal } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch categories
    api
      .get("/categories?type=tree")
      .then((res) => {
        const cats = res.data.data.categories || [];
        setCategories(cats.length > 0 ? cats : mockCategories);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setCategories(mockCategories);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-background">
      {/* 1. Red Top Bar */}
      <div className="bg-primary text-primary-foreground text-[10px] font-bold h-9 flex items-center justify-between px-4 tracking-wider uppercase border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer">
            ENGLISH <ChevronDown className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer">
            USD <ChevronDown className="h-3 w-3" />
          </div>
          <span className="hidden md:inline font-medium">
            FREE SHIPPING ON ALL ORDERS OF ৳1500 | 100% AUTHENTIC COSMETICS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <a href="#" className="hover:opacity-80 transition-opacity"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:opacity-80 transition-opacity"><Twitter className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:opacity-80 transition-opacity"><Instagram className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:opacity-80 transition-opacity"><Youtube className="h-3.5 w-3.5" /></a>
          </div>
          <span className="text-white/40">|</span>
          <a href="/#faqs" className="hover:underline">Contact Us</a>
          <a href="/#faqs" className="hover:underline">FAQS</a>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          
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

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background px-4 py-4 space-y-4 shadow-inner"
          >
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-4 pr-10 rounded border text-xs"
              />
              <button type="submit" className="absolute right-3 text-muted-foreground">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="flex flex-col gap-2 font-bold text-xs uppercase tracking-wider">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">
                Home
              </Link>
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">
                Shop Catalog
              </Link>
              <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">
                Blog Journal
              </Link>
              <Link href="/#faqs" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">
                Contact & FAQs
              </Link>
            </div>
          </motion.div>
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
                            <p className="text-[10px] text-muted-foreground">
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
