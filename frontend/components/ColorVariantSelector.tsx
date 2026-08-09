"use client";

import React from "react";
import { Check, AlertCircle, Sparkles } from "lucide-react";

export interface VariantItem {
  id?: string;
  name: string;
  colorName?: string | null;
  colorCode?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  stockQty?: number;
  size?: string | null;
  isActive?: boolean;
}

interface ColorVariantSelectorProps {
  variants: VariantItem[];
  selectedVariant: VariantItem | null;
  onSelectVariant: (variant: VariantItem) => void;
  basePrice?: number;
  className?: string;
}

export default function ColorVariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
  basePrice = 0,
  className = "",
}: ColorVariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with Active Selection & Stock Status */}
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <span>সিলেক্ট করুন (অপশন / কালার):</span>
          {selectedVariant && (
            <span className="text-emerald-800 font-black bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 text-xs">
              {selectedVariant.name || selectedVariant.colorName || selectedVariant.size}
            </span>
          )}
        </label>

        {selectedVariant && selectedVariant.stockQty !== undefined && (
          <span className="text-xs font-semibold">
            {selectedVariant.stockQty > 0 ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                স্টকে আছে ({selectedVariant.stockQty} টি)
              </span>
            ) : (
              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                স্টক শেষ
              </span>
            )}
          </span>
        )}
      </div>

      {/* Responsive Grid of Variant Options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {variants.map((v, idx) => {
          const isSelected = selectedVariant?.id
            ? selectedVariant.id === v.id
            : selectedVariant?.name === v.name;
          const isOutOfStock = v.stockQty !== undefined && v.stockQty <= 0;
          const variantEffectivePrice =
            v.discountPrice !== null && v.discountPrice !== undefined
              ? v.discountPrice
              : v.price !== null && v.price !== undefined
              ? v.price
              : basePrice;

          const hasColorDot = Boolean(v.colorCode);

          return (
            <button
              key={v.id || idx}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={`relative flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-xs scale-[1.02]"
                  : isOutOfStock
                  ? "border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed"
                  : "border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50 shadow-2xs"
              }`}
            >
              {/* Color Swatch Circle */}
              {hasColorDot ? (
                <div
                  className="w-6 h-6 rounded-full border border-black/10 shrink-0 shadow-inner flex items-center justify-center"
                  style={{
                    backgroundColor: v.colorCode || "#111827",
                  }}
                >
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 stroke-[3] ${
                        v.colorCode &&
                        (v.colorCode.toLowerCase() === "#ffffff" ||
                          v.colorCode.toLowerCase() === "#fde68a" ||
                          v.colorCode.toLowerCase() === "#fff")
                          ? "text-slate-900"
                          : "text-white"
                      }`}
                    />
                  )}
                </div>
              ) : (
                /* Size/Weight Pill Icon */
                <div
                  className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black uppercase ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {v.size ? v.size.slice(0, 2) : "✓"}
                </div>
              )}

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {v.name || v.colorName || v.size}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px] font-black text-emerald-700">
                    ৳{variantEffectivePrice}
                  </span>
                  {isOutOfStock && (
                    <span className="text-[9px] font-bold text-rose-600 uppercase bg-rose-50 px-1 rounded ml-auto">
                      Out
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
