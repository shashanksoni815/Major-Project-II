import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("ams-auth-v1");
    if (!raw) throw redirect({ to: "/login" });
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.state?.user) throw redirect({ to: "/login" });
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const user = useAuth((s) => s.user);
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }
  return <AppShell />;
}

