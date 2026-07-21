"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Bell, Loader2, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch { toast.error("Failed to load notifications"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      fetch();
    } catch { toast.error("Failed to mark as read"); }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetch();
    } catch {}
  };

  const deleteNotif = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetch();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">
          Notifications
          {unreadCount > 0 && <span className="ml-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs">
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={`bg-white border rounded-xl p-4 flex items-start gap-4 transition-colors cursor-pointer ${notif.isRead ? "border-slate-200" : "border-primary/30 bg-primary/5"}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.isRead ? "bg-slate-300" : "bg-primary"}`} />
              <div className="flex-1">
                <p className={`font-semibold text-sm ${notif.isRead ? "text-slate-700" : "text-slate-800"}`}>{notif.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{notif.message}</p>
                <p className="text-slate-400 text-[10px] mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
