"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check, AlertCircle, Sparkles } from "lucide-react";

export interface VariantItem {
  id?: string;
  name: string;
  combination?: Record<string, string> | any;
  colorName?: string | null;
  colorCode?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  stockQty?: number;
  size?: string | null;
  weight?: string | null;
  isActive?: boolean;
}

export interface AttributeConfig {
  id: string;
  name: string;
  label: string;
  values: Array<{ name: string; code?: string }>;
}

interface CustomerVariantSelectorProps {
  attributes?: AttributeConfig[] | any;
  variants: VariantItem[];
  selectedVariant: VariantItem | null;
  onSelectVariant: (variant: VariantItem | null) => void;
  basePrice?: number;
  className?: string;
}

export default function CustomerVariantSelector({
  attributes = [],
  variants = [],
  selectedVariant,
  onSelectVariant,
  basePrice = 0,
  className = "",
}: CustomerVariantSelectorProps) {
  // If no variants exist, render nothing
  if (!variants || variants.length === 0) return null;

  // 1. Determine structured attributes list
  // If product has explicit `attributes`, use them.
  // Otherwise, intelligently derive attribute groups from legacy variants.
  const resolvedAttributes: AttributeConfig[] = useMemo(() => {
    if (attributes && Array.isArray(attributes) && attributes.length > 0) {
      return attributes.filter((a) => a.values && a.values.length > 0);
    }

    // Derived from variants
    const derived: AttributeConfig[] = [];

    // Check sizes
    const sizes = Array.from(
      new Set(
        variants
          .map((v) => v.size || (v.combination && v.combination.size))
          .filter(Boolean)
      )
    );
    if (sizes.length > 0) {
      derived.push({
        id: "size",
        name: "Size",
        label: "সাইজ (Size)",
        values: sizes.map((s) => ({ name: s as string })),
      });
    }

    // Check colors
    const colorsMap = new Map<string, string | undefined>();
    variants.forEach((v) => {
      const cName = v.colorName || (v.combination && v.combination.color);
      const cCode = v.colorCode || (v.combination && v.combination.colorCode);
      if (cName && !colorsMap.has(cName)) {
        colorsMap.set(cName, cCode || undefined);
      }
    });
    if (colorsMap.size > 0) {
      derived.push({
        id: "color",
        name: "Color",
        label: "কালার (Color)",
        values: Array.from(colorsMap.entries()).map(([name, code]) => ({
          name,
          code,
        })),
      });
    }

    // Check weights
    const weights = Array.from(
      new Set(
        variants
          .map((v) => v.weight || (v.combination && v.combination.weight))
          .filter(Boolean)
      )
    );
    if (weights.length > 0) {
      derived.push({
        id: "weight",
        name: "Weight",
        label: "ওজন / পরিমাপ (Weight)",
        values: weights.map((w) => ({ name: w as string })),
      });
    }

    // If still empty but flat variants exist (e.g. general options)
    if (derived.length === 0 && variants.length > 1) {
      derived.push({
        id: "option",
        name: "Option",
        label: "অপশন নির্বাচন করুন (Options)",
        values: variants.map((v) => ({
          name: v.name,
          code: v.colorCode || undefined,
        })),
      });
    }

    return derived;
  }, [attributes, variants]);

  // 2. Active Customer Selections: { size: "M", color: "Red" }
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    if (selectedVariant) {
      if (selectedVariant.combination) {
        return { ...selectedVariant.combination };
      }
      return {
        ...(selectedVariant.size ? { size: selectedVariant.size } : {}),
        ...(selectedVariant.colorName ? { color: selectedVariant.colorName } : {}),
        ...(selectedVariant.weight ? { weight: selectedVariant.weight } : {}),
        ...(selectedVariant.name ? { option: selectedVariant.name } : {}),
      };
    }

    // Default to first available combination
    const firstVar = variants[0];
    if (firstVar?.combination) return { ...firstVar.combination };
    return {
      ...(firstVar?.size ? { size: firstVar.size } : {}),
      ...(firstVar?.colorName ? { color: firstVar.colorName } : {}),
      ...(firstVar?.weight ? { weight: firstVar.weight } : {}),
      ...(firstVar?.name ? { option: firstVar.name } : {}),
    };
  });

  // 3. Find exact matching variant whenever selections change
  useEffect(() => {
    // If only 1 attribute group or single option
    if (resolvedAttributes.length === 1 && resolvedAttributes[0].id === "option") {
      const selectedVal = selectedAttrs["option"];
      const match = variants.find((v) => v.name === selectedVal) || variants[0];
      onSelectVariant(match || null);
      return;
    }

    // Multi-attribute exact match
    const matched = variants.find((v) => {
      // If variant has combination object
      if (v.combination) {
        return Object.entries(selectedAttrs).every(
          ([attrId, selectedVal]) =>
            !selectedVal || v.combination[attrId] === selectedVal
        );
      }

      // Legacy fallback matching
      const sizeMatch = !selectedAttrs["size"] || v.size === selectedAttrs["size"];
      const colorMatch = !selectedAttrs["color"] || v.colorName === selectedAttrs["color"];
      const weightMatch = !selectedAttrs["weight"] || v.weight === selectedAttrs["weight"];
      return sizeMatch && colorMatch && weightMatch;
    });

    onSelectVariant(matched || null);
  }, [selectedAttrs, variants, resolvedAttributes]);

  // Handle clicking an attribute value
  const handleSelectValue = (attrId: string, value: string) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [attrId]: value,
    }));
  };

  // 4. Smart Availability Matrix Checker
  // Checks if a given value (e.g. Color = "Blue") is valid and has stock given current selections
  const checkValueAvailability = (attrId: string, value: string) => {
    // Find all variants that match current other selections + this value
    const potentialMatches = variants.filter((v) => {
      const combo = v.combination || {
        size: v.size,
        color: v.colorName,
        weight: v.weight,
        option: v.name,
      };

      if (combo[attrId] !== value) return false;

      // Check against all OTHER currently selected attributes
      for (const [otherAttrId, otherVal] of Object.entries(selectedAttrs)) {
        if (otherAttrId !== attrId && otherVal) {
          if (combo[otherAttrId] && combo[otherAttrId] !== otherVal) {
            return false;
          }
        }
      }
      return true;
    });

    const exists = potentialMatches.length > 0;
    const hasStock = potentialMatches.some((v) => (v.stockQty ?? 0) > 0);

    return {
      exists,
      hasStock,
      isAvailable: exists && hasStock,
    };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Render Independent Attribute Selectors */}
      {resolvedAttributes.map((attr) => {
        const isColorAttr = attr.id === "color";
        const currentValue = selectedAttrs[attr.id];

        return (
          <div key={attr.id} className="space-y-2">
            {/* Attribute Header */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <span>{attr.label || attr.name}:</span>
                {currentValue && (
                  <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs normal-case">
                    {currentValue}
                  </span>
                )}
              </label>
            </div>

            {/* Value Selector Options */}
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val) => {
                const isSelected = currentValue === val.name;
                const availability = checkValueAvailability(attr.id, val.name);
                const isOutOfStock = !availability.hasStock && availability.exists;
                const isInvalid = !availability.exists;

                // Color Swatches Layout
                if (isColorAttr || val.code) {
                  return (
                    <button
                      key={val.name}
                      type="button"
                      disabled={isInvalid}
                      onClick={() => handleSelectValue(attr.id, val.name)}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/30 text-emerald-950 shadow-xs scale-102"
                          : isInvalid
                          ? "bg-slate-50 border-slate-200 text-slate-300 opacity-40 cursor-not-allowed line-through"
                          : isOutOfStock
                          ? "bg-white border-rose-200 text-slate-600 hover:border-rose-400"
                          : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50 shadow-2xs"
                      }`}
                    >
                      {/* Color Circle */}
                      <span
                        className="w-4.5 h-4.5 rounded-full border border-black/15 shrink-0 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: val.code || "#111827" }}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3 h-3 stroke-[3] ${
                              val.code &&
                              (val.code.toLowerCase() === "#ffffff" ||
                                val.code.toLowerCase() === "#fff" ||
                                val.code.toLowerCase() === "#fde68a")
                                ? "text-slate-900"
                                : "text-white"
                            }`}
                          />
                        )}
                      </span>
                      <span>{val.name}</span>
                      {isOutOfStock && (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                          শেষ
                        </span>
                      )}
                    </button>
                  );
                }

                // Size / Weight / General Pills Layout
                return (
                  <button
                    key={val.name}
                    type="button"
                    disabled={isInvalid}
                    onClick={() => handleSelectValue(attr.id, val.name)}
                    className={`relative px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm scale-102"
                        : isInvalid
                        ? "bg-slate-50 border-slate-200 text-slate-300 opacity-40 cursor-not-allowed line-through"
                        : isOutOfStock
                        ? "bg-white border-rose-200 text-slate-700 hover:border-rose-300"
                        : "bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50 shadow-2xs"
                    }`}
                  >
                    <span>{val.name}</span>
                    {isOutOfStock && (
                      <span className="text-[9px] font-bold text-rose-600 block leading-none mt-0.5">
                        (স্টক শেষ)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Combination Feedback Pill & Stock Indicator */}
      {selectedVariant && (
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-slate-600 shrink-0">নির্বাচিত:</span>
            <span className="font-black text-slate-900 truncate">
              {selectedVariant.name}
            </span>
          </div>

          <div className="shrink-0 font-bold">
            {selectedVariant.stockQty !== undefined && selectedVariant.stockQty > 0 ? (
              <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                স্টকে আছে ({selectedVariant.stockQty} টি)
              </span>
            ) : (
              <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                স্টক শেষ
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
