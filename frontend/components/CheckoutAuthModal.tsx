"use client";

import React, { useState } from "react";
import { UserCheck, UserPlus, LogIn, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface CheckoutAuthModalProps {
  onContinueAsGuest: () => void;
  onLoginSuccess: () => void;
}

export default function CheckoutAuthModal({
  onContinueAsGuest,
  onLoginSuccess,
}: CheckoutAuthModalProps) {
  const [activeTab, setActiveTab] = useState<"CHOICE" | "LOGIN" | "REGISTER">("CHOICE");
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states for login/register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide email and password");
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Logged in successfully!");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Please fill in required fields");
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, fullName, phoneNumber: phone });
      toast.success("Account created successfully!");
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-[28px] border border-rose-100/70 shadow-lg bg-white overflow-hidden max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50/50 border-b border-rose-100/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3" /> Seamless Ordering
            </span>
            <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Choose How You Want to Checkout
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              You do NOT need an account to place an order with us.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {activeTab === "CHOICE" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Guest Checkout */}
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="group flex flex-col justify-between border-2 border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 p-5 rounded-2xl transition-all text-left space-y-3 cursor-pointer shadow-sm hover:shadow"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block bg-primary text-primary-foreground text-[9px] font-extrabold px-2 py-0.5 rounded">
                    NO LOGIN NEEDED
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">Continue as Guest</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Fast & simple checkout. Just enter your contact & shipping info.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-primary gap-1 pt-2">
                  Instant Checkout <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Log In */}
              <button
                type="button"
                onClick={() => setActiveTab("LOGIN")}
                className="group flex flex-col justify-between border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 p-5 rounded-2xl transition-all text-left space-y-3 cursor-pointer shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogIn className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900">Log In</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Auto-fill saved addresses and track order history in your account.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-slate-700 gap-1 pt-2">
                  Sign In <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 3: Create Account */}
              <button
                type="button"
                onClick={() => setActiveTab("REGISTER")}
                className="group flex flex-col justify-between border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 p-5 rounded-2xl transition-all text-left space-y-3 cursor-pointer shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900">Create Account</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Save preferences, earn beauty points & get exclusive discounts.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-slate-700 gap-1 pt-2">
                  Sign Up <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 justify-center text-[11px] text-slate-400 pt-2 border-t">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Your privacy & security are 100% protected.</span>
            </div>
          </div>
        )}

        {activeTab === "LOGIN" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Log In to Your Account</h3>
              <button
                type="button"
                onClick={() => setActiveTab("CHOICE")}
                className="text-xs text-primary font-bold hover:underline"
              >
                &larr; Change Choice
              </button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Email Address</Label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold h-10 rounded-xl"
            >
              {loading ? "Logging in..." : "Log In & Continue Checkout"}
            </Button>
          </form>
        )}

        {activeTab === "REGISTER" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Create Customer Account</h3>
              <button
                type="button"
                onClick={() => setActiveTab("CHOICE")}
                className="text-xs text-primary font-bold hover:underline"
              >
                &larr; Change Choice
              </button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Full Name</Label>
              <Input
                placeholder="Nusrat Jahan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Email Address</Label>
              <Input
                type="email"
                placeholder="nusrat@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Phone Number</Label>
              <Input
                placeholder="01712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold h-10 rounded-xl"
            >
              {loading ? "Creating Account..." : "Create Account & Continue"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
