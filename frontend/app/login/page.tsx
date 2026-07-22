"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-xl border rounded-3xl p-4">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-extrabold tracking-tight text-primary">
            Welcome to KineNao
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Log in to manage your cosmetics orders and check out swiftly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold">Email Address</Label>
              <div className="relative flex items-center">
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold">Password</Label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <KeyRound className="absolute left-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold h-10 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="font-bold text-primary hover:underline">
              Create an Account
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
