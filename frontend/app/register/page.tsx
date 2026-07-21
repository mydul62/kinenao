"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, KeyRound, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, email, phoneNumber, password });
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border rounded-3xl p-4">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-extrabold tracking-tight text-primary">
            Create an Account
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sign up to shop premium cosmetics and luxury skincare collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-bold">Full Name</Label>
              <div className="relative flex items-center">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-9 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <User className="absolute left-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-xs font-bold">Phone Number</Label>
              <div className="relative flex items-center">
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="01700000000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="pl-9 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <Phone className="absolute left-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold">Password</Label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <KeyRound className="absolute left-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold h-10 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-primary hover:underline">
              Log In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
