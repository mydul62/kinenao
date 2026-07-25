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
        <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
      </div>
    );
  }

  const set = (k: string, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Website & Store Settings
            </h1>
            <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
              System Config
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Manage store metadata, contact information, SEO descriptions, and social links.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* General Store Configuration Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
          <Globe className="h-5 w-5 text-[#6C5CE7]" />
          <h2 className="font-extrabold text-slate-900 text-base">General Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-700 text-xs font-bold uppercase">Store Name</Label>
            <Input
              value={settings.siteName || ""}
              onChange={(e) => set("siteName", e.target.value)}
              className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 text-xs font-bold uppercase">Tagline</Label>
            <Input
              value={settings.siteTagline || ""}
              onChange={(e) => set("siteTagline", e.target.value)}
              className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 text-xs font-bold uppercase">Support Email</Label>
            <Input
              type="email"
              value={settings.supportEmail || ""}
              onChange={(e) => set("supportEmail", e.target.value)}
              className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 text-xs font-bold uppercase">Support Phone</Label>
            <Input
              value={settings.supportPhone || ""}
              onChange={(e) => set("supportPhone", e.target.value)}
              className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-700 text-xs font-bold uppercase">Physical Address</Label>
          <Textarea
            value={settings.address || ""}
            onChange={(e) => set("address", e.target.value)}
            rows={2}
            className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-700 text-xs font-bold uppercase">Homepage Meta Description (SEO)</Label>
          <Textarea
            value={settings.metaDescription || ""}
            onChange={(e) => set("metaDescription", e.target.value)}
            rows={2}
            className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl resize-none text-xs"
            placeholder="SEO meta description..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-700 text-xs font-bold uppercase">Footer Copyright Text</Label>
          <Input
            value={settings.footerText || ""}
            onChange={(e) => set("footerText", e.target.value)}
            className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl"
          />
        </div>
      </div>

      {/* Announcement Bar & Scrolling Ticker Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
          <Settings className="h-5 w-5 text-[#6C5CE7]" />
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">Top Header Promotional Announcement Bar</h2>
            <p className="text-xs text-slate-500">
              This text continuously scrolls as an animated marquee ticker across the top red header.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-700 text-xs font-bold uppercase">
            Scrolling Announcement Text
          </Label>
          <Textarea
            value={settings.announcementText || ""}
            onChange={(e) => set("announcementText", e.target.value)}
            rows={2}
            className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 font-semibold rounded-xl text-xs"
            placeholder="e.g. FREE SHIPPING ON ALL ORDERS OF ৳1500 | 100% AUTHENTIC COSMETICS | USE COUPON 'OFF50' FOR 50% DISCOUNT ⚡"
          />
        </div>
      </div>

      {/* Social Links Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
          <Share2 className="h-5 w-5 text-[#6C5CE7]" />
          <h2 className="font-extrabold text-slate-900 text-base">Social Media Profiles</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "facebookUrl", label: "Facebook URL" },
            { key: "instagramUrl", label: "Instagram URL" },
            { key: "twitterUrl", label: "Twitter / X URL" },
            { key: "youtubeUrl", label: "YouTube URL" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-bold uppercase">{label}</Label>
              <Input
                value={settings[key] || ""}
                onChange={(e) => set(key, e.target.value)}
                placeholder="https://..."
                className="bg-[#F8FAFC] border-[#E5E7EB] text-slate-900 rounded-xl text-xs font-mono"
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
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save All Settings</span>
        </button>
      </div>
    </div>
  );
}
