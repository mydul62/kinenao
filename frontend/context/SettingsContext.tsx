"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  logoType: "text" | "image" | "both";
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  footerText: string;
  metaDescription: string;
  announcementText: string;
  isAnnouncementEnabled: boolean;
  announcementSpeed: number;
  announcementBgColor: string;
  announcementTextColor: string;
}

export const defaultSettings: SiteSettings = {
  siteName: "K I N E N A O",
  siteTagline: "Luxury Beauty & Cosmetics Boutique",
  logoUrl: "",
  logoType: "text",
  supportEmail: "support@kinenao.com",
  supportPhone: "+880 1700-000001",
  whatsappNumber: "+880 1700-000001",
  address: "Gulshan-2, Dhaka, Bangladesh",
  facebookUrl: "https://facebook.com/kinenao",
  instagramUrl: "https://instagram.com/kinenao",
  twitterUrl: "https://twitter.com/kinenao",
  youtubeUrl: "https://youtube.com/@kinenao",
  footerText: "© 2026 KineNao. All rights reserved.",
  metaDescription: "Shop authentic skincare, makeup, lipsticks, and designer perfumes online with swift delivery.",
  announcementText: "FREE SHIPPING ON ALL ORDERS OF ৳1500 | 100% AUTHENTIC COSMETICS | ⚡ SPECIAL DISCOUNT ON ALL BEAUTY PRODUCTS!",
  isAnnouncementEnabled: true,
  announcementSpeed: 25,
  announcementBgColor: "#123524",
  announcementTextColor: "#ffffff",
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      const settingsData = data?.data?.settings || {};
      const merged: any = { ...defaultSettings };

      Object.entries(settingsData).forEach(([key, val]: any) => {
        let value = val;
        if (val && typeof val === "object" && "value" in val) {
          value = val.value;
        }

        if (key === "isAnnouncementEnabled") {
          merged.isAnnouncementEnabled = Boolean(value);
        } else if (key === "announcementSpeed") {
          merged.announcementSpeed = Number(value) || 25;
        } else if (value !== undefined && value !== null && value !== "") {
          merged[key] = value;
        }
      });

      setSettings(merged);
    } catch (err) {
      console.warn("Could not load dynamic site settings, using defaults.", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettingsPartial: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettingsPartial };
    setSettings(updated);

    // Persist all updated keys to backend API
    const promises = Object.entries(newSettingsPartial).map(([key, value]) =>
      api.post("/settings", { key, value })
    );

    await Promise.all(promises);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
