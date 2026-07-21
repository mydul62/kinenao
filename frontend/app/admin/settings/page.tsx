"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Settings, Save } from "lucide-react";
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
    siteTagline: "Fresh Groceries Delivered Fast",
    supportEmail: "",
    supportPhone: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    footerText: "",
    metaDescription: "",
  };

  useEffect(() => {
    api.get("/settings")
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
        Object.entries(settings).map(([key, value]) =>
          api.post("/settings", { key, value })
        )
      );
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const set = (k: string, v: string) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Website Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage site-wide configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      {/* General */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" /> General
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Site Name</Label>
            <Input value={settings.siteName || ""} onChange={e => set("siteName", e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Tagline</Label>
            <Input value={settings.siteTagline || ""} onChange={e => set("siteTagline", e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Support Email</Label>
            <Input type="email" value={settings.supportEmail || ""} onChange={e => set("supportEmail", e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Support Phone</Label>
            <Input value={settings.supportPhone || ""} onChange={e => set("supportPhone", e.target.value)} className="bg-slate-900 border-slate-600 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Address</Label>
          <Textarea value={settings.address || ""} onChange={e => set("address", e.target.value)} rows={2} className="bg-slate-900 border-slate-600 text-white resize-none" />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Meta Description</Label>
          <Textarea value={settings.metaDescription || ""} onChange={e => set("metaDescription", e.target.value)} rows={2} className="bg-slate-900 border-slate-600 text-white resize-none" placeholder="SEO meta description for the homepage..." />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Footer Text</Label>
          <Input value={settings.footerText || ""} onChange={e => set("footerText", e.target.value)} placeholder="© 2025 KineNao. All rights reserved." className="bg-slate-900 border-slate-600 text-white" />
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-white border-b border-slate-700 pb-3">Social Media Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "facebookUrl", label: "Facebook URL" },
            { key: "instagramUrl", label: "Instagram URL" },
            { key: "twitterUrl", label: "Twitter / X URL" },
            { key: "youtubeUrl", label: "YouTube URL" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">{label}</Label>
              <Input value={settings[key] || ""} onChange={e => set(key, e.target.value)} placeholder="https://..." className="bg-slate-900 border-slate-600 text-white" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
