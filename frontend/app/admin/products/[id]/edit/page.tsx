"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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
        }
      } catch (err: any) {
        toast.error("Failed to load product data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
        const url = data.data.url;
        setUploadedImages((prev) => [...prev, url]);
        if (!thumbnail) setThumbnail(url);
      }
      toast.success("Images uploaded");
    } catch {
      toast.error("Upload failed");
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
        ...form,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        stockQty: parseInt(form.stockQty),
        images: uploadedImages,
        thumbnail: thumbnail || (uploadedImages.length > 0 ? uploadedImages[0] : null),
        tags: form.tags || null,
        barcode: form.barcode || null,
        brandId: form.brandId || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
      };
      await api.put(`/products/${id}`, payload);
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Edit Product</h1>
          <p className="text-slate-400 text-sm">Update the product information below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-white border-b border-slate-700 pb-3">Basic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    Product Name *
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Fresh Organic Apples"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    SKU *
                  </Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="e.g. APP-001"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    Barcode
                  </Label>
                  <Input
                    value={form.barcode}
                    onChange={(e) => set("barcode", e.target.value)}
                    placeholder="Optional barcode"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    Tags
                  </Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    placeholder="e.g. organic,fresh,fruit"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                  Description *
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Detailed product description..."
                  rows={4}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                  required
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-white border-b border-slate-700 pb-3">Pricing & Stock</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    Price (৳) *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    Sale Price (৳)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.discountPrice}
                    onChange={(e) => set("discountPrice", e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    Stock Qty *
                  </Label>
                  <Input
                    type="number"
                    value={form.stockQty}
                    onChange={(e) => set("stockQty", e.target.value)}
                    placeholder="0"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    Weight
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => set("weight", e.target.value)}
                    placeholder="kg"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  placeholder="e.g. kg, pcs, litre"
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-white border-b border-slate-700 pb-3">SEO</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    SEO Title
                  </Label>
                  <Input
                    value={form.seoTitle}
                    onChange={(e) => set("seoTitle", e.target.value)}
                    placeholder="SEO meta title"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                    SEO Description
                  </Label>
                  <Textarea
                    value={form.seoDescription}
                    onChange={(e) => set("seoDescription", e.target.value)}
                    placeholder="SEO meta description"
                    rows={2}
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-white border-b border-slate-700 pb-3">Organisation</h2>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                  Category *
                </Label>
                <select
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">
                  Brand
                </Label>
                <select
                  value={form.brandId}
                  onChange={(e) => set("brandId", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="">No brand</option>
                  {brands.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Flags */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-white border-b border-slate-700 pb-3">Labels & Status</h2>
              {[
                { key: "isActive", label: "Active (Visible)" },
                { key: "isFeatured", label: "Featured" },
                { key: "isBestSeller", label: "Best Seller" },
                { key: "isFlashSale", label: "Flash Sale" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{label}</span>
                  <Switch
                    checked={form[key as keyof typeof form] as boolean}
                    onCheckedChange={(v) => set(key, v)}
                  />
                </div>
              ))}
            </div>

            {/* Images */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-white border-b border-slate-700 pb-3">Images</h2>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-6 cursor-pointer hover:border-primary transition-colors">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                ) : (
                  <Upload className="h-6 w-6 text-slate-500 mb-2" />
                )}
                <span className="text-slate-400 text-xs text-center">
                  {uploading ? "Uploading..." : "Click to upload images"}
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
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {url === thumbnail && (
                        <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1 rounded">
                          THUMB
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setThumbnail(url)}
                          className="bg-primary text-white text-[9px] rounded px-1 py-0.5"
                        >
                          Set Main
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImages((prev) => prev.filter((u) => u !== url));
                            if (thumbnail === url) setThumbnail("");
                          }}
                          className="bg-red-500 text-white p-0.5 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
}
