import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "success" | "destructive" | "warning" | "muted" | "gold";

interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  muted: "bg-muted text-muted-foreground border-border",
  gold: "bg-gold/15 text-gold border-gold/30",
};

export function StatusPill({ tone = "muted", className, children, ...rest }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...rest}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-success": tone === "success",
        "bg-destructive": tone === "destructive",
        "bg-warning": tone === "warning",
        "bg-muted-foreground": tone === "muted",
        "bg-gold": tone === "gold",
      })} />
      {children}
    </span>
  );
}
