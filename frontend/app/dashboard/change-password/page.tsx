"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ value, field, placeholder, showKey }: { value: string; field: keyof typeof form; placeholder: string; showKey: keyof typeof show }) => (
    <div className="relative">
      <Input
        type={show[showKey] ? "text" : "password"}
        value={value}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        className="pr-10"
        required
      />
      <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-slate-800">Change Password</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-lg">
          <Lock className="h-5 w-5 text-slate-500" />
          <p className="text-slate-600 text-sm">Choose a strong password with at least 8 characters, including numbers and symbols.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password *</Label>
            <PasswordInput value={form.currentPassword} field="currentPassword" placeholder="Enter current password" showKey="current" />
          </div>
          <div className="space-y-2">
            <Label>New Password *</Label>
            <PasswordInput value={form.newPassword} field="newPassword" placeholder="Enter new password" showKey="new" />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password *</Label>
            <PasswordInput value={form.confirmPassword} field="confirmPassword" placeholder="Confirm new password" showKey="confirm" />
          </div>

          {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-red-500 text-xs">Passwords do not match</p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 mt-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
