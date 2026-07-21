"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, Save, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerProfilePage() {
  const { user, checkSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", avatarUrl: "" });

  useEffect(() => {
    if (user?.profile) {
      setForm({
        fullName: user.profile.fullName || "",
        phoneNumber: user.profile.phoneNumber || "",
        avatarUrl: user.profile.avatarUrl || "",
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(f => ({ ...f, avatarUrl: data.data.url }));
      toast.success("Avatar uploaded");
    } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/auth/profile", form);
      await checkSession();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-slate-800">My Profile</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <div>
              <p className="text-slate-800 font-semibold text-sm mb-1">{user?.email}</p>
              <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-700 text-sm">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Change Photo"}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="+880XXXXXXXXXX" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user?.email || ""} disabled className="bg-slate-50 text-slate-500" />
            <p className="text-xs text-slate-400">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
