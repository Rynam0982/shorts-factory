"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Key, Settings, Share2,
  Users, Briefcase, ArrowLeftRight, BarChart3, FlaskConical, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin",              label: "Vue d'ensemble",    icon: LayoutDashboard },
  { href: "/admin/api-keys",     label: "Clés API",          icon: Key },
  { href: "/admin/pipeline",     label: "Pipeline / Pricing", icon: Settings },
  { href: "/admin/platforms",    label: "Plateformes OAuth", icon: Share2 },
  { href: "/admin/users",        label: "Utilisateurs",      icon: Users },
  { href: "/admin/jobs",         label: "Tous les jobs",     icon: Briefcase },
  { href: "/admin/transactions", label: "Transactions",      icon: ArrowLeftRight },
  { href: "/admin/analytics",    label: "Analytics",         icon: BarChart3 },
  { href: "/admin/test-create",  label: "Créer (test)",      icon: FlaskConical },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "var(--sidebar-w)",
      background: "var(--panel-solid)",
      borderRight: "1px solid var(--line)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo + badge admin */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "oklch(0.78 0.15 75 / 0.2)",
            border: "1px solid oklch(0.78 0.15 75 / 0.4)",
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 16 }}>⚙️</span>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--tx-0)" }}>
              Admin Panel
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "oklch(0.78 0.15 75)" }}>
              Shorts Factory v2
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {adminNavItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10,
                fontSize: 13, fontWeight: 600,
                color: active ? "oklch(0.78 0.15 75)" : "var(--tx-2)",
                background: active ? "oklch(0.78 0.15 75 / 0.13)" : "transparent",
                border: `1px solid ${active ? "oklch(0.78 0.15 75 / 0.3)" : "transparent"}`,
                transition: "all .14s", textDecoration: "none",
              }}
              className={cn(!active && "hover:bg-[var(--bg-2)]")}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "10px", borderTop: "1px solid var(--line)" }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            color: "var(--tx-3)", textDecoration: "none",
            transition: "all .14s",
          }}
          className="hover:bg-[var(--bg-2)] hover:text-[var(--tx-1)]"
        >
          <ArrowLeft size={15} style={{ flexShrink: 0 }} />
          Retour app
        </Link>
      </div>
    </aside>
  );
}
