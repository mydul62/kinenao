"use client";

import React, { useState, useEffect, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockProducts,
  mockCategories,
  mockBrands,
} from "@/lib/mockData";

// Core Shop Content Component that uses search parameters
const ShopContent = () => {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

  // Sync search query from URL params changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedBrand(searchParams.get("brand") || "");
  }, [searchParams]);

  // Fetch categories & brands once
  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        const cats = res.data.data.categories || [];
        setCategories(cats.length > 0 ? cats : mockCategories);
      })
      .catch(() => {
        setCategories(mockCategories);
      });

    api.get("/brands")
      .then((res) => {
        const b = res.data.data.brands || [];
        setBrands(b.length > 0 ? b : mockBrands);
      })
      .catch(() => {
        setBrands(mockBrands);
      });
  }, []);

  // Fetch products when filters or pagination changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (selectedCategory) queryParams.append("categoryId", selectedCategory);
        if (selectedBrand) queryParams.append("brandId", selectedBrand);
        if (minPrice) queryParams.append("minPrice", minPrice);
        if (maxPrice) queryParams.append("maxPrice", maxPrice);
        if (availability) queryParams.append("availability", availability);
        if (sortBy) queryParams.append("sortBy", sortBy);
        queryParams.append("page", page.toString());
        queryParams.append("limit", "12");

        const { data } = await api.get(`/products?${queryParams.toString()}`);
        const prods = data.data.products || [];
        if (prods.length > 0) {
          setProducts(prods);
          setTotalPages(data.data.pagination?.totalPages || 1);
        } else {
          applyMockFilters();
        }
      } catch (error) {
        console.error("Error fetching products, using mock:", error);
        applyMockFilters();
      } finally {
        setLoading(false);
      }
    };

    const applyMockFilters = () => {
      let filtered = [...mockProducts];

      // Search filter
      if (search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) || 
          p.description.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Category filter
      if (selectedCategory) {
        filtered = filtered.filter(p => p.categoryId === selectedCategory);
      }

      // Brand filter
      if (selectedBrand) {
        filtered = filtered.filter(p => p.brandId === selectedBrand);
      }

      // Price filter
      if (minPrice) {
        filtered = filtered.filter(p => (p.discountPrice || p.price) >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => (p.discountPrice || p.price) <= parseFloat(maxPrice));
      }

      // Availability
      if (availability === "in-stock") {
        filtered = filtered.filter(p => p.stockQty > 0);
      } else if (availability === "out-of-stock") {
        filtered = filtered.filter(p => p.stockQty === 0);
      }

      // Sort
      if (sortBy === "price_asc") {
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      } else if (sortBy === "price_desc") {
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      } else if (sortBy === "name_asc") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === "name_desc") {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      }

      const limit = 12;
      setProducts(filtered.slice((page - 1) * limit, page * limit));
      setTotalPages(Math.ceil(filtered.length / limit) || 1);
    };

    fetchProducts();
  }, [search, selectedCategory, selectedBrand, minPrice, maxPrice, availability, sortBy, page]);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`"${product.name}" added to cart!`);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("");
    setSortBy("newest");
    setPage(1);
    router.push("/shop");
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 bg-rose-50/10">
      {/* Sidebar Filter - Desktop */}
      <aside className="hidden md:block w-64 shrink-0 space-y-6">
        <div className="flex items-center justify-between border-b border-rose-100 pb-4">
          <h3 className="font-bold text-base flex items-center gap-2 text-slate-800">
            <Filter className="h-4 w-4 text-primary" /> Filters
          </h3>
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        </div>

        {/* Categories list */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Categories</h4>
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedCategory("")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                !selectedCategory ? "bg-primary/10 text-primary" : "hover:bg-rose-50 text-slate-500"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all truncate ${
                  selectedCategory === cat.id ? "bg-primary/10 text-primary" : "hover:bg-rose-50 text-slate-500"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Brands list */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Brands</h4>
          <div className="space-y-1 max-h-50 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedBrand("")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                !selectedBrand ? "bg-primary/10 text-primary" : "hover:bg-rose-50 text-slate-500"
              }`}
            >
              All Brands
            </button>
            {brands.map((br) => (
              <button
                key={br.id}
                onClick={() => {
                  setSelectedBrand(br.id);
                  setPage(1);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all truncate ${
                  selectedBrand === br.id ? "bg-primary/10 text-primary" : "hover:bg-rose-50 text-slate-500"
                }`}
              >
                {br.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price filter */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Price Range (৳)</h4>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 border border-rose-100 rounded-lg px-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-white text-slate-800"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 border border-rose-100 rounded-lg px-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Stock status filter */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Availability</h4>
          <div className="space-y-2">
            {[
              { label: "All Products", value: "" },
              { label: "In Stock Only", value: "in-stock" },
              { label: "Out of Stock", value: "out-of-stock" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-xs text-slate-500 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === opt.value}
                  onChange={() => {
                    setAvailability(opt.value);
                    setPage(1);
                  }}
                  className="rounded-full border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Catalog view */}
      <main className="flex-1 space-y-6">
        {/* Top bar controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-rose-100/50 rounded-2xl p-4">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search cosmetics..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-rose-100 bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs text-slate-800"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-end items-center">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsFilterMobileOpen(true)}
              className="md:hidden flex items-center gap-1.5 border border-rose-100 px-3 h-9 rounded-lg text-xs font-semibold hover:bg-rose-50 cursor-pointer text-slate-600 bg-white"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>

            {/* Sort control */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="h-9 border border-rose-100 rounded-lg px-2 text-xs bg-background focus:outline-none cursor-pointer text-slate-600 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="name_desc">Name: Z-A</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-rose-100/50 rounded-2xl p-5 space-y-4 animate-pulse bg-white">
                <div className="aspect-square bg-rose-50/20 rounded-xl" />
                <div className="h-4 bg-rose-50/20 rounded-full w-2/3" />
                <div className="h-4 bg-rose-50/20 rounded-full w-1/3" />
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-rose-50/20 rounded-full w-1/4" />
                  <div className="h-8 bg-rose-50/20 rounded-xl w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-rose-100 rounded-3xl bg-white text-center space-y-3">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <h4 className="font-bold text-lg text-slate-800">No products found</h4>
            <p className="text-sm text-slate-500 max-w-[280px]">
              No beauty products match your current preferences. Try adjusting filters or query.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-primary/95 transition-all cursor-pointer uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 border border-rose-100 rounded-xl hover:bg-rose-50 disabled:opacity-40 transition-all cursor-pointer bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-extrabold text-slate-700 px-3">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 border border-rose-100 rounded-xl hover:bg-rose-50 disabled:opacity-40 transition-all cursor-pointer bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>

      {/* Mobile Filters Drawer */}
      {isFilterMobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsFilterMobileOpen(false)} />
          <div className="relative z-10 w-full max-w-xs bg-white p-6 flex flex-col overflow-y-auto space-y-6 h-full shadow-xl">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-800">
                <Filter className="h-4 w-4 text-primary" /> Filters
              </h3>
              <button
                onClick={() => {
                  handleResetFilters();
                  setIsFilterMobileOpen(false);
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Categories</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    !selectedCategory ? "bg-primary/10 text-primary" : "hover:bg-rose-50 text-slate-500"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold truncate ${
                      selectedCategory === cat.id ? "bg-primary/10 text-primary" : "hover:bg-rose-50 text-slate-500"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Price Range (৳)</h4>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 border border-rose-100 rounded-lg px-2 text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 border border-rose-100 rounded-lg px-2 text-xs"
                />
              </div>
            </div>

            <button
              onClick={() => setIsFilterMobileOpen(false)}
              className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl text-xs hover:bg-primary/95 uppercase tracking-wider"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ShopPage() {
  return (
    <div className="flex flex-col min-h-screen bg-rose-50/20">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  );
}
