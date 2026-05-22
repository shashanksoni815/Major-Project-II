import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { useApplyTheme } from "@/lib/theme";
import { useAMS } from "@/lib/store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-semibold gold-text">404</p>
        <h2 className="mt-3 font-display text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a href="/" className="mt-6 inline-flex rounded-lg gold-gradient px-5 py-2 text-sm font-medium text-charcoal">Go home</a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AMS · ECE Department · Chameli Devi Group of Institutions" },
      { name: "description", content: "Asset Management System for the Electronics & Communication Engineering department of Chameli Devi Group of Institutions (RGPV)." },
      { property: "og:title", content: "AMS · ECE Department · Chameli Devi Group of Institutions" },
      { name: "twitter:title", content: "AMS · ECE Department · Chameli Devi Group of Institutions" },
      { property: "og:description", content: "Asset Management System for the Electronics & Communication Engineering department of Chameli Devi Group of Institutions (RGPV)." },
      { name: "twitter:description", content: "Asset Management System for the Electronics & Communication Engineering department of Chameli Devi Group of Institutions (RGPV)." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5195eb1a-a28e-40ca-8ef4-5196ff6f710d/id-preview-f28f7273--7d010167-53c1-4af0-b1da-f0e91cdfdb4e.lovable.app-1776599960195.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5195eb1a-a28e-40ca-8ef4-5196ff6f710d/id-preview-f28f7273--7d010167-53c1-4af0-b1da-f0e91cdfdb4e.lovable.app-1776599960195.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useApplyTheme();
  const syncData = useAMS((s) => s.syncData);

  useEffect(() => {
    syncData();
  }, [syncData]);

  return (
    <>
      <Outlet />
      <Toaster
        position="top-right"
        theme="system"
        toastOptions={{
          classNames: {
            toast: "rounded-xl border border-border bg-card text-card-foreground shadow-lg",
          },
        }}
      />
    </>
  );
}
