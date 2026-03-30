"use client";

import { useNotificationStore } from "@/store";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-brand-500/30 bg-brand-500/10 text-brand-400",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
};

export function NotificationStack() {
  const { notifications, removeNotification } = useNotificationStore();

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {notifications.map((n) => {
        const Icon = icons[n.type];
        return (
          <div
            key={n.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-2xl border glass shadow-2xl animate-slide-up",
              colors[n.type]
            )}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm flex-1 text-white/90">{n.message}</p>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-white/40 hover:text-white/80 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
