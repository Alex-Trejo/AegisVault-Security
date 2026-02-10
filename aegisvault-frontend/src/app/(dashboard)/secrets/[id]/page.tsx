// src/app/(dashboard)/secrets/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ArrowLeft, ShieldCheck, Clock, User, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Hooks y Servicios
import { SecretService } from "@/services/secret.service";
import { SecretDetail } from "@/types/secret";
import { useAuth } from "@/hooks/useAuth";


// Componentes
import { CryptoVisualizer } from "@/components/crypto/CryptoVisualizer";
import { ShareModal } from "@/components/secrets/ShareModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SecretDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { userId } = useAuth();
    const secretId = params.id as string;

  // Estados
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [secretData, setSecretData] = useState<SecretDetail | null>(null);

  // Lógica de propiedad (dueño del secreto)
  const isOwner = userId === secretData?.owner_id;

  // Acción: Desbloquear (Llama al Backend)
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aquí ocurre la magia: El backend verifica la pass, descifra RSA -> AES -> Texto
      const data = await SecretService.getById(secretId, password);
      setSecretData(data);
      setIsUnlocked(true);
      toast.success("Acceso concedido", { description: "Llave privada descifrada correctamente." });
    } catch (error) {
      toast.error("Acceso denegado", { description: "Contraseña de bóveda incorrecta." });
      setPassword(""); // Limpiar por seguridad
    } finally {
      setIsLoading(false);
    }
  };

  // Acción: Eliminar Secreto
  const handleDelete = async () => {
    if(!confirm("¿Estás seguro? Esta acción es irreversible.")) return;
    try {
        await SecretService.delete(secretId);
        toast.success("Activo eliminado correctamente");
        router.push('/vault');
    } catch (error) {
        toast.error("Error al eliminar");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-6 text-slate-400 hover:text-white pl-0 hover:bg-transparent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Bóveda
      </Button>

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          /* --- ESTADO BLOQUEADO --- */
          <motion.div
            key="locked"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card max-w-md mx-auto border-slate-800 text-center py-10 px-6">
              <div className="mx-auto w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <Lock className="w-10 h-10 text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Activo Protegido</h2>
              <p className="text-slate-400 text-sm mb-8">
                Este contenido está cifrado con AES-256-GCM. <br/>
                Ingresa tu llave maestra para descifrarlo en tiempo real.
              </p>

              <form onSubmit={handleUnlock} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Contraseña de Bóveda"
                  className="bg-black/50 border-slate-700 text-center text-lg tracking-widest focus:border-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <Button 
                    type="submit" 
                    className="w-full bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    disabled={isLoading || !password}
                >
                    {isLoading ? "DESCIFRANDO..." : "DESBLOQUEAR CONTENIDO"}
                </Button>
              </form>
            </Card>
          </motion.div>
        ) : (
          /* --- ESTADO DESBLOQUEADO --- */
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Cabecera con Metadata */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">{secretData?.name}</h1>
                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-mono">
                            <Unlock className="w-3 h-3 mr-1" /> DECRYPTED
                        </Badge>
                    </div>
                    <p className="text-slate-400 max-w-xl">{secretData?.description || "Sin descripción"}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2 text-xs text-slate-500 font-mono">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {secretData?.created_at && new Date(secretData.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" /> 
                        OWNER_ID: {secretData?.owner_id.slice(0, 8)}...
                    </div>
                </div>
            </div>

            {/* Visualizador del Secreto */}
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">
                    Contenido Descifrado
                </label>
                <CryptoVisualizer text={secretData?.content || ""} />
            </div>

            {/* Zona de Acciones (HCI: Separación clara de controles) */}
            <div className="pt-10 flex justify-between items-center border-t border-slate-800/50">
                <div className="flex items-center gap-3">
                    {/* Solo el dueño puede compartir el acceso criptográfico */}
                    {isOwner && <ShareModal secretId={secretId} />}
                    
                    <div className="hidden md:flex items-center gap-2 text-xs text-green-500/80 bg-green-900/10 px-3 py-1 rounded-full border border-green-900/30">
                        <ShieldCheck className="w-3 h-3" />
                        Integridad Verificada (GCM Tag OK)
                    </div>
                </div>
                
                {/* Solo el dueño puede eliminar permanentemente el activo */}
                {isOwner && (
                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDelete}
                        className="bg-red-950/30 text-red-500 hover:bg-red-900/50 border border-red-900/50"
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Activo
                    </Button>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}