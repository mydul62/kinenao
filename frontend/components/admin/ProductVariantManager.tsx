"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Palette,
  Shirt,
  Scale,
  Cpu,
  Box,
  Copy,
  ArrowRight,
  Info,
  X,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AttributeValue {
  name: string;
  code?: string; // For colors (Hex)
}

export interface AttributeConfig {
  id: string; // 'size' | 'color' | 'weight' | 'fabric' | 'material' | 'age' | 'storage' | 'model'
  name: string;
  label: string;
  icon?: string;
  values: AttributeValue[];
}

export interface VariantCombinationRow {
  id?: string;
  name: string; // e.g. "M / Crimson Red"
  combination: Record<string, string>; // { size: "M", color: "Crimson Red" }
  combinationKey: string; // deterministic "color:Crimson Red|size:M"
  colorName?: string | null;
  colorCode?: string | null;
  size?: string | null;
  weight?: string | null;
  sku: string;
  price: number | "";
  discountPrice: number | "";
  stockQty: number;
  imageUrl?: string;
  isActive: boolean;
}

interface ProductVariantManagerProps {
  baseSku?: string;
  basePrice?: number | "";
  baseDiscountPrice?: number | "";
  initialAttributes?: AttributeConfig[];
  initialVariants?: any[];
  onChange: (data: {
    enableVariants: boolean;
    attributes: AttributeConfig[];
    variants: any[];
  }) => void;
}

// Available Attribute Definitions
export const SYSTEM_ATTRIBUTE_TYPES = [
  { id: "size", name: "Size", label: "সাইজ (Size)", icon: "Shirt" },
  { id: "color", name: "Color", label: "কালার (Color)", icon: "Palette" },
  { id: "weight", name: "Weight", label: "ওজন / পরিমাপ (Weight)", icon: "Scale" },
  { id: "fabric", name: "Fabric", label: "কাপড়ের ধরন (Fabric)", icon: "Box" },
  { id: "material", name: "Material", label: "ম্যাটেরিয়াল (Material)", icon: "Box" },
  { id: "age", name: "Age", label: "বয়স / গ্রুপ (Age)", icon: "Shirt" },
  { id: "storage", name: "Storage", label: "স্টোরেজ / ধারণক্ষমতা (Storage)", icon: "Cpu" },
  { id: "model", name: "Model", label: "মডেল / সংস্করণ (Model)", icon: "Layers" },
];

export const POPULAR_COLOR_PRESETS: AttributeValue[] = [
  { name: "Crimson Red", code: "#DC2626" },
  { name: "Royal Blue", code: "#1D4ED8" },
  { name: "Emerald Green", code: "#047857" },
  { name: "Classic Black", code: "#0F172A" },
  { name: "Pure White", code: "#FFFFFF" },
  { name: "Magenta Pink", code: "#EC4899" },
  { name: "Deep Maroon", code: "#831843" },
  { name: "Golden Yellow", code: "#EAB308" },
];

export const POPULAR_SIZE_PRESETS: AttributeValue[] = [
  { name: "S" },
  { name: "M" },
  { name: "L" },
  { name: "XL" },
  { name: "XXL" },
];

export const POPULAR_WEIGHT_PRESETS: AttributeValue[] = [
  { name: "250g" },
  { name: "500g" },
  { name: "1kg" },
  { name: "2kg" },
];

export default function ProductVariantManager({
  baseSku = "PROD-001",
  basePrice = "",
  baseDiscountPrice = "",
  initialAttributes,
  initialVariants,
  onChange,
}: ProductVariantManagerProps) {
  const [enableVariants, setEnableVariants] = useState(
    Boolean(
      (initialVariants && initialVariants.length > 0) ||
      (initialAttributes && initialAttributes.length > 0)
    )
  );

  // Active Attributes and Values
  const [attributes, setAttributes] = useState<AttributeConfig[]>(() => {
    if (initialAttributes && initialAttributes.length > 0) {
      return initialAttributes;
    }
    // Backward compatibility with legacy variants
    if (initialVariants && initialVariants.length > 0) {
      const hasColors = initialVariants.some((v) => v.colorName || v.colorCode);
      const hasSizes = initialVariants.some((v) => v.size);
      const attrs: AttributeConfig[] = [];
      if (hasSizes) {
        const sizes = Array.from(new Set(initialVariants.map((v) => v.size).filter(Boolean)));
        attrs.push({
          id: "size",
          name: "Size",
          label: "সাইজ (Size)",
          values: sizes.map((s) => ({ name: s })),
        });
      }
      if (hasColors) {
        const colors = initialVariants
          .filter((v) => v.colorName || v.name)
          .map((v) => ({ name: v.colorName || v.name, code: v.colorCode || "#111827" }));
        attrs.push({
          id: "color",
          name: "Color",
          label: "কালার (Color)",
          values: colors,
        });
      }
      return attrs;
    }
    return [];
  });

  // Variant combinations
  const [variants, setVariants] = useState<VariantCombinationRow[]>(() => {
    if (initialVariants && initialVariants.length > 0) {
      return initialVariants.map((v, idx) => ({
        id: v.id,
        name: v.name || `Variant ${idx + 1}`,
        combination: v.combination || {
          ...(v.size ? { size: v.size } : {}),
          ...(v.colorName ? { color: v.colorName } : {}),
          ...(v.weight ? { weight: v.weight } : {}),
        },
        combinationKey:
          v.combinationKey ||
          Object.entries(v.combination || {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, val]) => `${k}:${val}`)
            .join("|") ||
          `var-${idx}`,
        colorName: v.colorName || null,
        colorCode: v.colorCode || null,
        size: v.size || null,
        weight: v.weight || null,
        sku: v.sku || `${baseSku}-${idx + 1}`,
        price: v.price !== null && v.price !== undefined ? v.price : basePrice,
        discountPrice: v.discountPrice !== null && v.discountPrice !== undefined ? v.discountPrice : baseDiscountPrice,
        stockQty: v.stockQty !== undefined ? v.stockQty : 15,
        imageUrl: v.imageUrl || "",
        isActive: v.isActive !== undefined ? v.isActive : true,
      }));
    }
    return [];
  });

  // Inputs for adding custom values
  const [newValInputs, setNewValInputs] = useState<Record<string, string>>({});
  const [newColorCode, setNewColorCode] = useState("#DC2626");

  // Bulk Edit Inputs
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");

  // Notify parent on changes
  useEffect(() => {
    onChange({
      enableVariants,
      attributes: enableVariants ? attributes : [],
      variants: enableVariants
        ? variants.map((v) => ({
            id: v.id,
            name: v.name,
            combination: v.combination,
            colorName: v.colorName || null,
            colorCode: v.colorCode || null,
            size: v.size || null,
            weight: v.weight || null,
            sku: v.sku,
            price: v.price !== "" ? Number(v.price) : null,
            discountPrice: v.discountPrice !== "" ? Number(v.discountPrice) : null,
            stockQty: Number(v.stockQty) || 0,
            imageUrl: v.imageUrl || null,
            isActive: v.isActive,
          }))
        : [],
    });
  }, [enableVariants, attributes, variants]);

  // Toggle an attribute type (e.g. Size, Color)
  const toggleAttribute = (attrType: typeof SYSTEM_ATTRIBUTE_TYPES[0]) => {
    const exists = attributes.some((a) => a.id === attrType.id);
    if (exists) {
      setAttributes(attributes.filter((a) => a.id !== attrType.id));
    } else {
      setAttributes([
        ...attributes,
        {
          id: attrType.id,
          name: attrType.name,
          label: attrType.label,
          values: [],
        },
      ]);
    }
  };

  // Add a value to an attribute
  const addAttributeValue = (attrId: string, valueName: string, colorCode?: string) => {
    if (!valueName.trim()) return;
    setAttributes(
      attributes.map((attr) => {
        if (attr.id !== attrId) return attr;
        const valueExists = attr.values.some(
          (v) => v.name.toLowerCase() === valueName.trim().toLowerCase()
        );
        if (valueExists) return attr;
        return {
          ...attr,
          values: [
            ...attr.values,
            { name: valueName.trim(), ...(colorCode ? { code: colorCode } : {}) },
          ],
        };
      })
    );
    setNewValInputs({ ...newValInputs, [attrId]: "" });
  };

  // Remove a value from an attribute
  const removeAttributeValue = (attrId: string, valIndex: number) => {
    setAttributes(
      attributes.map((attr) => {
        if (attr.id !== attrId) return attr;
        const updated = [...attr.values];
        updated.splice(valIndex, 1);
        return { ...attr, values: updated };
      })
    );
  };

  // 1-Click Preset Applications
  const applyPreset = (presetType: "sizes" | "colors" | "weights" | "saree" | "threePiece") => {
    setEnableVariants(true);

    if (presetType === "sizes") {
      const exists = attributes.find((a) => a.id === "size");
      if (exists) {
        setAttributes(
          attributes.map((a) =>
            a.id === "size"
              ? {
                  ...a,
                  values: [
                    ...a.values,
                    ...POPULAR_SIZE_PRESETS.filter(
                      (p) => !a.values.some((v) => v.name.toLowerCase() === p.name.toLowerCase())
                    ),
                  ],
                }
              : a
          )
        );
      } else {
        setAttributes([
          ...attributes,
          { id: "size", name: "Size", label: "সাইজ (Size)", values: [...POPULAR_SIZE_PRESETS] },
        ]);
      }
    } else if (presetType === "colors") {
      const exists = attributes.find((a) => a.id === "color");
      if (exists) {
        setAttributes(
          attributes.map((a) =>
            a.id === "color"
              ? {
                  ...a,
                  values: [
                    ...a.values,
                    ...POPULAR_COLOR_PRESETS.filter(
                      (p) => !a.values.some((v) => v.name.toLowerCase() === p.name.toLowerCase())
                    ),
                  ],
                }
              : a
          )
        );
      } else {
        setAttributes([
          ...attributes,
          { id: "color", name: "Color", label: "কালার (Color)", values: [...POPULAR_COLOR_PRESETS] },
        ]);
      }
    } else if (presetType === "weights") {
      const exists = attributes.find((a) => a.id === "weight");
      if (exists) {
        setAttributes(
          attributes.map((a) =>
            a.id === "weight"
              ? {
                  ...a,
                  values: [
                    ...a.values,
                    ...POPULAR_WEIGHT_PRESETS.filter(
                      (p) => !a.values.some((v) => v.name.toLowerCase() === p.name.toLowerCase())
                    ),
                  ],
                }
              : a
          )
        );
      } else {
        setAttributes([
          ...attributes,
          { id: "weight", name: "Weight", label: "ওজন / পরিমাপ (Weight)", values: [...POPULAR_WEIGHT_PRESETS] },
        ]);
      }
    } else if (presetType === "saree" || presetType === "threePiece") {
      // Saree / Three Piece: Size + Colors
      const currentAttrs = [...attributes];
      let updated = currentAttrs;

      if (!updated.some((a) => a.id === "color")) {
        updated.push({
          id: "color",
          name: "Color",
          label: "কালার (Color)",
          values: POPULAR_COLOR_PRESETS.slice(0, 4),
        });
      }

      if (presetType === "threePiece" && !updated.some((a) => a.id === "size")) {
        updated.push({
          id: "size",
          name: "Size",
          label: "সাইজ (Size)",
          values: [
            { name: "Unstitched (আনস্টিচ)" },
            { name: "M (Medium)" },
            { name: "L (Large)" },
            { name: "XL (Extra Large)" },
          ],
        });
      }

      setAttributes(updated);
    }
  };

  // Cartesian Product Generator
  const generateCartesianCombinations = () => {
    const activeAttrsWithValues = attributes.filter((a) => a.values.length > 0);
    if (activeAttrsWithValues.length === 0) return;

    // Helper: Cartesian product of arrays
    const cartesian = (arrays: any[][]): any[][] => {
      return arrays.reduce((acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])), [[]]);
    };

    const valueArrays = activeAttrsWithValues.map((attr) =>
      attr.values.map((v) => ({
        attrId: attr.id,
        attrName: attr.name,
        value: v.name,
        code: v.code,
      }))
    );

    const productResults = cartesian(valueArrays);

    // Existing variants map for preserving user-customized price/stock
    const existingMap = new Map<string, VariantCombinationRow>();
    variants.forEach((v) => {
      existingMap.set(v.combinationKey, v);
    });

    const newRows: VariantCombinationRow[] = productResults.map((combo, idx) => {
      const combinationObj: Record<string, string> = {};
      let colorName: string | null = null;
      let colorCode: string | null = null;
      let sizeVal: string | null = null;
      let weightVal: string | null = null;

      combo.forEach((item: any) => {
        combinationObj[item.attrId] = item.value;
        if (item.attrId === "color") {
          colorName = item.value;
          colorCode = item.code || null;
        } else if (item.attrId === "size") {
          sizeVal = item.value;
        } else if (item.attrId === "weight") {
          weightVal = item.value;
        }
      });

      // Deterministic key: "color:Red|size:M"
      const combinationKey = Object.entries(combinationObj)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join("|");

      // Auto-generated name: e.g. "M / Crimson Red" or "500g"
      const comboName = Object.values(combinationObj).join(" / ");

      // Auto SKU: e.g. "PROD-M-RED"
      const skuSuffix = Object.values(combinationObj)
        .map((v) => v.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ""))
        .join("-");
      const generatedSku = `${baseSku || "SKU"}-${skuSuffix || idx + 1}`;

      // If combination already existed, preserve customized price and stock
      const existing = existingMap.get(combinationKey);
      if (existing) {
        return {
          ...existing,
          name: comboName,
          combination: combinationObj,
          combinationKey,
          colorName: colorName || existing.colorName,
          colorCode: colorCode || existing.colorCode,
          size: sizeVal || existing.size,
          weight: weightVal || existing.weight,
        };
      }

      return {
        name: comboName,
        combination: combinationObj,
        combinationKey,
        colorName,
        colorCode,
        size: sizeVal,
        weight: weightVal,
        sku: generatedSku,
        price: basePrice !== "" ? basePrice : "",
        discountPrice: baseDiscountPrice !== "" ? baseDiscountPrice : "",
        stockQty: 15,
        imageUrl: "",
        isActive: true,
      };
    });

    setVariants(newRows);
  };

  // Update a single variant combination field
  const updateVariantRow = (
    index: number,
    field: keyof VariantCombinationRow,
    value: any
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Remove a single combination row
  const removeVariantRow = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  // Bulk Price Apply
  const handleApplyBulkPrice = () => {
    if (!bulkPrice || isNaN(Number(bulkPrice))) return;
    const num = Number(bulkPrice);
    setVariants(variants.map((v) => ({ ...v, price: num })));
    setBulkPrice("");
  };

  // Bulk Stock Apply
  const handleApplyBulkStock = () => {
    if (!bulkStock || isNaN(Number(bulkStock))) return;
    const num = Number(bulkStock);
    setVariants(variants.map((v) => ({ ...v, stockQty: num })));
    setBulkStock("");
  };

  // Total possible combinations calculation
  const totalCombinationsCount = useMemo(() => {
    const counts = attributes.map((a) => a.values.length).filter((len) => len > 0);
    if (counts.length === 0) return 0;
    return counts.reduce((acc, curr) => acc * curr, 1);
  }, [attributes]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* Top Header with Enable Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase text-slate-800 tracking-wider">
              Section F: Product Variants & Attributes
            </h2>
            <p className="text-[11px] text-slate-500">
              Configure independent attribute types (Size, Color, Weight) & generate matrix combinations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-2xl shrink-0">
          <Switch
            checked={enableVariants}
            onCheckedChange={(checked) => {
              setEnableVariants(checked);
              if (checked && attributes.length === 0) {
                applyPreset("colors");
              }
            }}
          />
          <span className="text-xs font-bold text-slate-800">
            {enableVariants ? "Variants Enabled" : "Single Product"}
          </span>
        </div>
      </div>

      {enableVariants && (
        <div className="space-y-6">
          {/* STEP 1: Quick Presets & Attribute Selector Cards */}
          <div className="space-y-3">
            {/* 1-Click Presets */}
            <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-2">
              <p className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>1-Click Preset Generators:</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("sizes")}
                  className="text-xs font-bold bg-white hover:bg-purple-100 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  <Shirt className="w-3.5 h-3.5 inline mr-1" /> + Sizes (S, M, L, XL, XXL)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("colors")}
                  className="text-xs font-bold bg-white hover:bg-purple-100 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  <Palette className="w-3.5 h-3.5 inline mr-1" /> + Color Swatches
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("weights")}
                  className="text-xs font-bold bg-white hover:bg-purple-100 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  <Scale className="w-3.5 h-3.5 inline mr-1" /> + Weights (250g, 500g, 1kg)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("threePiece")}
                  className="text-xs font-bold bg-white hover:bg-purple-100 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  + Saree / Three-Piece
                </button>
              </div>
            </div>

            {/* STEP 1: Select Attribute Types */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Step 1: Select Which Attributes This Product Needs:
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SYSTEM_ATTRIBUTE_TYPES.map((attr) => {
                  const isSelected = attributes.some((a) => a.id === attr.id);
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => toggleAttribute(attr)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-50/80 border-purple-600 ring-1 ring-purple-500 text-purple-950 font-black shadow-2xs"
                          : "bg-white border-slate-200 hover:border-purple-300 text-slate-700 font-bold hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs truncate">{attr.label}</span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isSelected ? "bg-purple-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: Configure Values for each active Attribute */}
          {attributes.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <Label className="text-xs font-black uppercase text-slate-800 tracking-wider block">
                Step 2: Configure Values For Each Selected Attribute:
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributes.map((attr) => {
                  const isColor = attr.id === "color";
                  return (
                    <div
                      key={attr.id}
                      className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{attr.label}</span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            ({attr.values.length} values)
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAttribute(attr as any)}
                          className="text-[11px] text-rose-500 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Values Pills Strip */}
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {attr.values.map((val, vIdx) => (
                          <span
                            key={vIdx}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs"
                          >
                            {val.code && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: val.code }}
                              />
                            )}
                            <span>{val.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttributeValue(attr.id, vIdx)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add Value Input */}
                      <div className="flex gap-2 pt-1">
                        {isColor && (
                          <input
                            type="color"
                            value={newColorCode}
                            onChange={(e) => setNewColorCode(e.target.value)}
                            className="w-9 h-9 p-0.5 border border-slate-300 rounded-xl cursor-pointer bg-white"
                            title="কালার কোড বাছুন"
                          />
                        )}
                        <Input
                          placeholder={
                            isColor
                              ? "যেমন: Royal Blue"
                              : attr.id === "size"
                              ? "যেমন: M বা 38"
                              : attr.id === "weight"
                              ? "যেমন: 500g"
                              : "নতুন ভ্যালু লিখুন..."
                          }
                          value={newValInputs[attr.id] || ""}
                          onChange={(e) =>
                            setNewValInputs({ ...newValInputs, [attr.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addAttributeValue(
                                attr.id,
                                newValInputs[attr.id] || "",
                                isColor ? newColorCode : undefined
                              );
                            }
                          }}
                          className="h-9 text-xs rounded-xl bg-white flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            addAttributeValue(
                              attr.id,
                              newValInputs[attr.id] || "",
                              isColor ? newColorCode : undefined
                            )
                          }
                          className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Generate Combinations CTA */}
          {attributes.length > 0 && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <h4 className="text-xs font-black text-emerald-950">
                  Step 3: Generate Combinations Matrix
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  {attributes.map((a) => `${a.name} (${a.values.length})`).join(" × ")} ={" "}
                  <strong>{totalCombinationsCount} Combinations</strong>
                </p>
              </div>

              <Button
                type="button"
                onClick={generateCartesianCombinations}
                disabled={totalCombinationsCount === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate {totalCombinationsCount} Combinations</span>
              </Button>
            </div>
          )}

          {/* STEP 4: Variant Matrix Table */}
          {variants.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Step 4: Generated Variant Combinations ({variants.length} Rows)
                </Label>

                {/* Bulk Actions */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="Bulk Price (৳)"
                      type="number"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(e.target.value)}
                      className="h-8 w-24 text-xs rounded-lg bg-slate-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyBulkPrice}
                      className="h-8 px-2 text-[11px] font-bold rounded-lg"
                    >
                      Set All
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="Bulk Stock"
                      type="number"
                      value={bulkStock}
                      onChange={(e) => setBulkStock(e.target.value)}
                      className="h-8 w-20 text-xs rounded-lg bg-slate-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyBulkStock}
                      className="h-8 px-2 text-[11px] font-bold rounded-lg"
                    >
                      Set All
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Matrix Table */}
              <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Combination</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Price (৳)</th>
                      <th className="py-2.5 px-3">Discount (৳)</th>
                      <th className="py-2.5 px-3">Stock Qty</th>
                      <th className="py-2.5 px-3">Variant Image URL</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        {/* Combination Badges */}
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {v.colorCode && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                                style={{ backgroundColor: v.colorCode }}
                              />
                            )}
                            <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-lg text-[11px] font-extrabold">
                              {v.name}
                            </span>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-2.5 px-3">
                          <Input
                            value={v.sku}
                            onChange={(e) => updateVariantRow(idx, "sku", e.target.value)}
                            className="h-8 text-xs font-semibold rounded-lg bg-slate-50 w-28 uppercase"
                          />
                        </td>

                        {/* Price */}
                        <td className="py-2.5 px-3">
                          <Input
                            type="number"
                            placeholder={String(basePrice || "Price")}
                            value={v.price}
                            onChange={(e) => updateVariantRow(idx, "price", e.target.value)}
                            className="h-8 text-xs font-bold rounded-lg bg-slate-50 w-24 text-emerald-700"
                          />
                        </td>

                        {/* Discount Price */}
                        <td className="py-2.5 px-3">
                          <Input
                            type="number"
                            placeholder="Optional"
                            value={v.discountPrice}
                            onChange={(e) => updateVariantRow(idx, "discountPrice", e.target.value)}
                            className="h-8 text-xs rounded-lg bg-slate-50 w-24"
                          />
                        </td>

                        {/* Stock Qty */}
                        <td className="py-2.5 px-3">
                          <Input
                            type="number"
                            value={v.stockQty}
                            onChange={(e) =>
                              updateVariantRow(idx, "stockQty", Number(e.target.value))
                            }
                            className="h-8 text-xs font-bold rounded-lg bg-slate-50 w-20"
                          />
                        </td>

                        {/* Variant Image URL */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {v.imageUrl && (
                              <img
                                src={v.imageUrl}
                                alt="thumb"
                                className="w-7 h-7 rounded-lg object-cover border"
                              />
                            )}
                            <Input
                              placeholder="https://..."
                              value={v.imageUrl || ""}
                              onChange={(e) => updateVariantRow(idx, "imageUrl", e.target.value)}
                              className="h-8 text-[11px] rounded-lg bg-slate-50 w-36"
                            />
                          </div>
                        </td>

                        {/* Action (Delete) */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
