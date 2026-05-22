import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") {
      throw redirect({ to: "/login" });
    }
    const raw = localStorage.getItem("ams-auth-v1");
    let authed = false;
    try { authed = !!JSON.parse(raw ?? "{}")?.state?.user; } catch { /* noop */ }
    throw redirect({ to: authed ? "/dashboard" : "/login" });
  },
});
