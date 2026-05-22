import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Trash2, Check } from "lucide-react";
import { useAMS } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const activities = useAMS((s) => s.activities);
  const hasNew = activities.length > 0;

  const getIcon = (type: string, entity: string) => {
    if (type === "create") return "✚";
    if (type === "update") return "⟳";
    if (type === "delete") return "✕";
    if (type === "transfer") return "↻";
    return "•";
  };

  const getColor = (type: string) => {
    if (type === "create") return "text-green-500";
    if (type === "update") return "text-blue-500";
    if (type === "delete") return "text-red-500";
    if (type === "transfer") return "text-purple-500";
    return "text-muted-foreground";
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative rounded-lg p-2 transition hover:bg-muted",
          open && "bg-muted"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasNew && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/0"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-20 right-4 z-50 w-96 max-h-96 overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-12 text-sm text-muted-foreground">
                    <Check className="mb-2 h-8 w-8 opacity-30" />
                    <p>All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {activities.slice(0, 20).map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-start gap-3 px-4 py-3 transition hover:bg-muted/50"
                      >
                        <span
                          className={cn(
                            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border",
                            getColor(activity.type)
                          )}
                        >
                          {getIcon(activity.type, activity.entity)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {activity.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(activity.date)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
