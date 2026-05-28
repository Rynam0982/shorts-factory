"use client";

import { UserButton } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminHeader() {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-amber-400" />
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
          MODE ADMIN
        </Badge>
      </div>
      <UserButton />
    </header>
  );
}
