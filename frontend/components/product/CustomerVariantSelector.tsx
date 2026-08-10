"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Check, Sparkles } from "lucide-react";

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

/**
 * Safely extracts combination object from a variant row
 */
function getVariantCombo(v: VariantItem): Record<string, string> {
  let combo: Record<string, string> = {};
  if (v.combination) {
    if (typeof v.combination === "string") {
      try {
        combo = JSON.parse(v.combination);
      } catch {
        combo = {};
      }
    } else if (typeof v.combination === "object") {
      combo = { ...v.combination };
    }
  }

  // Fallback / merge explicit fields
  if (v.size && !combo.size) combo.size = v.size;
  if (v.colorName && !combo.color) combo.color = v.colorName;
  if (v.weight && !combo.weight) combo.weight = v.weight;

  return combo;
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

  // 1. Safely parse structured attributes
  const parsedAttributes = useMemo(() => {
    if (!attributes) return null;
    let list = attributes;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = null;
      }
    }
    if (Array.isArray(list) && list.length > 0) {
      return list.filter((a) => a && a.values && a.values.length > 0);
    }
    return null;
  }, [attributes]);

  // 2. Determine resolved attribute groups (from explicit attributes OR derived from variants)
  const resolvedAttributes: AttributeConfig[] = useMemo(() => {
    if (parsedAttributes && parsedAttributes.length > 0) {
      return parsedAttributes;
    }

    // Intelligently derive attribute groups from variants
    const derived: AttributeConfig[] = [];

    // Check sizes
    const sizes = Array.from(
      new Set(
        variants
          .map((v) => {
            const combo = getVariantCombo(v);
            return combo.size || v.size;
          })
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
      const combo = getVariantCombo(v);
      const cName = combo.color || v.colorName;
      const cCode = v.colorCode || (combo && combo.colorCode);
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
          .map((v) => {
            const combo = getVariantCombo(v);
            return combo.weight || v.weight;
          })
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

    // If still empty but flat variants exist
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
  }, [parsedAttributes, variants]);

  // 3. Active Customer Selections: { size: "M", color: "Red" }
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    if (selectedVariant) {
      const combo = getVariantCombo(selectedVariant);
      if (Object.keys(combo).length > 0) return combo;
      return {
        ...(selectedVariant.size ? { size: selectedVariant.size } : {}),
        ...(selectedVariant.colorName ? { color: selectedVariant.colorName } : {}),
        ...(selectedVariant.weight ? { weight: selectedVariant.weight } : {}),
        ...(selectedVariant.name ? { option: selectedVariant.name } : {}),
      };
    }

    // Default to first variant
    const firstVar = variants[0];
    if (firstVar) {
      const combo = getVariantCombo(firstVar);
      if (Object.keys(combo).length > 0) return combo;
      return {
        ...(firstVar.size ? { size: firstVar.size } : {}),
        ...(firstVar.colorName ? { color: firstVar.colorName } : {}),
        ...(firstVar.weight ? { weight: firstVar.weight } : {}),
        ...(firstVar.name ? { option: firstVar.name } : {}),
      };
    }

    return {};
  });

  // Sync selectedAttrs when selectedVariant prop updates from outside
  useEffect(() => {
    if (selectedVariant) {
      const combo = getVariantCombo(selectedVariant);
      if (Object.keys(combo).length > 0) {
        setSelectedAttrs((prev) => {
          // Check if different to avoid loop
          const isSame = Object.entries(combo).every(([k, v]) => prev[k] === v);
          return isSame ? prev : combo;
        });
      }
    }
  }, [selectedVariant]);

  // 4. Handle clicking an attribute value (Smart Selection)
  const handleSelectValue = useCallback(
    (attrId: string, value: string) => {
      const targetAttrs = {
        ...selectedAttrs,
        [attrId]: value,
      };

      // 1) Look for exact match with targetAttrs
      let match = variants.find((v) => {
        const combo = getVariantCombo(v);
        return Object.entries(targetAttrs).every(
          ([k, val]) => !val || combo[k] === val
        );
      });

      // 2) If no exact match (e.g. selected color isn't available in new size),
      // fallback to first variant having this clicked value
      if (!match) {
        match = variants.find((v) => {
          const combo = getVariantCombo(v);
          return combo[attrId] === value;
        });
      }

      if (match) {
        const newCombo = getVariantCombo(match);
        setSelectedAttrs(newCombo);
        onSelectVariant(match);
      } else {
        setSelectedAttrs(targetAttrs);
      }
    },
    [selectedAttrs, variants, onSelectVariant]
  );

  // 5. Check availability of a specific value
  const checkValueAvailability = useCallback(
    (attrId: string, value: string) => {
      // Does ANY variant in catalog have this value?
      const variantsWithValue = variants.filter((v) => {
        const combo = getVariantCombo(v);
        return combo[attrId] === value;
      });

      const exists = variantsWithValue.length > 0;
      if (!exists) {
        return { exists: false, isCompatible: false, hasStock: false };
      }

      // Does this value exist with the CURRENT OTHER selections?
      const compatibleMatches = variantsWithValue.filter((v) => {
        const combo = getVariantCombo(v);
        for (const [otherAttrId, otherVal] of Object.entries(selectedAttrs)) {
          if (otherAttrId !== attrId && otherVal) {
            if (combo[otherAttrId] && combo[otherAttrId] !== otherVal) {
              return false;
            }
          }
        }
        return true;
      });

      const isCompatible = compatibleMatches.length > 0;
      const targetList = isCompatible ? compatibleMatches : variantsWithValue;
      const hasStock = targetList.some((v) => (v.stockQty ?? 0) > 0);

      return {
        exists: true,
        isCompatible,
        hasStock,
      };
    },
    [variants, selectedAttrs]
  );

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
                const isOutOfStock = !availability.hasStock;
                const isNonExistent = !availability.exists;

                // Color Swatches Layout
                if (isColorAttr || val.code) {
                  return (
                    <button
                      key={val.name}
                      type="button"
                      disabled={isNonExistent}
                      onClick={() => handleSelectValue(attr.id, val.name)}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/30 text-emerald-950 shadow-xs scale-102"
                          : isNonExistent
                          ? "bg-slate-50 border-slate-200 text-slate-300 opacity-40 cursor-not-allowed line-through"
                          : isOutOfStock
                          ? "bg-white border-rose-200 text-slate-600 hover:border-rose-400 opacity-70"
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
                    disabled={isNonExistent}
                    onClick={() => handleSelectValue(attr.id, val.name)}
                    className={`relative px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm scale-102"
                        : isNonExistent
                        ? "bg-slate-50 border-slate-200 text-slate-300 opacity-40 cursor-not-allowed line-through"
                        : isOutOfStock
                        ? "bg-white border-rose-200 text-slate-700 hover:border-rose-300 opacity-70"
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

