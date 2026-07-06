"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { landingPath, useAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const user = useAuth((s) => s.user);

  useEffect(() => {
    router.replace(user ? landingPath(user.role) : "/login");
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-400">
      Chargement…
    </div>
  );
}
