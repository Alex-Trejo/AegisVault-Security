"use client";

import { useState, useEffect } from "react"; // Agregamos useEffect
import { UserPlus, KeyRound, ShieldCheck, Loader2, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { SecretService } from "@/services/secret.service";
import { AuthService } from "@/services/auth.service"; // Importamos AuthService
import { User } from "@/types/auth"; // Importamos el tipo User
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShareModalProps {
  secretId: string;
}

export function ShareModal({ secretId }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]); // Lista de usuarios
  const [recipient, setRecipient] = useState("");
  const [password, setPassword] = useState("");

  // Cargar usuarios cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const users = await AuthService.getAllUsers();
          setAvailableUsers(users);
        } catch (error) {
          console.error("Error cargando usuarios disponibles");
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await SecretService.share(secretId, recipient, password);
      toast.success("Acceso compartido exitosamente");
      setIsOpen(false);
      setRecipient("");
      setPassword("");
    } catch (error: unknown) {
      const errorDetail =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error("Error al compartir", {
        description: errorDetail || "Verifica los datos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          <UserPlus className="w-4 h-4 mr-2" /> Compartir Acceso
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-slate-800 bg-slate-950/95 sm:max-w-[425px] text-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Users className="text-primary w-5 h-5" /> Compartir Secreto
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Selecciona un usuario activo para otorgarle acceso mediante re-cifrado RSA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-xs uppercase font-bold text-slate-500">
              Usuario Destinatario
            </Label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                id="recipient"
                list="active-users" // Conectamos con el datalist de abajo
                placeholder="Escribe o selecciona un usuario..."
                className="pl-10 bg-black/40 border-slate-800 focus:border-primary/50 text-white"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
              <datalist id="active-users">
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.username} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-pass" className="text-xs uppercase font-bold text-amber-500">
              Autorización del Propietario
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                id="auth-pass"
                type="password"
                placeholder="Tu contraseña de bóveda"
                className="pl-10 bg-black/40 border-slate-800 focus:border-amber-500/50 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary text-black font-bold hover:bg-emerald-400"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "CONCEDER ACCESO"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}