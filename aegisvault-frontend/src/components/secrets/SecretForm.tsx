"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Save, FileText, KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SecretService } from "@/services/secret.service";

export function SecretForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    vaultPassword: "" // Vital para el cifrado Zero-Knowledge
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Llamada al servicio con la contraseña para el cifrado
      await SecretService.create(
        {
          name: formData.name,
          description: formData.description,
          content: formData.content
        },
        formData.vaultPassword
      );

      toast.success("Activo Digital Cifrado Exitosamente", {
        description: "El secreto ha sido protegido con AES-256 y guardado en tu bóveda."
      });
      
      router.push("/vault");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Error de Cifrado", {
        description: "Verifica que tu contraseña de bóveda sea correcta."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card border-slate-800/60 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl text-slate-100">Nuevo Activo Digital</CardTitle>
            <CardDescription>La información será cifrada antes de salir de este dispositivo.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          
          {/* Nombre y Descripción */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-400">Nombre del Secreto</Label>
              <Input 
                id="name" 
                placeholder="Ej. Servidor AWS Producción" 
                className="bg-slate-950/50 border-slate-800 focus:border-primary/50"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-slate-400">Categoría / Notas</Label>
              <Input 
                id="desc" 
                placeholder="Ej. Infraestructura Crítica" 
                className="bg-slate-950/50 border-slate-800 focus:border-primary/50"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Contenido Secreto */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Contenido a Cifrar
            </Label>
            <Textarea 
              id="content" 
              placeholder="Pega aquí tu clave privada, token o contraseña..." 
              className="min-h-[150px] font-mono text-sm bg-slate-950/50 border-slate-800 focus:border-primary/50 text-green-400"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          </div>

          {/* Zona de Seguridad (Confirmación de Identidad) */}
          <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Autorización de Cifrado</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaultPass" className="text-xs text-slate-400">
                Confirma tu contraseña para firmar la llave criptográfica
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                  id="vaultPass" 
                  type="password"
                  placeholder="Tu contraseña de inicio de sesión" 
                  className="pl-10 bg-black/40 border-slate-700 focus:border-amber-500/50"
                  value={formData.vaultPassword}
                  onChange={(e) => setFormData({...formData, vaultPassword: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-800/50 pt-6">
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => router.back()}
            className="hover:bg-slate-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary text-black hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            {isLoading ? "CIFRANDO Y GUARDANDO..." : <><Save className="w-4 h-4 mr-2" /> PROTEGER ACTIVO</>}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}