import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps extends Omit<HTMLMotionProps<"div">, "children" | "title"> {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  accent?: "gold" | "success" | "destructive" | "warning" | "default";
  delay?: number;
}

const accentMap = {
  gold: "from-gold/30 to-gold-soft/10 text-gold",
  success: "from-success/30 to-success/5 text-success",
  destructive: "from-destructive/30 to-destructive/5 text-destructive",
  warning: "from-warning/30 to-warning/5 text-warning",
  default: "from-muted/40 to-muted/10 text-foreground",
} as const;

export function StatCard({ label, value, icon, hint, accent = "default", delay = 0, className, ...rest }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg",
        className,
      )}
      {...rest}
    >
      <div className={cn("pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-60", accentMap[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold leading-none">{value}</p>
          {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", accentMap[accent])}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
