"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Loader2, Plus, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/RichTextEditor";

const PRESET_BADGES = [
  "🔥 Hot Deal",
  "⚡ Flash Sale",
  "🎁 Buy 1 Get 1",
  "⭐ Trending",
  "🏷️ Save 65%",
  "✨ Exclusive",
  "🎀 Special Offer",
  "📦 Limited Stock",
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState("");

  // Dynamic Promotional Badges State
  const [promotionalBadges, setPromotionalBadges] = useState<string[]>([]);
  const [customBadgeText, setCustomBadgeText] = useState("");
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
    unit: "",
    stockQty: "0",
    tags: "",
    isFeatured: false,
    isBestSeller: false,
    isFlashSale: false,
    isActive: true,
    seoTitle: "",
    seoDescription: "",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, brandRes, productRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands"),
          api.get(`/products/${id}`),
        ]);

        setCategories(catRes.data.data.categories || []);
        setBrands(brandRes.data.data.brands || []);

        const product = productRes.data.data.product;
        if (product) {
          setForm({
            name: product.name || "",
            sku: product.sku || "",
            barcode: product.barcode || "",
            description: product.description || "",
            categoryId: product.categoryId || "",
            brandId: product.brandId || "",
            price: product.price !== undefined && product.price !== null ? String(product.price) : "",
            discountPrice: product.discountPrice !== undefined && product.discountPrice !== null ? String(product.discountPrice) : "",
            weight: product.weight !== undefined && product.weight !== null ? String(product.weight) : "",
            unit: product.unit || "",
            stockQty: product.stockQty !== undefined && product.stockQty !== null ? String(product.stockQty) : "0",
            tags: product.tags || "",
            isFeatured: Boolean(product.isFeatured),
            isBestSeller: Boolean(product.isBestSeller),
            isFlashSale: Boolean(product.isFlashSale),
            isActive: product.isActive !== undefined ? Boolean(product.isActive) : true,
            seoTitle: product.seoTitle || "",
            seoDescription: product.seoDescription || "",
          });

          setUploadedImages(product.images || []);
          setThumbnail(product.thumbnail || (product.images && product.images[0]) || "");
          setCustomBadgeText(product.customBadge || "");
          setPromotionalBadges(product.promotionalBadges || []);
        }
      } catch (err: any) {
        toast.error("Failed to load product details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddBadge = (badge: string) => {
    const trimmed = badge.trim();
    if (!trimmed) return;
    if (promotionalBadges.includes(trimmed)) {
      toast.info("Badge already added");
      return;
    }
    setPromotionalBadges((prev) => [...prev, trimmed]);
    setNewBadgeInput("");
    toast.success(`Badge "${trimmed}" added!`);
  };

  const handleRemoveBadge = (badgeToRemove: string) => {
    setPromotionalBadges((prev) => prev.filter((b) => b !== badgeToRemove));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
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
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.categoryId || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        description: form.description || form.name,
        categoryId: form.categoryId,
        brandId: form.brandId || undefined,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice && !isNaN(parseFloat(form.discountPrice)) ? parseFloat(form.discountPrice) : undefined,
        weight: form.weight && !isNaN(parseFloat(form.weight)) ? parseFloat(form.weight) : undefined,
        stockQty: parseInt(form.stockQty) || 0,
        barcode: form.barcode || undefined,
        unit: form.unit || undefined,
        tags: form.tags || undefined,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isFlashSale: form.isFlashSale,
        isActive: form.isActive,
        customBadge: customBadgeText || undefined,
        promotionalBadges: promotionalBadges,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        images: uploadedImages,
        thumbnail: thumbnail || (uploadedImages.length > 0 ? uploadedImages[0] : undefined),
      };
      await api.patch(`/products/${id}`, payload);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-slate-600 hover:text-[#6C5CE7] transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
            Edit Product
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Update catalog specs, gallery photos, pricing, and dynamic promotional badges.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 text-base border-b border-[#E5E7EB] pb-3">
                General Product Details
              </h2>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Product Title *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-semibold rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-bold uppercase">SKU *</Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-mono rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-bold uppercase">Barcode</Label>
                  <Input
                    value={form.barcode}
                    onChange={(e) => set("barcode", e.target.value)}
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-bold uppercase">Tags</Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Description *</Label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => set("description", html)}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 text-base border-b border-[#E5E7EB] pb-3">
                Pricing & Stock Control
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-bold uppercase">Price (৳) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-bold rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-bold uppercase">Sale Price (৳)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.discountPrice}
                    onChange={(e) => set("discountPrice", e.target.value)}
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-bold uppercase">Stock Qty *</Label>
                  <Input
                    type="number"
                    value={form.stockQty}
                    onChange={(e) => set("stockQty", e.target.value)}
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-bold uppercase">Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => set("weight", e.target.value)}
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Classification */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 text-base border-b border-[#E5E7EB] pb-3">
                Classification
              </h2>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Category *</Label>
                <select
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] text-slate-900 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold focus:outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold uppercase">Brand</Label>
                <select
                  value={form.brandId}
                  onChange={(e) => set("brandId", e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] text-slate-900 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold focus:outline-none"
                >
                  <option value="">No Brand</option>
                  {brands.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DYNAMIC PROMOTIONAL BADGES CARD */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#6C5CE7]" /> Dynamic Promotional Badges
                </h2>
              </div>

              {/* Standard Status Switches */}
              <div className="space-y-2.5">
                {[
                  { key: "isActive", label: "Active (Store Visible)" },
                  { key: "isFeatured", label: "Featured Product" },
                  { key: "isBestSeller", label: "Best Seller Badge" },
                  { key: "isFlashSale", label: "Flash Sale Campaign" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <span className="text-slate-800 text-xs font-semibold">{label}</span>
                    <Switch
                      checked={form[key as keyof typeof form] as boolean}
                      onCheckedChange={(v) => set(key, v)}
                    />
                  </div>
                ))}
              </div>

              {/* Custom Primary Badge Pill Input */}
              <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB]">
                <Label className="text-slate-700 text-xs font-bold uppercase flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-[#009669]" /> Primary Badge Text (Card Ribbon)
                </Label>
                <Input
                  value={customBadgeText}
                  onChange={(e) => setCustomBadgeText(e.target.value)}
                  placeholder="e.g. Save 65% / Hot Deal"
                  className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 text-xs font-bold rounded-xl"
                />
              </div>

              {/* Dynamic Badge Creator */}
              <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                <Label className="text-slate-700 text-xs font-bold uppercase">
                  Add Dynamic Custom Badges
                </Label>

                <div className="flex gap-2">
                  <Input
                    value={newBadgeInput}
                    onChange={(e) => setNewBadgeInput(e.target.value)}
                    placeholder="Type custom badge..."
                    className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 text-xs rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBadge(newBadgeInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddBadge(newBadgeInput)}
                    className="bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white text-xs px-3 rounded-xl cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preset Clickable Badges */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BADGES.map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => handleAddBadge(badge)}
                        className="text-[11px] font-semibold bg-slate-100 hover:bg-[#6C5CE7]/10 hover:text-[#6C5CE7] text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {badge}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Applied Badges */}
                {promotionalBadges.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">
                      Applied Badges ({promotionalBadges.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {promotionalBadges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 text-xs font-extrabold bg-[#6C5CE7] text-white px-2.5 py-1 rounded-xl shadow-sm"
                        >
                          {badge}
                          <button
                            type="button"
                            onClick={() => handleRemoveBadge(badge)}
                            className="hover:text-rose-200 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Upload */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 text-base border-b border-[#E5E7EB] pb-3">
                Product Gallery
              </h2>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E5E7EB] bg-[#F8FAFC] rounded-2xl p-6 cursor-pointer hover:border-[#6C5CE7] transition-colors">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[#6C5CE7] mb-2" />
                ) : (
                  <Upload className="h-6 w-6 text-slate-400 mb-2" />
                )}
                <span className="text-slate-600 text-xs font-semibold text-center">
                  {uploading ? "Uploading..." : "Upload Product Photos"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {url === thumbnail && (
                        <span className="absolute top-1 left-1 bg-[#6C5CE7] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          MAIN
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setThumbnail(url)}
                          className="bg-[#6C5CE7] text-white text-[9px] font-bold rounded px-1.5 py-1"
                        >
                          Main
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadedImages((prev) => prev.filter((u) => u !== url))}
                          className="bg-rose-500 text-white p-1 rounded-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm">
              <Button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white font-extrabold py-3.5 rounded-xl cursor-pointer shadow-lg shadow-[#6C5CE7]/20 uppercase tracking-wider"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
