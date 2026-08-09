"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "../context/CartContext";
import { ShoppingBag, ChevronDown, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const { cartCount } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api
      .get("/categories?type=tree")
      .then((res) => {
        const cats = res.data?.data?.categories || [];
        setCategories(cats);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Name */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="tracking-wider bg-primary/10 px-3 py-1 rounded-xl text-emerald-800 font-black">
            KineNao
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">
            Home
          </Link>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors cursor-pointer"
            >
              Categories <ChevronDown className="h-4 w-4" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                  onMouseEnter={() => setDropdownOpen(false)}
                />
                <div
                  className="absolute top-8 left-0 z-20 w-48 rounded-xl border bg-card p-2 shadow-lg"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.id || cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block rounded-lg px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Cart and Mobile Trigger */}
        <div className="flex items-center gap-4">
          {/* Cart status Indicator Button */}
          <Link
            href="/checkout"
            className="relative p-2.5 hover:bg-muted rounded-full transition-all cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5 text-foreground hover:text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-full transition-all"
          >
            {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold hover:text-primary border-b"
          >
            Home
          </Link>
          <div className="space-y-1">
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
              Shop Categories
            </span>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted text-foreground"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
