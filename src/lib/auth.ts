"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "./types";

// Mock credentials — designed to be swapped for Microsoft Entra ID (MSAL) later.
export interface DemoAccount extends User {
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "u_admin",
    name: "Cédric Touré",
    email: "cedric.toure@frieslandcampina.com", // ⚡ Corrigé en .com
    role: "ADMIN",
    region: "Abidjan",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
  {
    id: "u_manager",
    name: "Patrick Epée",
    email: "patrick.epee@frieslandcampina.com",
    role: "MANAGER",
    region: "Abidjan",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
  {
    id: "u_BRAND_MANAGER",
    name: "Dian Delaure",
    email: "dian.delaure@frieslandcampina.com",
    role: "BRAND_MANAGER",
    region: "Abidjan",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
  {
    id: "u_supervisor",
    name: "Marie Jeanne",
    email: "marie.jeanne@frieslandcampina.com",
    role: "SUPERVISOR",
    region: "Bouaké",
    active: true,
    createdAt: Date.now(),
    password: "demo",
  },
  {
    id: "u_agent",
    name: "Dogo Jean-Marc",
    email: "jean-marc.dogo@frieslandcampina.com",
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
  loginAs: (account: Partial<User>) => void; // ⚡ Typage assoupli pour accepter les retours API
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
        // Force l'objet utilisateur à s'enregistrer dans Zustand
        set({ user: account as User });
      },
      logout: () => set({ user: null }),
    }),
    { name: "insighthub-auth" },
  ),
);

// Mappage strict des rôles applicatifs
export const ROLE_ACCESS: Record<string, Role[]> = {
  dashboard: ["ADMIN", "MANAGER", "BRAND_MANAGER", "SUPERVISOR"],
  studies: ["ADMIN", "MANAGER", "BRAND_MANAGER"],
  collect: ["ADMIN", "SUPERVISOR", "FIELD_AGENT","MANAGER"],
  "audit-prix": ["ADMIN", "SUPERVISOR", "FIELD_AGENT","MANAGER"],
  merchandising: ["ADMIN", "SUPERVISOR", "FIELD_AGENT","MANAGER"],
  analytics: ["ADMIN", "MANAGER", "BRAND_MANAGER"],
  validation: ["ADMIN", "MANAGER", "SUPERVISOR"],
  admin: ["ADMIN"],
};

export function canAccess(role: Role | undefined, area: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ACCESS[area];
  return !allowed || allowed.includes(role);
}

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

export function landingPath(role: string | undefined): string {
  if (!role) return "/login";
  // Normalisation de sécurité pour faire correspondre "field" -> "FIELD_AGENT"
  const cleanRole = role.toUpperCase() === "FIELD" ? "FIELD_AGENT" : role.toUpperCase();
  const area = LANDING_ORDER.find((a) => canAccess(cleanRole as Role, a));
  return `/${area ?? "login"}`;
}