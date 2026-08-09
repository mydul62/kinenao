"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/CategorySidebar";
import { api } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  Loader2,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import {
  mockProducts,
  mockCategories,
  mockBrands,
  Category,
} from "@/lib/mockData";

const ShopContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("sub") || "");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync search query from URL params changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedSubcategory(searchParams.get("sub") || "");
  }, [searchParams]);

  // Fetch categories & brands
  useEffect(() => {
    api
      .get("/categories?type=tree")
      .then((res) => {
        const cats = res.data?.data?.categories;
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch(() => setCategories(mockCategories));

    api
      .get("/brands")
      .then((res) => {
        const b = res.data?.data?.brands;
        if (b && b.length > 0) setBrands(b);
      })
      .catch(() => setBrands(mockBrands));
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (selectedCategory) queryParams.append("categoryId", selectedCategory);
        if (sortBy) queryParams.append("sortBy", sortBy);
        queryParams.append("page", page.toString());
        queryParams.append("limit", "24");

        const { data } = await api.get(`/products?${queryParams.toString()}`);
        const prods = data.data.products || [];
        if (prods.length > 0) {
          setProducts(prods);
          setTotalPages(data.data.pagination?.totalPages || 1);
        } else {
          setProducts(mockProducts);
        }
      } catch {
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, sortBy, page]);

  // Active category object
  const currentCategory =
    categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory) ||
    categories[2]; // Default Cooking
  const subcategories = currentCategory?.childCategories || [];

  // Filter products by selected subcategory and in-stock checkbox
  let displayedProducts = selectedSubcategory
    ? products.filter(
        (p) =>
          p.categoryId === selectedSubcategory ||
          p.category?.slug === selectedSubcategory ||
          p.category?.id === selectedSubcategory ||
          (p.tags && p.tags.toLowerCase().includes(selectedSubcategory.toLowerCase()))
      )
    : products;

  if (inStockOnly) {
    displayedProducts = displayedProducts.filter((p) => (p.stockQty || 0) > 0);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 md:py-6 max-w-7xl space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-purple-700 font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-800">Shop Catalog</span>
          {selectedCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-extrabold text-purple-700">{currentCategory?.name}</span>
            </>
          )}
        </nav>

        {/* 2-Column Layout matching Reference Screenshots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: Categories Tree */}
          <div className="lg:col-span-3">
            <CategorySidebar
              categories={categories}
              activeCategorySlug={selectedCategory || currentCategory?.slug}
              activeSubcategorySlug={selectedSubcategory}
              onSelectSubcategory={(subSlug) => setSelectedSubcategory(subSlug || "")}
            />
          </div>

          {/* RIGHT MAIN AREA: Subcategories Showcase Cards + Control Bar + Products Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Subcategories Visual Cards Grid */}
            {subcategories.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {subcategories.map((sub: any) => {
                  const isSelected = selectedSubcategory === sub.slug || selectedSubcategory === sub.id;
                  const count = sub.itemCount || sub._count?.products || Math.floor(Math.random() * 40) + 10;
                  const subImage =
                    sub.imageUrl ||
                    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop";

                  return (
                    <button
                      key={sub.id || sub.slug}
                      type="button"
                      onClick={() => setSelectedSubcategory(isSelected ? "" : sub.slug)}
                      className={`bg-white rounded-3xl p-3 flex flex-col items-center text-center transition-all duration-300 cursor-pointer group border ${
                        isSelected
                          ? "border-purple-500 ring-2 ring-purple-200 shadow-md scale-102"
                          : "border-slate-100 hover:border-purple-200 hover:shadow-lg"
                      }`}
                    >
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={subImage}
                          alt={sub.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <h4 className={`font-extrabold text-xs sm:text-sm line-clamp-1 ${
                        isSelected ? "text-purple-700" : "text-slate-800 group-hover:text-purple-700"
                      }`}>
                        {sub.name}
                      </h4>

                      <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {count} items
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Control Bar: Found Products & In-Stock & Sorting */}
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Found <strong className="text-purple-700 font-black">{displayedProducts.length}</strong> Products
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>In Stock Only</span>
                </label>

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
                <p className="text-sm font-bold text-slate-600">No products found.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubcategory("");
                    setSelectedCategory("");
                    setInStockOnly(false);
                  }}
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
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

      {/* Floating WhatsApp Support Button */}
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
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
