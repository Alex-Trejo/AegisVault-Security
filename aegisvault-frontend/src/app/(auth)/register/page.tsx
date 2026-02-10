"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, User, Cpu, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (formData.password.length < 8) {
      setError("La clave debe tener al menos 8 caracteres.");
      return;
    }

    try {
      await register(formData.username, formData.password);
    } catch {
      
      setError("Error al registrar. El usuario podría ya existir.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      {/* Fondo con rejilla tecnológica (Consistencia con Login) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] z-10"
      >
        <Card className="bg-slate-950/80 border-slate-800 backdrop-blur-md shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)]">
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-14 h-14 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <ShieldCheck className="text-blue-400 w-7 h-7" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white uppercase">
              Nueva <span className="text-blue-400">Identidad</span>
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium mt-2">
              GENERACIÓN DE LLAVES RSA-2048
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}

              <div className="space-y-4">
                {/* Usuario */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Nombre de Usuario</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      name="username"
                      placeholder="Identificador único"
                      className="pl-10 bg-slate-900/50 border-slate-700 focus:border-blue-500/50 text-white h-11 transition-all"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Contraseña Maestra</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-900/50 border-slate-700 focus:border-blue-500/50 text-white h-11 transition-all"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Confirmar Clave</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-900/50 border-slate-700 focus:border-blue-500/50 text-white h-11 transition-all"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Advertencia de Seguridad (HCI: Importancia Visual) */}
              <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
                <p className="text-[10px] leading-relaxed text-slate-400">
                  <span className="text-blue-400 font-bold uppercase mr-1">Aviso:</span> 
                  Esta contraseña cifra tu llave privada localmente. Si se pierde, los datos en la bóveda serán irrecuperables.
                </p>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 mt-2 transition-all shadow-lg shadow-blue-900/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 italic">
                    <Cpu className="h-4 w-4 animate-spin" /> PROCESANDO LLAVES...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    CREAR MI BÓVEDA <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex justify-center border-t border-slate-900 mt-4 py-6">
            <p className="text-sm text-slate-500">
              ¿Ya eres miembro?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}