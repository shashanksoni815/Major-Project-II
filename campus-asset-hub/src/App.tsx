import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useApplyTheme } from "@/lib/theme";
import { useAMS } from "@/lib/store";
import { useAuth } from "@/lib/auth";

// Layouts
import { AppShell } from "@/components/AppShell";

// Routes
import Landing from "@/routes/index";
import Login from "@/routes/login";
import Signup from "@/routes/signup";
import Dashboard from "@/routes/dashboard";
import Devices from "@/routes/devices";
import Labs from "@/routes/labs";
import NewLab from "@/routes/new-lab";
import Reports from "@/routes/reports";
import Settings from "@/routes/settings";
import Staff from "@/routes/staff";
import Transfers from "@/routes/transfers";

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  useApplyTheme();
  const syncData = useAMS((s) => s.syncData);

  useEffect(() => {
    syncData();
  }, [syncData]);

  return (
    <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="devices" element={<Devices />} />
            <Route path="labs/new" element={<NewLab />} />
            <Route path="labs/:labId" element={<Labs />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="staff" element={<Staff />} />
            <Route path="transfers" element={<Transfers />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundComponent />} />
        </Routes>

        <Toaster
          position="top-right"
          theme="system"
          toastOptions={{
            classNames: {
              toast: "rounded-xl border border-border bg-card text-card-foreground shadow-lg",
            },
          }}
        />
      </BrowserRouter>
  );
}
