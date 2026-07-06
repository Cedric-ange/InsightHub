import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Tags,
  Store,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  area: string; // key used by ROLE_ACCESS (empty = everyone)
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, area: "dashboard" },
  { href: "/studies", label: "Questionnaires", icon: FileText, area: "studies" },
  { href: "/collect", label: "Collecte terrain", icon: ClipboardList, area: "collect" },
  { href: "/audit-prix", label: "Audit Prix", icon: Tags, area: "audit-prix" },
  { href: "/merchandising", label: "Merchandising", icon: Store, area: "merchandising" },
  { href: "/analytics", label: "Analytics & Insights", icon: Sparkles, area: "analytics" },
  { href: "/validation", label: "Validation", icon: CheckCircle2, area: "validation" },
  { href: "/sync", label: "Synchronisation", icon: RefreshCw, area: "" },
  { href: "/admin", label: "Administration", icon: Users, area: "admin" },
];
