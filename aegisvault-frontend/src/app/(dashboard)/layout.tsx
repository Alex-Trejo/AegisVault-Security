"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Protección de Ruta (HCI: Seguridad)
  // Si no está autenticado, lo mandamos al login inmediatamente
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-primary font-mono">
        <div className="animate-pulse">CARGANDO ENTORNO SEGURO...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null; // Evita parpadeos mientras redirige

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex flex-col md:pl-64 transition-all duration-300">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}