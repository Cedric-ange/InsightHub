"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "./types";

// Mock credentials — designed to be swapped for Microsoft Entra ID (MSAL) later.
// The demo accounts below let you explore every role without a backend.
export interface DemoAccount extends User {
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "u_admin",
    name: "Cédric N'Guessan",
    email: "admin@insighthub.ci",
    role: "ADMIN",
    region: "Abidjan",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
  {
    id: "u_manager",
    name: "Awa Koné",
    email: "manager@insighthub.ci",
    role: "MANAGER",
    region: "Abidjan",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
  {
    id: "u_analyst",
    name: "Yao Kouassi",
    email: "analyst@insighthub.ci",
    role: "ANALYST",
    region: "Abidjan",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
  {
    id: "u_supervisor",
    name: "Fatou Diarra",
    email: "superviseur@insighthub.ci",
    role: "SUPERVISOR",
    region: "Bouaké",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
  {
    id: "u_agent",
    name: "Moussa Traoré",
    email: "enqueteur@insighthub.ci",
    role: "FIELD_AGENT",
    region: "San Pedro",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
];

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAs: (account: DemoAccount) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password) => {
        const acc = DEMO_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!acc || acc.password !== password) {
          return { ok: false, error: "Identifiants invalides." };
        }
        const { password: _pw, ...user } = acc;
        void _pw;
        set({ user });
        return { ok: true };
      },
      loginAs: (account) => {
        const { password: _pw, ...user } = account;
        void _pw;
        set({ user });
      },
      logout: () => set({ user: null }),
    }),
    { name: "insighthub-auth" },
  ),
);

// Which roles may access each feature area.
export const ROLE_ACCESS: Record<string, Role[]> = {
  dashboard: ["ADMIN", "MANAGER", "ANALYST", "SUPERVISOR"],
  studies: ["ADMIN", "MANAGER", "ANALYST"],
  collect: ["ADMIN", "SUPERVISOR", "FIELD_AGENT"],
  "audit-prix": ["ADMIN", "SUPERVISOR", "FIELD_AGENT"],
  merchandising: ["ADMIN", "SUPERVISOR", "FIELD_AGENT"],
  analytics: ["ADMIN", "MANAGER", "ANALYST"],
  validation: ["ADMIN", "MANAGER", "SUPERVISOR"],
  admin: ["ADMIN"],
};

export function canAccess(role: Role | undefined, area: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ACCESS[area];
  return !allowed || allowed.includes(role);
}

// Order in which areas are offered as a landing page after login. The first
// area the role can access becomes its home (e.g. FIELD_AGENT -> /collect),
// which avoids redirect loops for roles without dashboard access.
const LANDING_ORDER = [
  "dashboard",
  "collect",
  "studies",
  "audit-prix",
  "merchandising",
  "analytics",
  "validation",
  "admin",
] as const;

export function landingPath(role: Role | undefined): string {
  const area = LANDING_ORDER.find((a) => canAccess(role, a));
  return `/${area ?? "login"}`;
}
