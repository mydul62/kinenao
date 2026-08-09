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
  Eye,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Star,
  Globe,
  DollarSign,
  AlertCircle,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/RichTextEditor";
import ProductVideoPlayer, { extractYouTubeId } from "@/components/ProductVideoPlayer";
import ProductVariantManager from "@/components/admin/ProductVariantManager";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [directImageUrl, setDirectImageUrl] = useState("");

  // Media
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPosterUrl, setVideoPosterUrl] = useState("");

  // Multi-Attribute Variants State
  const [variantData, setVariantData] = useState<{
    enableVariants: boolean;
    attributes: any[];
    variants: any[];
  }>({
    enableVariants: false,
    attributes: [],
    variants: [],
  });

  // Promotional Badges
  const [promotionalBadges, setPromotionalBadges] = useState<string[]>([]);
  const [newBadgeInput, setNewBadgeInput] = useState("");

  // Form State
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    barcode: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    brandId: "",
    price: "",
    discountPrice: "",
    weight: "",
    unit: "Piece",
    stockQty: "25",
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

  // Helper to generate slug from name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    // Fetch active categories and brands from database
    Promise.all([api.get("/categories?includeInactive=true"), api.get("/brands")])
      .then(([catRes, brandRes]) => {
        const catList = catRes.data?.data?.categories || [];
        setCategories(catList);
        setBrands(brandRes.data?.data?.brands || []);
      })
      .catch((err) => {
        console.error("Error fetching categories/brands:", err);
        toast.error("Failed to load categories from database");
      });
  }, []);

  // Calculate discount percentage
  const regularPriceNum = parseFloat(form.price) || 0;
  const discountPriceNum = parseFloat(form.discountPrice) || 0;
  const discountPercent =
    regularPriceNum > 0 && discountPriceNum > 0 && discountPriceNum < regularPriceNum
      ? Math.round(((regularPriceNum - discountPriceNum) / regularPriceNum) * 100)
      : 0;

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
        const url = data.data.url;
        setUploadedImages((prev) => [...prev, url]);
        if (!thumbnail) setThumbnail(url);
      }
      toast.success("Images uploaded successfully");
    } catch {
      toast.error("Failed to upload image. You can also paste direct Image URLs.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddDirectImage = () => {
    if (!directImageUrl.trim()) return;
    setUploadedImages((prev) => [...prev, directImageUrl.trim()]);
    if (!thumbnail) setThumbnail(directImageUrl.trim());
    setDirectImageUrl("");
    toast.success("Image URL added to gallery");
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    if (
      (direction === "left" && index === 0) ||
      (direction === "right" && index === uploadedImages.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const updated = [...uploadedImages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setUploadedImages(updated);
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
      toast.error("Failed to upload video file. Please use a YouTube link or direct video URL.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    // Basic validation
    if (!form.name.trim()) {
      toast.error("Product title is required");
      return;
    }
    if (!form.categoryId) {
      toast.error("Please select a product category");
      return;
    }
    if (!form.price || parseFloat(form.price) < 0) {
      toast.error("Valid regular price is required");
      return;
    }
    if (form.discountPrice && parseFloat(form.discountPrice) >= parseFloat(form.price)) {
      toast.error("Discount price must be less than regular price");
      return;
    }
    if (uploadedImages.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        sku: form.sku.trim() || `PROD-${Date.now().toString().slice(-6)}`,
        barcode: form.barcode.trim() || null,
        description: form.description.trim() || form.name,
        categoryId: form.categoryId,
        brandId: form.brandId || null,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        unit: form.unit || "Piece",
        stockQty: parseInt(form.stockQty || "0", 10),
        tags: form.tags.trim() || null,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isFlashSale: form.isFlashSale,
        isActive: publish,
        customBadge: form.customBadge.trim() || null,
        promotionalBadges,
        seoTitle: form.seoTitle.trim() || form.name,
        seoDescription: form.seoDescription.trim() || form.shortDescription || null,
        images: uploadedImages,
        thumbnail: thumbnail || uploadedImages[0] || "",
        videoUrl: videoUrl.trim() || null,
        videoPosterUrl: videoPosterUrl.trim() || null,
        attributes: variantData.enableVariants ? variantData.attributes : null,
        variants: variantData.enableVariants ? variantData.variants : [],
      };

      await api.post("/products", payload);
      toast.success(
        publish ? "Product published successfully to catalog!" : "Product saved as draft."
      );
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Create product error:", err);
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const isYouTube = Boolean(extractYouTubeId(videoUrl));

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Add New Product</h1>
            <p className="text-xs text-slate-500">
              Create product with images, YouTube video showcase, rich description, and variants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => handleSave(false)}
            className="rounded-xl font-bold text-xs h-10 px-4 border-slate-300 hover:bg-slate-50"
          >
            Save Draft
          </Button>

          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs h-10 px-5 shadow-sm"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Check className="w-4 h-4 mr-1.5" />
            )}
            Publish Product
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* SECTION A: Basic Product Information */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
              Section A: Basic Product Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-slate-800">
                Product Title / Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. ঢাকাই জামদানি শাড়ি / পিওর কটন থ্রি-পিস / ব্লুটুথ ইয়ারবাড"
                value={form.name}
                onChange={(e) => {
                  const val = e.target.value;
                  set("name", val);
                  if (!form.sku) {
                    const generated = "KNE-" + Math.floor(1000 + Math.random() * 9000);
                    set("sku", generated);
                  }
                  if (!form.slug) {
                    set("slug", generateSlug(val));
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
                <option value="">Select Category (From Real Database)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.slug})
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
                <option value="">No Brand / Generic</option>
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
              <Label className="text-xs font-bold text-slate-800">Product Tags / Keywords</Label>
              <Input
                placeholder="e.g. saree, bridal, gift, trend, organic (comma separated)"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                className="rounded-xl text-xs h-11"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-slate-800">Short Summary / Highlights</Label>
              <Input
                placeholder="e.g. ১০০% খাঁটি উপাদান, প্রিমিয়াম কোয়ালিটি এবং সারা দেশে ক্যাশ অন হোম ডেলিভারি।"
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                className="rounded-xl text-xs h-11"
              />
            </div>
          </div>

          {/* Badges & Toggles */}
          <div className="pt-2 flex flex-wrap items-center gap-6 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(c) => set("isFeatured", c)}
              />
              <span className="text-xs font-bold text-slate-800">Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={form.isBestSeller}
                onCheckedChange={(c) => set("isBestSeller", c)}
              />
              <span className="text-xs font-bold text-slate-800">Best Seller Badge</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={form.isFlashSale}
                onCheckedChange={(c) => set("isFlashSale", c)}
              />
              <span className="text-xs font-bold text-slate-800">Flash Sale Badge</span>
            </label>
          </div>
        </div>

        {/* SECTION B: Product Image Upload */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                Section B: Product Image Gallery
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-bold">
              {uploadedImages.length} Image(s) Added
            </span>
          </div>

          {/* Upload and URL input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 font-bold text-xs cursor-pointer transition-all">
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Upload Images From Device</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <div className="flex gap-2">
              <Input
                placeholder="Or paste direct image URL (https://...)"
                value={directImageUrl}
                onChange={(e) => setDirectImageUrl(e.target.value)}
                className="rounded-2xl text-xs h-12"
              />
              <Button
                type="button"
                onClick={handleAddDirectImage}
                className="rounded-2xl h-12 px-4 bg-slate-900 hover:bg-slate-800 font-bold text-xs shrink-0"
              >
                Add URL
              </Button>
            </div>
          </div>

          {/* Image Previews with Primary Selector and Reordering */}
          {uploadedImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
              {uploadedImages.map((img, idx) => {
                const isPrimary = thumbnail === img || (idx === 0 && !thumbnail);
                return (
                  <div
                    key={idx}
                    className={`relative rounded-2xl border-2 overflow-hidden bg-slate-100 aspect-square flex flex-col justify-between p-1.5 transition-all ${
                      isPrimary ? "border-emerald-600 ring-2 ring-emerald-600/30" : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Product preview ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Top controls */}
                    <div className="relative z-10 flex items-center justify-between">
                      {isPrimary && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                          PRIMARY
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = uploadedImages.filter((_, i) => i !== idx);
                          setUploadedImages(updated);
                          if (thumbnail === img) setThumbnail(updated[0] || "");
                        }}
                        className="ml-auto w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom controls */}
                    <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-xs p-1 rounded-xl text-white">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, "left")}
                        className="p-1 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move left"
                      >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                      </button>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => setThumbnail(img)}
                          className="text-[9px] font-bold text-slate-200 hover:text-white px-1 cursor-pointer"
                        >
                          Set Primary
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={idx === uploadedImages.length - 1}
                        onClick={() => moveImage(idx, "right")}
                        className="p-1 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              No images added yet. Please upload or paste at least 1 product image.
            </div>
          )}
        </div>

        {/* SECTION C: Product Video */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                Section C: Product Video Showcase (YouTube & MP4)
              </h2>
            </div>
            {videoUrl && (
              <button
                type="button"
                onClick={() => setVideoUrl("")}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Remove Video
              </button>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-800">
              YouTube Video URL or Direct MP4 Link
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="e.g. https://www.youtube.com/watch?v=XXXXXXXX OR https://youtu.be/XXXXXXXX"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="rounded-xl text-xs h-11 flex-1 font-mono"
              />
              <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors shrink-0">
                {uploadingVideo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Upload MP4</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Video Live Preview inside Admin */}
            {videoUrl && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Video Preview (Customer View):</span>
                  </p>
                  {isYouTube && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                      YouTube Detected
                    </span>
                  )}
                </div>
                <div className="max-w-md mx-auto">
                  <ProductVideoPlayer videoUrl={videoUrl} posterUrl={videoPosterUrl || thumbnail} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION D: Rich Text Product Description */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
              Section D: Full Product Description (Rich Text Editor)
            </h2>
          </div>

          <div className="space-y-2">
            <RichTextEditor
              value={form.description}
              onChange={(html) => set("description", html)}
              placeholder="Write full product specifications, fabric details, size chart, care instructions, and warranty terms..."
            />
          </div>
        </div>

        {/* SECTION E: Price & Inventory */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
              Section E: Pricing & Inventory
            </h2>
          </div>

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
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800">Discount Price (৳)</Label>
                {discountPercent > 0 && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="1999"
                value={form.discountPrice}
                onChange={(e) => set("discountPrice", e.target.value)}
                className="rounded-xl text-xs h-11 font-bold text-emerald-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">
                Stock Quantity <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                required
                value={form.stockQty}
                onChange={(e) => set("stockQty", e.target.value)}
                className="rounded-xl text-xs h-11 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Unit Type</Label>
              <Input
                placeholder="Piece, KG, Litre, Set"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className="rounded-xl text-xs h-11"
              />
            </div>
          </div>
        </div>

        {/* SECTION F: Product Variants & Attributes Manager */}
        <ProductVariantManager
          baseSku={form.sku || "PROD"}
          basePrice={form.price ? parseFloat(form.price) : ""}
          baseDiscountPrice={form.discountPrice ? parseFloat(form.discountPrice) : ""}
          onChange={setVariantData}
        />

        {/* SECTION G: SEO & URL Configuration */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
              Section G: SEO & URL Slug
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-slate-800">Custom URL Slug</Label>
              <Input
                placeholder="product-url-slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="rounded-xl text-xs h-11 font-mono text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">SEO Meta Title</Label>
              <Input
                placeholder="Meta title for Google Search"
                value={form.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                className="rounded-xl text-xs h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">SEO Meta Description</Label>
              <Input
                placeholder="Short meta description for search engines"
                value={form.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                className="rounded-xl text-xs h-11"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => handleSave(false)}
            className="rounded-xl font-bold text-xs h-11 px-5 border-slate-300 hover:bg-slate-50"
          >
            Save Draft
          </Button>

          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs h-11 px-7 shadow-md"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Check className="w-4 h-4 mr-1.5" />
            )}
            Publish Product
          </Button>
        </div>
      </div>
    </div>
  );
}
