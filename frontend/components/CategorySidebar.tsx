"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Layers,
  Coffee,
  ChefHat,
  Milk,
  Apple,
  HeartPulse,
  Home as HomeIcon,
  Fish,
  Dog,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  parentId?: string | null;
  childCategories?: CategoryItem[];
  itemCount?: number;
  _count?: { products: number };
}

interface CategorySidebarProps {
  categories: CategoryItem[];
  activeCategorySlug?: string;
  activeSubcategorySlug?: string | null;
  onSelectSubcategory?: (subSlug: string | null) => void;
  className?: string;
}

export default function CategorySidebar({
  categories,
  activeCategorySlug,
  activeSubcategorySlug,
  onSelectSubcategory,
  className = "",
}: CategorySidebarProps) {
  const router = useRouter();
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    [activeCategorySlug || ""]: true,
  });

  const toggleExpand = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCats((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const getCategoryIcon = (name: string) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("beauty") || lower.includes("লিপস্টিক")) return Sparkles;
    if (lower.includes("beverage") || lower.includes("চা") || lower.includes("coffee")) return Coffee;
    if (lower.includes("cooking") || lower.includes("রান্না") || lower.includes("spices")) return ChefHat;
    if (lower.includes("dairy") || lower.includes("egg") || lower.includes("milk")) return Milk;
    if (lower.includes("fruit") || lower.includes("vegetable") || lower.includes("শাক")) return Apple;
    if (lower.includes("health") || lower.includes("hygiene")) return HeartPulse;
    if (lower.includes("cleaning") || lower.includes("home")) return HomeIcon;
    if (lower.includes("meat") || lower.includes("fish") || lower.includes("মাংস")) return Fish;
    if (lower.includes("pet") || lower.includes("cat") || lower.includes("dog")) return Dog;
    if (lower.includes("stationery") || lower.includes("office") || lower.includes("বই")) return BookOpen;
    if (lower.includes("saree") || lower.includes("শাড়ি") || lower.includes("piece")) return Layers;
    return ShoppingBag;
  };

  return (
    <aside className={`w-full bg-white rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3 px-2">
        CATEGORIES
      </h3>

      {/* Categories Accordion List */}
      <div className="space-y-1">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          const isCategoryActive =
            activeCategorySlug === cat.slug || activeCategorySlug === cat.id;
          const isExpanded = expandedCats[cat.slug] || isCategoryActive;
          const hasChildren = cat.childCategories && cat.childCategories.length > 0;

          return (
            <div key={cat.id || cat.slug} className="space-y-1">
              {/* Category Main Item */}
              <div
                className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isCategoryActive
                    ? "bg-purple-50/80 text-purple-700 font-extrabold border border-purple-200/70 shadow-xs"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold"
                }`}
                onClick={() => {
                  setExpandedCats((prev) => ({ ...prev, [cat.slug]: !prev[cat.slug] }));
                  router.push(`/category/${cat.slug}`);
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isCategoryActive
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs sm:text-[13px] truncate">{cat.name}</span>
                </div>

                {hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(cat.slug, e)}
                    className="p-1 text-slate-400 hover:text-purple-600 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Nested Subcategories */}
              {hasChildren && isExpanded && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-purple-100 ml-4">
                  {cat.childCategories!.map((sub) => {
                    const isSubActive =
                      activeSubcategorySlug === sub.slug || activeSubcategorySlug === sub.id;

                    return (
                      <button
                        key={sub.id || sub.slug}
                        type="button"
                        onClick={() => {
                          if (onSelectSubcategory) {
                            onSelectSubcategory(isSubActive ? null : sub.slug);
                          } else {
                            router.push(`/category/${cat.slug}?sub=${sub.slug}`);
                          }
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all duration-150 flex items-center justify-between cursor-pointer ${
                          isSubActive
                            ? "bg-purple-600 text-white font-extrabold shadow-xs"
                            : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50 font-medium"
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        {sub.itemCount !== undefined && (
                          <span
                            className={`text-[10px] ml-1.5 shrink-0 ${
                              isSubActive ? "text-purple-100" : "text-slate-400"
                            }`}
                          >
                            {sub.itemCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
