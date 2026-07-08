"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav";
import { canAccess, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/sidebarStore"; // ⚡ Store
import { ChevronLeft, ChevronRight } from "lucide-react"; // ⚡ Icônes flèches

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const { isCollapsed, toggle } = useSidebarStore(); // ⚡ Récupération état
  const items = NAV_ITEMS.filter((i) => canAccess(user?.role, i.area));

  return (
    <div className="flex h-full flex-col bg-brand-950 text-white transition-all duration-300">
      {/* Logo Section */}
      <div className={cn("flex items-center gap-2 py-5 transition-all", isCollapsed ? "justify-center px-0" : "px-5")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 font-bold">
          IH
        </div>
        {!isCollapsed && (
          <div className="leading-tight animate-fade-in">
            <div className="text-sm font-bold">InsightHub</div>
            <div className="text-[11px] text-brand-200">Field Intelligence</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={isCollapsed ? item.label : undefined} // Tooltip si replié
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active ? "bg-brand-600 text-white" : "text-brand-100 hover:bg-brand-900 hover:text-white",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button Container Bottom */}
      <div className="mt-auto border-t border-brand-900 bg-brand-950/50 p-2 flex flex-col gap-2">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center rounded-lg py-2 text-brand-300 hover:bg-brand-900 hover:text-white transition-colors"
          title={isCollapsed ? "Déplier la barre" : "Replier la barre"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <div className="flex items-center gap-2 text-xs"><ChevronLeft size={16} /> <span>Replier le menu</span></div>}
        </button>
        
        {!isCollapsed && (
          <div className="px-3 py-1 text-center text-[10px] text-brand-400 truncate">
            FIP · v0.1 · FC MARKETING
          </div>
        )}
      </div>
    </div>
  );
}