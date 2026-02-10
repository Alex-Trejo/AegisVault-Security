"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SecretService } from "@/services/secret.service";
import { Secret } from "@/types/secret";
import { SecretCard } from "@/components/secrets/SecretCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VaultPage() {
  const { userId } = useAuth(); // Necesitamos el ID del usuario, pero el hook actual devuelve username. 
  // NOTA: Para saber si soy Owner, idealmente el token JWT trae el ID. 
  // Por ahora, el backend lo maneja. El frontend solo mostrará badges basado en lógica simple.
  
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    try {
      const data = await SecretService.getAll();
      setSecrets(data);
    } catch (error) {
      console.error("Error cargando bóveda:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado en tiempo real (UX: Búsqueda instantánea)
  const filteredSecrets = secrets.filter(secret => 
    secret.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    secret.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header de la Página */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Mi Bóveda</h2>
          <p className="text-slate-400 text-sm mt-1">
            Gestiona y protege tus activos digitales con cifrado AES-256.
          </p>
        </div>
        <Link href="/secrets/new">
            <Button className="bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Secreto
            </Button>
        </Link>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <Input 
          placeholder="Buscar secretos cifrados..." 
          className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary/50 text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Contenido */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredSecrets.length > 0 ? (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSecrets.map((secret) => (
            <SecretCard 
                key={secret.id} 
                secret={secret}
                currentUserId={userId}
                />
          ))}
        </motion.div>
      ) : (
        /* Estado Vacío (Empty State) */
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <div className="p-4 bg-slate-900 rounded-full mb-4">
            <ShieldAlert className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-300">Bóveda Vacía</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm mt-2 mb-6">
            No tienes activos protegidos actualmente. Crea uno nuevo para comenzar a asegurar tu información.
          </p>
          <Link href="/secrets/new">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                Crear primer secreto
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}