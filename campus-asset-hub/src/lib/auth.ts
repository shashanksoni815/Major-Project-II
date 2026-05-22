import { create } from "zustand";
import { persist } from "zustand/middleware";

const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  labId?: string;
  labIds?: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string, phone?: string, role?: string, labId?: string) => Promise<AuthUser>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        const response = await fetch(`${apiBase}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Login failed");
        }

        const user = data.user as AuthUser;
        set({ user, token: data.token });
        return user;
      },
      signup: async (name, email, password, phone = "", role = "Faculty", labId = "") => {
        const response = await fetch(`${apiBase}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone, role, labId }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Signup failed");
        }

        const user = data.user as AuthUser;
        set({ user, token: data.token });
        return user;
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: "ams-auth-v1" },
  ),
);
