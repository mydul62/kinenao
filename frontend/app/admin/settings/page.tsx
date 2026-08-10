"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Settings, Save, Globe, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultSettings = {
    siteName: "KineNao",
    siteTagline: "Luxury Beauty & Cosmetics Boutique",
    supportEmail: "support@kinenao.com",
    supportPhone: "+880 1700-000001",
    address: "Gulshan-2, Dhaka, Bangladesh",
    facebookUrl: "https://facebook.com/kinenao",
    instagramUrl: "https://instagram.com/kinenao",
    twitterUrl: "https://twitter.com/kinenao",
    youtubeUrl: "https://youtube.com/@kinenao",
    footerText: "© 2026 KineNao. All rights reserved.",
    metaDescription: "Shop authentic skincare, makeup, lipsticks, and designer perfumes online with swift delivery.",
    announcementText: "FREE SHIPPING ON ALL ORDERS OF ৳1500 | 100% AUTHENTIC COSMETICS | ⚡ SPECIAL DISCOUNT ON ALL BEAUTY PRODUCTS!",
  };

  useEffect(() => {
    api
      .get("/settings")
      .then(({ data }) => {
        const settingsData = data.data.settings || {};
        const merged: Record<string, any> = { ...defaultSettings };
        Object.entries(settingsData).forEach(([key, val]: any) => {
          if (val && typeof val === "object" && "value" in val) merged[key] = val.value;
          else merged[key] = val;
        });
        setSettings(merged);
      })
      .catch(() => setSettings(defaultSettings))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(settings).map(([key, value]) => api.post("/settings", { key, value }))
      );
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
      </div>
    );
  }

  const set = (k: string, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-5 max-w-5xl mx-auto font-['Inter',sans-serif]">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              Store Settings
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              System Config
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-0.5">
            Manage store metadata, contact information, SEO descriptions, and social links.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* 2. Row of 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Store Domain</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none truncate">
              kinenao.com
            </h3>
            <p className="text-[11px] font-bold text-[#1F8A4C] mt-1.5 flex items-center gap-1">
              <span>✓</span> Live DNS connected
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Environment</span>
            <div className="w-6 h-6 rounded-md bg-[#E6F5EB] text-[#1F8A4C] flex items-center justify-center border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              Production
            </h3>
            <p className="text-[11px] font-semibold text-[#5C685F] mt-1.5">
              High-availability cluster
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">Social Profiles</span>
            <div className="w-6 h-6 rounded-md bg-[#F1F6F2] text-[#123524] flex items-center justify-center border border-[#E4EEE7]">
              <Share2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              4 Channels
            </h3>
            <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1.5">
              FB / IG / TW / YT
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">SEO Indexing</span>
            <div className="w-6 h-6 rounded-md bg-[#FBEEE0] text-[#B5601A] flex items-center justify-center border border-amber-200/50">
              <Settings className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#131914] font-['Manrope',sans-serif] tracking-tight leading-none">
              Active
            </h3>
            <p className="text-[11px] font-semibold text-[#B5601A] mt-1.5">
              Google Crawlers enabled
            </p>
          </div>
        </div>
      </div>

      {/* 3. General Store Configuration Card */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4E8E4] pb-3">
          <Globe className="h-4 w-4 text-[#123524]" />
          <h2 className="font-extrabold text-[#131914] text-base font-['Manrope']">General Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">Store Name</Label>
            <Input
              value={settings.siteName || ""}
              onChange={(e) => set("siteName", e.target.value)}
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">Tagline</Label>
            <Input
              value={settings.siteTagline || ""}
              onChange={(e) => set("siteTagline", e.target.value)}
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">Support Email</Label>
            <Input
              type="email"
              value={settings.supportEmail || ""}
              onChange={(e) => set("supportEmail", e.target.value)}
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">Support Phone</Label>
            <Input
              value={settings.supportPhone || ""}
              onChange={(e) => set("supportPhone", e.target.value)}
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#131914] text-xs font-bold">Physical Address</Label>
          <Textarea
            value={settings.address || ""}
            onChange={(e) => set("address", e.target.value)}
            rows={2}
            className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#131914] text-xs font-bold">Homepage Meta Description (SEO)</Label>
          <Textarea
            value={settings.metaDescription || ""}
            onChange={(e) => set("metaDescription", e.target.value)}
            rows={2}
            className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl resize-none text-xs"
            placeholder="SEO meta description..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#131914] text-xs font-bold">Footer Copyright Text</Label>
          <Input
            value={settings.footerText || ""}
            onChange={(e) => set("footerText", e.target.value)}
            className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
          />
        </div>
      </div>

      {/* 4. Announcement Bar & Scrolling Ticker Card */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4E8E4] pb-3">
          <Settings className="h-4 w-4 text-[#123524]" />
          <div>
            <h2 className="font-extrabold text-[#131914] text-base font-['Manrope']">Top Header Promotional Announcement Bar</h2>
            <p className="text-xs text-[#5C685F]">
              This text continuously scrolls as an animated marquee ticker across the top announcement bar.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#131914] text-xs font-bold">
            Scrolling Announcement Text
          </Label>
          <Textarea
            value={settings.announcementText || ""}
            onChange={(e) => set("announcementText", e.target.value)}
            rows={2}
            className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] font-semibold rounded-xl text-xs"
            placeholder="e.g. FREE SHIPPING ON ALL ORDERS OF ৳1500 | 100% AUTHENTIC COSMETICS | USE COUPON 'OFF50' FOR 50% DISCOUNT ⚡"
          />
        </div>
      </div>

      {/* 5. Social Links Card */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4E8E4] pb-3">
          <Share2 className="h-4 w-4 text-[#123524]" />
          <h2 className="font-extrabold text-[#131914] text-base font-['Manrope']">Social Media Profiles</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "facebookUrl", label: "Facebook URL" },
            { key: "instagramUrl", label: "Instagram URL" },
            { key: "twitterUrl", label: "Twitter / X URL" },
            { key: "youtubeUrl", label: "YouTube URL" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-[#131914] text-xs font-bold">{label}</Label>
              <Input
                value={settings[key] || ""}
                onChange={(e) => set(key, e.target.value)}
                placeholder="https://..."
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save All Settings</span>
        </button>
      </div>
    </div>
  );
}
