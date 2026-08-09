"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Plus,
  Sparkles,
  Tag,
  Film,
  Layers,
  Check,
  Trash2,
  Image as ImageIcon,
  Palette,
  Scale,
  Shirt,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/RichTextEditor";
import ProductVideoPlayer from "@/components/ProductVideoPlayer";

interface VariantFormItem {
  id?: string;
  name: string;
  colorName: string;
  colorCode: string;
  size: string;
  imageUrl: string;
  sku: string;
  price: string;
  discountPrice: string;
  stockQty: string;
  isActive: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Media
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPosterUrl, setVideoPosterUrl] = useState("");

  // Universal Multi-Attribute Variants
  const [enableVariants, setEnableVariants] = useState(false);
  const [variantTypePreset, setVariantTypePreset] = useState<"clothing" | "grocery" | "beauty" | "custom">("clothing");
  const [variants, setVariants] = useState<VariantFormItem[]>([]);

  // Promotional Badges
  const [promotionalBadges, setPromotionalBadges] = useState<string[]>([]);
  const [newBadgeInput, setNewBadgeInput] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    categoryId: "",
    brandId: "",
    price: "",
    discountPrice: "",
    weight: "",
    unit: "Piece",
    stockQty: "20",
    tags: "",
    isFeatured: false,
    isBestSeller: false,
    isFlashSale: false,
    isActive: true,
    customBadge: "",
    seoTitle: "",
    seoDescription: "",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([api.get("/categories?includeInactive=true"), api.get("/brands")])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data?.data?.categories || []);
        setBrands(brandRes.data?.data?.brands || []);
      })
      .catch(console.error);
  }, []);

  const handleAddBadge = (badge: string) => {
    const trimmed = badge.trim();
    if (!trimmed) return;
    if (promotionalBadges.includes(trimmed)) {
      toast.info("Badge already added");
      return;
    }
    setPromotionalBadges((prev) => [...prev, trimmed]);
    setNewBadgeInput("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/upload/image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setUploadedImages((prev) => [...prev, data.data.url]);
        if (!thumbnail) setThumbnail(data.data.url);
      }
      toast.success("Images uploaded successfully");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/video", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVideoUrl(data.data.url);
      if (data.data.posterUrl) setVideoPosterUrl(data.data.posterUrl);
      toast.success("Product video uploaded successfully");
    } catch {
      toast.error("Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Variant Helpers
  const handleAddVariant = (customDefaults?: Partial<VariantFormItem>) => {
    const newIdx = variants.length + 1;
    const baseSku = form.sku ? `${form.sku}-V${newIdx}` : `VAR-${Date.now()}-${newIdx}`;
    setVariants((prev) => [
      ...prev,
      {
        name: customDefaults?.name || `Variant ${newIdx}`,
        colorName: customDefaults?.colorName || "",
        colorCode: customDefaults?.colorCode || "",
        size: customDefaults?.size || "",
        imageUrl: customDefaults?.imageUrl || thumbnail || "",
        sku: customDefaults?.sku || baseSku,
        price: customDefaults?.price || form.price || "",
        discountPrice: customDefaults?.discountPrice || form.discountPrice || "",
        stockQty: customDefaults?.stockQty || "15",
        isActive: true,
      },
    ]);
  };

  // Quick Preset Generators for multiple categories
  const applyPresetVariants = (preset: "sizes" | "weights" | "volumes" | "colors" | "saree") => {
    if (preset === "sizes") {
      const sizes = ["S (Small)", "M (Medium)", "L (Large)", "XL (Extra Large)", "XXL"];
      sizes.forEach((s) => handleAddVariant({ name: s, size: s.split(" ")[0] }));
      toast.success("Added Fashion Size variants (S, M, L, XL, XXL)");
    } else if (preset === "weights") {
      const weights = ["250 Gram", "500 Gram", "1 Kg", "2 Kg", "5 Kg"];
      weights.forEach((w) => handleAddVariant({ name: w, size: w }));
      toast.success("Added Grocery Weight variants (250g, 500g, 1kg, 2kg, 5kg)");
    } else if (preset === "volumes") {
      const volumes = ["500 ml Bottle", "1 Litre Bottle", "2 Litre Jar", "5 Litre Can"];
      volumes.forEach((v) => handleAddVariant({ name: v, size: v.split(" ")[0] }));
      toast.success("Added Liquid Volume variants (500ml, 1L, 2L, 5L)");
    } else if (preset === "colors") {
      const colors = [
        { name: "Crimson Red", code: "#DC2626" },
        { name: "Royal Blue", code: "#2563EB" },
        { name: "Emerald Green", code: "#059669" },
        { name: "Deep Maroon", code: "#831843" },
        { name: "Classic Black", code: "#111827" },
      ];
      colors.forEach((c) =>
        handleAddVariant({ name: c.name, colorName: c.name, colorCode: c.code })
      );
      toast.success("Added 5 Color Swatch variants");
    } else if (preset === "saree") {
      const sareeOptions = [
        { name: "12 হাত শাড়ি (With Blouse Piece)", size: "12 Hat" },
        { name: "Semi-Stitched Suit", size: "Semi-Stitched" },
        { name: "Unstitched Fabric", size: "Unstitched" },
      ];
      sareeOptions.forEach((s) => handleAddVariant({ name: s.name, size: s.size }));
      toast.success("Added Saree & Three Piece options");
    }
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, key: keyof VariantFormItem, val: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Please fill in required fields: Name, Price, and Category");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        stockQty: parseInt(form.stockQty || "0"),
        weight: form.weight ? parseFloat(form.weight) : null,
        images: uploadedImages,
        thumbnail: thumbnail || uploadedImages[0] || "",
        videoUrl: videoUrl || null,
        videoPosterUrl: videoPosterUrl || null,
        promotionalBadges,
        variants: enableVariants
          ? variants.map((v, i) => ({
              name: v.name,
              colorName: v.colorName || null,
              colorCode: v.colorCode || null,
              size: v.size || null,
              imageUrl: v.imageUrl || null,
              sku: v.sku || `${form.sku || "PROD"}-V${i + 1}`,
              price: v.price ? parseFloat(v.price) : null,
              discountPrice: v.discountPrice ? parseFloat(v.discountPrice) : null,
              stockQty: parseInt(v.stockQty || "0"),
              isActive: v.isActive,
            }))
          : [],
      };

      await api.post("/products", payload);
      toast.success("Product created successfully with all variants & media!");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Add New Product</h1>
            <p className="text-xs text-slate-500">
              Create product with multi-category variants, video showcase, and stock inventory.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 shadow-md"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
          Publish Product
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CARD 1: Basic Information */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-slate-800">
                Product Title / Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Premium Handloom Cotton Saree / Pure Mustard Oil 1L"
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!form.sku) {
                    const generated = e.target.value.slice(0, 3).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
                    set("sku", generated);
                  }
                }}
                className="rounded-xl text-xs h-11 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Category <span className="text-rose-500">*</span>
              </Label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? `└── ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Brand (Optional)</Label>
              <select
                value={form.brandId}
                onChange={(e) => set("brandId", e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">No Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="PROD-001"
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className="rounded-xl text-xs h-11 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Barcode (Optional)</Label>
              <Input
                placeholder="Barcode number"
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value)}
                className="rounded-xl text-xs h-11"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Pricing & Stock */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider">Pricing & Stock</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Regular Price (৳) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                required
                min="0"
                step="any"
                placeholder="2500"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="rounded-xl text-xs h-11 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Discount Price (৳)</Label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="1950"
                value={form.discountPrice}
                onChange={(e) => set("discountPrice", e.target.value)}
                className="rounded-xl text-xs h-11 font-bold text-emerald-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Base Stock Qty</Label>
              <Input
                type="number"
                min="0"
                value={form.stockQty}
                onChange={(e) => set("stockQty", e.target.value)}
                className="rounded-xl text-xs h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Unit</Label>
              <Input
                placeholder="Piece, KG, Litre, Box"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className="rounded-xl text-xs h-11"
              />
            </div>
          </div>
        </div>

        {/* CARD 3: Media (Images & Product Video) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Film className="w-4 h-4 text-emerald-600" />
            <span>Product Media & Video Showcase</span>
          </h2>

          {/* Product Video Upload */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Product Video Upload</p>
                <p className="text-[11px] text-slate-500">
                  Upload MP4/WebM video to showcase your product prominently on the storefront.
                </p>
              </div>
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove Video
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors">
                {uploadingVideo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Film className="w-4 h-4" />
                )}
                <span>{videoUrl ? "Replace Video" : "Upload Video File"}</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 w-full">
                <Input
                  placeholder="Or paste Direct Video URL (Cloudinary / CDN MP4)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="rounded-xl text-xs h-10 bg-white"
                />
              </div>
            </div>

            {/* Video Preview */}
            {videoUrl && (
              <div className="pt-2 max-w-md">
                <p className="text-[11px] font-bold text-slate-600 mb-1.5">Video Player Preview:</p>
                <ProductVideoPlayer videoUrl={videoUrl} />
              </div>
            )}
          </div>

          {/* Images Upload */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-800">Product Images</Label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-600 cursor-pointer transition-colors shrink-0">
                {uploadingImage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span className="text-[10px] font-bold mt-1">Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {uploadedImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative w-24 h-24 rounded-2xl border overflow-hidden shrink-0 group ${
                    thumbnail === img ? "ring-2 ring-emerald-600" : "border-slate-200"
                  }`}
                >
                  <img src={img} alt="Product image preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
                      if (thumbnail === img) setThumbnail(uploadedImages[0] || "");
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnail(img)}
                    className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {thumbnail === img ? "Thumbnail" : "Set Cover"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 4: Universal Multi-Attribute Product Variants Management */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <div>
                <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                  Product Variants & Multiple Attributes
                </h2>
                <p className="text-[11px] text-slate-500">
                  Manage multiple variant types: Colors, Sizes (S/M/L/XL), Weights (500g/1kg), Volumes (1L/2L), or Custom options with dedicated stock & prices.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={enableVariants}
                onCheckedChange={(c) => {
                  setEnableVariants(c);
                  if (c && variants.length === 0) handleAddVariant();
                }}
              />
              <span className="text-xs font-bold text-slate-800">Enable Variants</span>
            </div>
          </div>

          {enableVariants && (
            <div className="space-y-5 pt-2">
              {/* Quick Preset Generator Buttons */}
              <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-2">
                <p className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>1-Click Preset Generator for Multiple Categories:</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyPresetVariants("sizes")}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Shirt className="w-3.5 h-3.5" /> + Fashion Sizes (S, M, L, XL, XXL)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetVariants("weights")}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" /> + Weights (250g, 500g, 1kg, 2kg, 5kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetVariants("volumes")}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5" /> + Liquid Volumes (500ml, 1L, 2L, 5L)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetVariants("colors")}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5" /> + Color Swatches (Red, Blue, Green, Maroon, Black)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetVariants("saree")}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" /> + Saree & Three Piece Options (12 হাত / Unstitched)
                  </button>
                </div>
              </div>

              {/* Variants Rows List */}
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{v.name || `Variant #${idx + 1}`}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {/* Variant Name */}
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-[11px] font-bold text-slate-700">
                          Variant Name / Option Title
                        </Label>
                        <Input
                          placeholder="e.g. 1 Litre Jar / Crimson Red - XL"
                          value={v.name}
                          onChange={(e) => updateVariant(idx, "name", e.target.value)}
                          className="h-9 text-xs rounded-xl bg-white font-semibold"
                        />
                      </div>

                      {/* Size / Weight / Volume Tag */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">
                          Size / Weight / Vol
                        </Label>
                        <Input
                          placeholder="e.g. XL, 1L, 500g"
                          value={v.size}
                          onChange={(e) => updateVariant(idx, "size", e.target.value)}
                          className="h-9 text-xs rounded-xl bg-white font-bold"
                        />
                      </div>

                      {/* Color Picker (Optional) */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Color Dot (Hex)</Label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={v.colorCode || "#DC2626"}
                            onChange={(e) => updateVariant(idx, "colorCode", e.target.value)}
                            className="w-8 h-8 rounded-lg border cursor-pointer p-0.5 shrink-0"
                          />
                          <Input
                            placeholder="#HEX"
                            value={v.colorCode || ""}
                            onChange={(e) => updateVariant(idx, "colorCode", e.target.value)}
                            className="h-9 text-[11px] rounded-xl bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Stock Quantity */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Stock Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          value={v.stockQty}
                          onChange={(e) => updateVariant(idx, "stockQty", e.target.value)}
                          className="h-9 text-xs rounded-xl bg-white font-bold"
                        />
                      </div>

                      {/* Variant Price (৳) */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Price (৳)</Label>
                        <Input
                          type="number"
                          placeholder={form.price || "Price"}
                          value={v.price}
                          onChange={(e) => updateVariant(idx, "price", e.target.value)}
                          className="h-9 text-xs rounded-xl bg-white font-bold text-emerald-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => handleAddVariant()}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold border-purple-300 text-purple-800 hover:bg-purple-50"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Variant Option
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD 5: Promotional Badges */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Promotional Badges & Flags</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <Switch checked={form.isFeatured} onCheckedChange={(c) => set("isFeatured", c)} />
              <span>Featured Product</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <Switch checked={form.isBestSeller} onCheckedChange={(c) => set("isBestSeller", c)} />
              <span>Best Seller</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <Switch checked={form.isFlashSale} onCheckedChange={(c) => set("isFlashSale", c)} />
              <span>Flash Sale Deal</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <Switch checked={form.isActive} onCheckedChange={(c) => set("isActive", c)} />
              <span>Published (Active)</span>
            </label>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label className="text-xs font-bold text-slate-800">Custom Badge Text (e.g. 🔥 Hot Deal, 100% Pure)</Label>
            <Input
              placeholder="e.g. ⭐ Best Value, 100% Organic"
              value={form.customBadge}
              onChange={(e) => set("customBadge", e.target.value)}
              className="rounded-xl text-xs h-11"
            />
          </div>
        </div>

        {/* CARD 6: Rich Text Description */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3">
          <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider">
            Rich Text Description & Product Details
          </h2>
          <RichTextEditor
            content={form.description}
            onChange={(html) => set("description", html)}
          />
        </div>

        {/* Submit Bottom Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-8 shadow-md"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
            Publish Product
          </Button>
        </div>
      </form>
    </div>
  );
}
