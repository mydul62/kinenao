"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2,
  Settings,
  Save,
  Globe,
  Share2,
  Image as ImageIcon,
  Volume2,
  PhoneCall,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings, defaultSettings, SiteSettings } from "@/context/SettingsContext";

export default function AdminSettingsPage() {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const [formState, setFormState] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then(({ data }) => {
        const settingsData = data?.data?.settings || {};
        const merged: any = { ...defaultSettings };
        Object.entries(settingsData).forEach(([key, val]: any) => {
          let value = val;
          if (val && typeof val === "object" && "value" in val) value = val.value;
          if (key === "isAnnouncementEnabled") merged.isAnnouncementEnabled = Boolean(value);
          else if (key === "announcementSpeed") merged.announcementSpeed = Number(value) || 25;
          else if (value !== undefined && value !== null && value !== "") merged[key] = value;
        });
        setFormState(merged);
      })
      .catch(() => setFormState(defaultSettings))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof SiteSettings, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(formState).map(([key, value]) => api.post("/settings", { key, value }))
      );
      await refreshSettings();
      toast.success("সকল সেটিংস সফলভাবে সেভ করা হয়েছে!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "সেভ ব্যর্থ হয়েছে");
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-['Inter',sans-serif] pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131914] tracking-tight font-['Manrope',sans-serif]">
              স্টোর সেটিংস (System Config)
            </h1>
            <span className="bg-[#E4EEE7] text-[#123524] text-xs font-bold px-2.5 py-0.5 rounded-full font-['Manrope']">
              Dynamic UI System
            </span>
          </div>
          <p className="text-[#5C685F] text-xs sm:text-sm mt-1">
            লোগো, স্ক্রোলিং নোটিশ টেক্সট, ফোন/ইমেইল এবং সোশ্যাল মিডিয়া আইকন ডায়নামিকভাবে পরিবর্তন করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>সেটিংস সেভ করুন</span>
        </button>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">স্টোর লোগো মোড</span>
            <ImageIcon className="w-4 h-4 text-[#123524]" />
          </div>
          <h3 className="text-lg font-black text-[#131914] mt-2 capitalize font-['Manrope']">
            {formState.logoType === "image" ? "ছবি লোগো" : formState.logoType === "both" ? "উভয়ই" : "টেক্সট লোগো"}
          </h3>
          <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1">
            {formState.logoUrl ? "কাস্টম লোগো আপলোড করা" : "ডিফল্ট টেক্সট লোগো"}
          </p>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">স্ক্রোলিং নোটিশ</span>
            <Volume2 className="w-4 h-4 text-[#123524]" />
          </div>
          <h3 className="text-lg font-black text-[#131914] mt-2 font-['Manrope']">
            {formState.isAnnouncementEnabled ? "সক্রিয় (Active)" : "বন্ধ (Disabled)"}
          </h3>
          <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1">
            স্পিড: {formState.announcementSpeed}s
          </p>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">সোশ্যাল মিডিয়া</span>
            <Share2 className="w-4 h-4 text-[#123524]" />
          </div>
          <h3 className="text-lg font-black text-[#131914] mt-2 font-['Manrope']">
            ৫টি চ্যানেল
          </h3>
          <p className="text-[11px] font-semibold text-[#1F8A4C] mt-1">
            FB / IG / TW / YT / WA
          </p>
        </div>

        <div className="bg-white border border-[#E4E8E4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5C685F]">কাস্টমার সাপোর্ট</span>
            <PhoneCall className="w-4 h-4 text-[#123524]" />
          </div>
          <h3 className="text-lg font-black text-[#131914] mt-2 font-['Manrope'] truncate">
            {formState.supportPhone}
          </h3>
          <p className="text-[11px] font-semibold text-[#5C685F] mt-1 truncate">
            {formState.supportEmail}
          </p>
        </div>
      </div>

      {/* 3. STORE LOGO & BRANDING CONFIGURATION */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4E8E4] pb-3">
          <Sparkles className="h-5 w-5 text-[#123524]" />
          <div>
            <h2 className="font-extrabold text-[#131914] text-base font-['Manrope']">
              স্টোর লোগো ও ব্র্যান্ডিং (Logo & Identity)
            </h2>
            <p className="text-xs text-[#5C685F]">
              হেডার, ফুটার এবং সাইডবারে প্রদর্শিত লোগো ও ওয়েবসাইট নাম পরিবর্তন করুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Store Name */}
          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">ওয়েবসাইটের নাম (Site Name)</Label>
            <Input
              value={formState.siteName || ""}
              onChange={(e) => setField("siteName", e.target.value)}
              placeholder="e.g. K I N E N A O"
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl font-bold"
            />
          </div>

          {/* Logo Type */}
          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">লোগো মোড (Logo Type)</Label>
            <select
              value={formState.logoType || "text"}
              onChange={(e) => setField("logoType", e.target.value)}
              className="w-full h-9 px-3 bg-[#F5F7F5] border border-[#E4E8E4] text-[#131914] text-xs font-bold rounded-xl focus:outline-none focus:ring-1 focus:ring-[#123524]"
            >
              <option value="text">শুধুমাত্র টেক্সট (Text Logo)</option>
              <option value="image">শুধুমাত্র ছবি লোগো (Image Logo)</option>
              <option value="both">ছবি + টেক্সট (Both Image & Text)</option>
            </select>
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">স্টোর ট্যাগলাইন (Tagline)</Label>
            <Input
              value={formState.siteTagline || ""}
              onChange={(e) => setField("siteTagline", e.target.value)}
              placeholder="e.g. Premium E-Commerce Store"
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl"
            />
          </div>
        </div>

        {/* Logo URL & Live Preview */}
        <div className="space-y-2 pt-1">
          <Label className="text-[#131914] text-xs font-bold">কাস্টম লোগো ইমেজ URL (Logo Image URL)</Label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              value={formState.logoUrl || ""}
              onChange={(e) => setField("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl font-mono text-xs flex-1"
            />
            {formState.logoUrl && (
              <div className="h-10 px-4 bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-500">প্রিভিউ:</span>
                <img
                  src={formState.logoUrl}
                  alt="Logo Preview"
                  className="h-7 max-w-[120px] object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. TOP SCROLLING ANNOUNCEMENT TICKER CONFIGURATION */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4E8E4] pb-3">
          <Volume2 className="h-5 w-5 text-[#123524]" />
          <div>
            <h2 className="font-extrabold text-[#131914] text-base font-['Manrope']">
              টপ স্ক্রোলিং অ্যানাউন্সমেন্ট বার (Scrolling Marquee Notice Ticker)
            </h2>
            <p className="text-xs text-[#5C685F]">
              ওয়েবসাইটের একদম উপরে যে নোটিশ টেক্সটটি স্ক্রোল করে যায় তা অন/অফ ও স্পিড কাস্টমাইজ করুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Toggle Announcement Bar */}
          <div className="flex items-center justify-between p-3.5 bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl">
            <div>
              <p className="text-xs font-bold text-[#131914]">স্ক্রোলিং নোটিশ বার চালু থাকবে?</p>
              <p className="text-[11px] text-[#5C685F]">বন্ধ করলে ওয়েবসাইটের টপ অ্যানাউন্সমেন্ট বার হাইড হবে</p>
            </div>
            <input
              type="checkbox"
              checked={formState.isAnnouncementEnabled}
              onChange={(e) => setField("isAnnouncementEnabled", e.target.checked)}
              className="w-5 h-5 text-[#123524] rounded accent-[#123524] cursor-pointer"
            />
          </div>

          {/* Marquee Speed */}
          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">স্ক্রোলিং স্পিড (সেকেন্ডে)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={5}
                max={100}
                value={formState.announcementSpeed || 25}
                onChange={(e) => setField("announcementSpeed", Number(e.target.value))}
                className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl font-bold w-28"
              />
              <span className="text-xs text-slate-500 font-semibold">(কম সংখ্যা = দ্রুত স্ক্রোল)</span>
            </div>
          </div>
        </div>

        {/* Announcement Text */}
        <div className="space-y-1.5">
          <Label className="text-[#131914] text-xs font-bold">স্ক্রোলিং নোটিশ টেক্সট (Notice Text)</Label>
          <Textarea
            value={formState.announcementText || ""}
            onChange={(e) => setField("announcementText", e.target.value)}
            rows={2}
            className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] font-semibold rounded-xl text-xs"
            placeholder="FREE SHIPPING ON ALL ORDERS OF ৳1500 | 100% AUTHENTIC COSMETICS | ⚡ SPECIAL DISCOUNT ON ALL BEAUTY PRODUCTS!"
          />
        </div>

        {/* Live Marquee Preview Bar */}
        {formState.isAnnouncementEnabled && formState.announcementText && (
          <div className="mt-3 pt-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">লাইভ নোটিশ বার প্রিভিউ:</p>
            <div className="w-full bg-[#123524] text-white py-2 px-3 rounded-xl overflow-hidden shadow-xs text-xs font-extrabold tracking-wider border border-emerald-900">
              <div
                className="whitespace-nowrap inline-block animate-marquee"
                style={{ animationDuration: `${formState.announcementSpeed || 25}s` }}
              >
                {formState.announcementText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. SOCIAL MEDIA PROFILES & WHATSAPP */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4E8E4] pb-3">
          <Share2 className="h-5 w-5 text-[#123524]" />
          <div>
            <h2 className="font-extrabold text-[#131914] text-base font-['Manrope']">
              সোশ্যাল মিডিয়া প্রোফাইল লিংক (Social Links & WhatsApp)
            </h2>
            <p className="text-xs text-[#5C685F]">
              হেডার ও ফুটারে আইকন সমূহে যে সোশ্যাল মিডিয়া লিংকগুলো কাজ করবে।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">Facebook Page URL</Label>
            <Input
              value={formState.facebookUrl || ""}
              onChange={(e) => setField("facebookUrl", e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">Instagram Profile URL</Label>
            <Input
              value={formState.instagramUrl || ""}
              onChange={(e) => setField("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/yourprofile"
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">Twitter / X URL</Label>
            <Input
              value={formState.twitterUrl || ""}
              onChange={(e) => setField("twitterUrl", e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">YouTube Channel URL</Label>
            <Input
              value={formState.youtubeUrl || ""}
              onChange={(e) => setField("youtubeUrl", e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[#131914] text-xs font-bold">WhatsApp Number / Chat Link</Label>
            <Input
              value={formState.whatsappNumber || ""}
              onChange={(e) => setField("whatsappNumber", e.target.value)}
              placeholder="+8801700000000 or https://wa.me/8801700000000"
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* 6. STORE CONTACT DETAILS & FOOTER INFO */}
      <div className="bg-white border border-[#E4E8E4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4E8E4] pb-3">
          <Globe className="h-5 w-5 text-[#123524]" />
          <div>
            <h2 className="font-extrabold text-[#131914] text-base font-['Manrope']">
              স্টোর কন্টাক্ট ও ফুটার তথ্য (Contact & Footer Info)
            </h2>
            <p className="text-xs text-[#5C685F]">
              ওয়েবসাইটের ফুটার ও সাপোর্ট সেকশনে প্রদর্শিত কন্টাক্ট ইনফরমেশন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">সাপোর্ট ইমেইল (Support Email)</Label>
            <Input
              type="email"
              value={formState.supportEmail || ""}
              onChange={(e) => setField("supportEmail", e.target.value)}
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[#131914] text-xs font-bold">সাপোর্ট ফোন নম্বর (Support Phone)</Label>
            <Input
              value={formState.supportPhone || ""}
              onChange={(e) => setField("supportPhone", e.target.value)}
              className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#131914] text-xs font-bold">অফিস / শোরুম ঠিকানা (Address)</Label>
          <Textarea
            value={formState.address || ""}
            onChange={(e) => setField("address", e.target.value)}
            rows={2}
            className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl resize-none text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#131914] text-xs font-bold">ফুটার কপিরাইট টেক্সট (Footer Copyright)</Label>
          <Input
            value={formState.footerText || ""}
            onChange={(e) => setField("footerText", e.target.value)}
            className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#131914] text-xs font-bold">SEO Meta Description</Label>
          <Textarea
            value={formState.metaDescription || ""}
            onChange={(e) => setField("metaDescription", e.target.value)}
            rows={2}
            className="bg-[#F5F7F5] border-[#E4E8E4] text-[#131914] rounded-xl resize-none text-xs"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>সকল সেটিংস সেভ করুন (Save All Settings)</span>
        </button>
      </div>
    </div>
  );
}
