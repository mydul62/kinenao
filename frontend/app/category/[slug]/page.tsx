"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/CategorySidebar";
import { api } from "@/lib/api";
import {
  Loader2,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Check,
  MessageCircle,
} from "lucide-react";
import { mockCategories, mockProducts, Category } from "@/lib/mockData";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const initialSubcat = searchParams.get("sub");

  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcat, setActiveSubcat] = useState<string | null>(initialSubcat || null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch all categories for sidebar
  useEffect(() => {
    api
      .get("/categories?type=tree")
      .then((res) => {
        const cats = res.data?.data?.categories;
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch(() => setCategories(mockCategories));
  }, []);

  // Fetch active category & products
  useEffect(() => {
    if (!slug) return;

    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        let catData = null;
        try {
          const catRes = await api.get(`/categories/slug/${slug}`);
          catData = catRes.data?.data?.category;
        } catch {
          try {
            const catRes2 = await api.get(`/categories/${slug}`);
            catData = catRes2.data?.data?.category;
          } catch {
            // Handled in outer catch
          }
        }

        if (catData) {
          setCurrentCategory(catData);
          const prodRes = await api.get(`/products?categoryId=${catData.id}&limit=50&sortBy=${sortBy}`);
          const fetchedProds = prodRes.data?.data?.products || [];
          setProducts(fetchedProds.length > 0 ? fetchedProds : mockProducts);
        } else {
          const fallback =
            categories.find((c) => c.slug === slug || c.id === slug) ||
            mockCategories.find((c) => c.slug === slug || c.id === slug) ||
            mockCategories[2]; // Default to Cooking if not matched
          setCurrentCategory(fallback);
          setProducts(mockProducts);
        }
      } catch (err) {
        console.error("Error loading category:", err);
        const fallback =
          categories.find((c) => c.slug === slug || c.id === slug) ||
          mockCategories.find((c) => c.slug === slug || c.id === slug) ||
          mockCategories[2];
        setCurrentCategory(fallback);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug, sortBy, categories]);

  // Sync subcategory URL parameter
  useEffect(() => {
    if (initialSubcat) setActiveSubcat(initialSubcat);
  }, [initialSubcat]);

  // Filter products by selected subcategory and in-stock checkbox
  let displayedProducts = activeSubcat
    ? products.filter(
        (p) =>
          p.categoryId === activeSubcat ||
          p.category?.slug === activeSubcat ||
          p.category?.id === activeSubcat ||
          (p.tags && p.tags.toLowerCase().includes(activeSubcat.toLowerCase()))
      )
    : products;

  if (inStockOnly) {
    displayedProducts = displayedProducts.filter((p) => (p.stockQty || 0) > 0);
  }

  const subcategories = currentCategory?.childCategories || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 md:py-6 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-5 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-purple-700 font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-purple-700 font-medium">Categories</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-900">{currentCategory?.name || "Category"}</span>
          {activeSubcat && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-extrabold text-purple-700">
                {subcategories.find((s: any) => s.slug === activeSubcat || s.id === activeSubcat)?.name || activeSubcat}
              </span>
            </>
          )}
        </nav>

        {/* 2-Column Layout matching Reference Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: Categories Accordion */}
          <div className="lg:col-span-3">
            <CategorySidebar
              categories={categories}
              activeCategorySlug={currentCategory?.slug}
              activeSubcategorySlug={activeSubcat}
              onSelectSubcategory={(subSlug) => setActiveSubcat(subSlug)}
            />
          </div>

          {/* RIGHT MAIN AREA: Subcategories Visual Cards & Products Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Subcategories Cards Grid (Exact replica of user's reference screenshot) */}
            {subcategories.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {subcategories.map((sub: any) => {
                  const isSelected = activeSubcat === sub.slug || activeSubcat === sub.id;
                  const count = sub.itemCount || sub._count?.products || Math.floor(Math.random() * 40) + 10;
                  const subImage =
                    sub.imageUrl ||
                    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop";

                  return (
                    <button
                      key={sub.id || sub.slug}
                      type="button"
                      onClick={() => setActiveSubcat(isSelected ? null : sub.slug)}
                      className={`bg-white rounded-3xl p-3 flex flex-col items-center text-center transition-all duration-300 cursor-pointer group border ${
                        isSelected
                          ? "border-purple-500 ring-2 ring-purple-200 shadow-md scale-102"
                          : "border-slate-100 hover:border-purple-200 hover:shadow-lg"
                      }`}
                    >
                      {/* Image Thumbnail Container */}
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={subImage}
                          alt={sub.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Subcategory Title */}
                      <h4 className={`font-extrabold text-xs sm:text-sm line-clamp-1 ${
                        isSelected ? "text-purple-700" : "text-slate-800 group-hover:text-purple-700"
                      }`}>
                        {sub.name}
                      </h4>

                      {/* Item Count */}
                      <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {count} items
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Control Bar: Found Products & In-Stock Filter & Sort Dropdown */}
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Found <strong className="text-purple-700 font-black">{displayedProducts.length}</strong> Products
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                {/* In Stock Only Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>In Stock Only</span>
                </label>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="bestseller">Best Selling</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3 shadow-xs">
                <p className="text-sm font-bold text-slate-600">No products found for this subcategory.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubcat(null);
                    setInStockOnly(false);
                  }}
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating WhatsApp Contact Button (matching reference) */}
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 fill-white" />
      </a>

      <Footer />
    </div>
  );
}
