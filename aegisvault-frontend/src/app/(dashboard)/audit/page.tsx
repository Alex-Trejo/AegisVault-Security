"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Terminal, Clock, Fingerprint } from "lucide-react";
import { AuditService } from "@/services/audit.service";
import { AuditLog } from "@/types/audit";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const actionStyles: Record<string, { label: string; color: string }> = {
  USER_LOGIN: { label: "Inicio de Sesión", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  CREATE_SECRET: { label: "Creación", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  READ_SECRET: { label: "Acceso / Lectura", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  SHARE_SECRET: { label: "Compartición RSA", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  DELETE_SECRET: { label: "Eliminación", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await AuditService.getMyLogs();
        setLogs(data);
      } catch (e) {
        console.error("Error cargando auditoría");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <Terminal className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Registros de Auditoría</h1>
          <p className="text-slate-400 text-sm font-mono uppercase tracking-tighter">Event_Log_System // Inmutable</p>
        </div>
      </div>

      {/* Tabla de Auditoría */}
      <div className="glass-card rounded-xl border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4">Evento / Acción</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4 hidden md:table-cell">Recurso ID</th>
              <th className="px-6 py-4">IP Origen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="h-12 bg-slate-900/20"></td>
                </tr>
              ))
            ) : logs.length > 0 ? (
              logs.map((log, index) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={log.id} 
                  className="hover:bg-slate-900/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={actionStyles[log.action]?.color || ""}>
                      {actionStyles[log.action]?.label || log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-500 font-mono hidden md:table-cell">
                    {log.resource_id ? (
                        <span className="flex items-center gap-1">
                            <Fingerprint className="w-3 h-3" /> {log.resource_id.slice(0, 12)}...
                        </span>
                    ) : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {log.ip_address || "127.0.0.1"}
                  </td>
                </motion.tr>
              ))
            ) : (
                <tr>
                    <td colSpan={4} className="text-center py-20 text-slate-600 italic">
                        No se registran eventos en el sistema.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* HCI: Nota de Integridad */}
      <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono justify-center">
        <ShieldCheck className="w-3 h-3 text-green-900" />
        SISTEMA DE AUDITORÍA PROTEGIDO CONTRA MANIPULACIÓN
      </div>
    </div>
  );
}