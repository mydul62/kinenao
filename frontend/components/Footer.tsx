"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter, MessageSquare } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      await api.post("/newsletter/subscribe", { email });
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Subscription failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-muted/40 border-t py-12 px-3 md:px-6">
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
        {/* About Column with Dynamic Logo & Bio */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-black text-xl text-primary font-sans">
            {settings.logoUrl && (settings.logoType === "image" || settings.logoType === "both") && (
              <img
                src={settings.logoUrl}
                alt={settings.siteName || "KineNao"}
                className="h-8 max-w-[150px] object-contain"
              />
            )}
            {(settings.logoType === "text" || settings.logoType === "both" || !settings.logoUrl) && (
              <span>{settings.siteName || "KineNao"}</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {settings.siteTagline ||
              "Your premium online shopping boutique, delivering 100% authentic collections directly to your doorstep."}
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 text-muted-foreground pt-1">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {settings.twitterUrl && (
              <a
                href={settings.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            )}
            {settings.whatsappNumber && (
              <a
                href={
                  settings.whatsappNumber.startsWith("http")
                    ? settings.whatsappNumber
                    : `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600 text-emerald-700 transition-colors p-1"
                aria-label="WhatsApp"
              >
                <MessageSquare className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        {/* Contact Info (Dynamic) */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Contact Us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {settings.supportPhone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href={`tel:${settings.supportPhone}`} className="hover:text-primary transition-colors">
                  {settings.supportPhone}
                </a>
              </li>
            )}
            {settings.supportEmail && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary transition-colors">
                  {settings.supportEmail}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Customer Service</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/shop" className="hover:text-primary transition-colors">Browse Products</a></li>
            <li><a href="/checkout" className="hover:text-primary transition-colors">Checkout Wizard</a></li>
            <li><a href="/dashboard" className="hover:text-primary transition-colors">Track Orders</a></li>
            <li><a href="/#faqs" className="hover:text-primary transition-colors">FAQs</a></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Newsletter</h4>
          <p className="text-sm text-muted-foreground">
            Subscribe to receive discounts, fresh arrivals updates, and weekly promotional campaigns.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-10 px-3.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground font-semibold px-4 h-10 rounded-lg text-sm hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="w-full mt-12 pt-6 border-t text-center text-xs text-muted-foreground">
        {settings.footerText || `© ${new Date().getFullYear()} ${settings.siteName || "KineNao"}. All rights reserved.`}
      </div>
    </footer>
  );
};

export default Footer;
