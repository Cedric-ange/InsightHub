"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav";
import { canAccess, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const items = NAV_ITEMS.filter((i) => canAccess(user?.role, i.area));

  return (
    <div className="flex h-full flex-col bg-brand-950 text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 font-bold">
          IH
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold">InsightHub</div>
          <div className="text-[11px] text-brand-200">Field Intelligence</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-600 text-white"
                  : "text-brand-100 hover:bg-brand-900 hover:text-white",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[11px] text-brand-300">
        FIP · v0.1 · FC MARKETING
      </div>
    </div>
  );
}
