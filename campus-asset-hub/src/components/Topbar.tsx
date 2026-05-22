import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { motion } from "framer-motion";
import { useLocation } from "@tanstack/react-router";
import { useAMS } from "@/lib/store";
import { SearchBar } from "./SearchBar";
import { NotificationPanel } from "./NotificationPanel";


interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const labs = useAMS((s) => s.labs);

  const crumbs = (() => {
    const p = location.pathname;
    if (p === "/") return ["Main Dashboard"];
    if (p.startsWith("/labs/new")) return ["Labs", "Add Lab"];
    if (p.startsWith("/labs/")) {
      const id = p.split("/")[2];
      const lab = labs.find((l) => l.id === id);
      return ["Labs", lab?.name ?? "Lab"];
    }
    if (p.startsWith("/devices")) return ["Assets / Devices"];
    if (p.startsWith("/staff")) return ["Staff Management"];
    if (p.startsWith("/transfers")) return ["Transfer Assets"];
    if (p.startsWith("/reports")) return ["Reports"];
    if (p.startsWith("/settings")) return ["Settings"];
    return [p];
  })();

  return (
    <header className="shrink-0 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden items-center gap-2 text-sm sm:flex">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            <span className={i === crumbs.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}>{c}</span>
          </span>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <SearchBar />
        <NotificationPanel />
        <button onClick={toggle} className="rounded-lg p-2 hover:bg-muted" aria-label="Toggle theme">
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="block"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-gold" /> : <Moon className="h-5 w-5 text-charcoal" />}
          </motion.span>
        </button>
      </div>
    </header>
  );
}
