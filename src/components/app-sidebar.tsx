"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Plus, Film, Clock,
  CreditCard, Receipt, User, ShieldCheck, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",              label: "Dashboard",          icon: LayoutDashboard },
  { href: "/create",                 label: "Créer un short",     icon: Plus },
  { href: "/series",                 label: "Séries AUTO",        icon: Film },
  { href: "/jobs",                   label: "Historique",         icon: Clock },
  { href: "/credits",                label: "Crédits",            icon: CreditCard },
  { href: "/billing",                label: "Abonnement",         icon: Receipt },
  { href: "/settings/connections",   label: "Comptes connectés",  icon: Link2 },
  { href: "/profile",                label: "Profil",             icon: User },
];

export default function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
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
      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, position: "relative",
            background: "linear-gradient(150deg, var(--accent-bright), var(--accent-deep))",
            display: "grid", placeItems: "center", flexShrink: 0,
            boxShadow: "0 4px 16px oklch(0.66 0.21 var(--accent-h) / 0.5)",
          }}>
            <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "14px" }}>
              <span style={{ width: "4px", height: "55%",  background: "#fff", borderRadius: 2, opacity: 0.95 }} />
              <span style={{ width: "4px", height: "100%", background: "#fff", borderRadius: 2 }} />
              <span style={{ width: "4px", height: "72%",  background: "#fff", borderRadius: 2, opacity: 0.9 }} />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--tx-0)", letterSpacing: "-0.02em" }}>
              Shorts<span style={{ color: "var(--accent-bright)" }}>Factory</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)" }}>v2</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: active ? "var(--tx-0)" : "var(--tx-2)",
                background: active ? "var(--accent-soft)" : "transparent",
                border: `1px solid ${active ? "var(--accent-line)" : "transparent"}`,
                transition: "all .14s",
                textDecoration: "none",
              }}
              className={cn(!active && "hover:bg-[var(--bg-2)]")}
            >
              <Icon size={15} style={{ color: active ? "var(--accent-bright)" : "var(--tx-3)", flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Admin link */}
      {isAdmin && (
        <div style={{ padding: "10px", borderTop: "1px solid var(--line)" }}>
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: pathname.startsWith("/admin") ? "oklch(0.78 0.15 75)" : "var(--tx-3)",
              background: pathname.startsWith("/admin") ? "oklch(0.78 0.15 75 / 0.13)" : "transparent",
              border: `1px solid ${pathname.startsWith("/admin") ? "oklch(0.78 0.15 75 / 0.3)" : "transparent"}`,
              transition: "all .14s",
              textDecoration: "none",
            }}
          >
            <ShieldCheck size={15} style={{ flexShrink: 0 }} />
            Dashboard Admin
          </Link>
        </div>
      )}
    </aside>
  );
}
