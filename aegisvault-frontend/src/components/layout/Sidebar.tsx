"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, FileText, FlaskConical, LogOut } from "lucide-react";
import { cn } from "@/lib/utils"; // Utilidad de Shadcn para clases condicionales

const menuItems = [
  {
    title: "Mi Bóveda",
    href: "/vault",
    icon: LayoutDashboard,
  },
  {
    title: "Auditoría",
    href: "/audit",
    icon: FileText,
  },
  {
    title: "Crypto Lab",
    href: "/lab",
    icon: FlaskConical,
    variant: "ghost"
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl md:flex h-screen fixed left-0 top-0 z-30">
      
      {/* Header del Sidebar */}
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Link href="/vault" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-slate-100">Aegis<span className="text-primary">Vault</span></span>
        </Link>
      </div>

      {/* Links de Navegación */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-100"
                )} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer del Sidebar con Info Técnica */}
      <div className="p-4 border-t border-slate-800 bg-black/20">
        <div className="rounded-md bg-slate-900/50 p-3 border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Estado del Sistema</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-500 font-medium">Cifrado Activo</span>
          </div>
        </div>
      </div>
    </aside>
  );
}