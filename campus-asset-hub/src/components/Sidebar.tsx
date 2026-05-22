import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FlaskConical, Plus, HardDrive, Users, ArrowLeftRight,
  BarChart3, Settings, ChevronDown, LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAMS } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.jpg";

const mainNav = [
  { to: "/", label: "Main Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/devices", label: "Assets / Devices", icon: HardDrive },
  { to: "/staff", label: "Staff Management", icon: Users },
  { to: "/transfers", label: "Transfer Assets", icon: ArrowLeftRight },
  { to: "/reports", label: "Reports / Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const labs = useAMS((s) => s.labs);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  const [labsOpen, setLabsOpen] = useState(true);

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
  <img
    src={Logo}
    alt="CDGI Logo"
    className="h-full w-full object-contain"
  />
</div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold leading-tight">Chameli Devi</p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">Group of Institutions · ECE</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">Overview</p>
        <ul className="space-y-1">
          {mainNav.slice(0, 1).map((item) => {
            const exact = "exact" in item ? item.exact : false;
            return <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} active={isActive(item.to, exact)} onNavigate={onNavigate} />;
          })}
        </ul>

        {/* Labs collapsible */}
        <p className="mt-5 flex items-center justify-between px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          <span>Labs</span>
          <Link to="/labs/new" onClick={onNavigate} className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-gold" aria-label="Add lab">
            <Plus className="h-3.5 w-3.5" />
          </Link>
        </p>
        <button
          onClick={() => setLabsOpen((o) => !o)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition",
            "hover:bg-sidebar-accent",
          )}
        >
          <span className="flex items-center gap-3">
            <FlaskConical className="h-4 w-4 text-gold" />
            <span className="font-medium">All Labs</span>
            <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] text-sidebar-foreground/70">{labs.length}</span>
          </span>
          <motion.span animate={{ rotate: labsOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
        <motion.ul
          initial={false}
          animate={{ height: labsOpen ? "auto" : 0, opacity: labsOpen ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden pl-3"
        >
          {labs.map((lab) => {
            const active = location.pathname === `/labs/${lab.id}`;
            return (
              <li key={lab.id}>
                <Link
                  to="/labs/$labId"
                  params={{ labId: lab.id }}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition shrink-0",
                    active
                      ? "bg-sidebar-accent text-gold"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  {active && <motion.span layoutId="lab-active" className="absolute left-0 h-5 w-0.5 rounded-r bg-gold" />}
                  <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
                  <span className="truncate">{lab.name}</span>
                  <span className="ml-auto text-[10px] text-sidebar-foreground/40">S{lab.semester}</span>
                </Link>
              </li>
            );
          })}
        </motion.ul>

        <p className="mt-5 px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">Manage</p>
        <ul className="space-y-1">
          {mainNav.slice(1).map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} active={isActive(item.to)} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full gold-gradient text-charcoal text-sm font-semibold">
            {(user?.name ?? "A").charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "Admin"}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-destructive"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  to, label, icon: Icon, active, onNavigate,
}: {
  to: string; label: string; icon: typeof LayoutDashboard; active: boolean; onNavigate?: () => void;
}) {
  return (
    <li>
      <Link
        to={to}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
          active
            ? "bg-sidebar-accent text-gold"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        )}
      >
        {active && <motion.span layoutId="nav-active" className="absolute left-0 h-5 w-0.5 rounded-r bg-gold" />}
        <Icon className={cn("h-4 w-4", active ? "text-gold" : "text-sidebar-foreground/60 group-hover:text-gold")} />
        <span className="font-medium">{label}</span>
      </Link>
    </li>
  );
}
