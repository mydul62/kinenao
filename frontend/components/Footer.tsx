"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react";

export const Footer: React.FC = () => {
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
    <footer className="w-full bg-muted/40 border-t py-12 px-[4px] sm:px-3">
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
        {/* About Column */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-primary">KineNao</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your premium online neighborhood beauty and cosmetics boutique, delivering 100% authentic luxury makeup, skincare, and fragrance collections directly to your doorstep.
          </p>
          <div className="flex gap-4 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Contact Us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> +880 1700 000000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> support@kinenao.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Banani, Dhaka, Bangladesh
            </li>
          </ul>
        </div>

        {/* Links */}
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

      <div className="container mx-auto mt-12 pt-6 border-t text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} KineNao Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
