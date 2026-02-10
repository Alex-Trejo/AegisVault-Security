// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion"; // Animaciones suaves
import { Shield, Lock, User, Loader2, ArrowRight,AlertCircle  } from "lucide-react"; // Iconos
import { useAuth } from "@/hooks/useAuth"; // Nuestro Hook de lógica
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  // Conectamos con el Hook que creamos antes
  const { login, isLoading } = useAuth();
  
  // Estados locales del formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica (Prevención de errores HCI)
    if (!username || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      await login(username, password);
      // La redirección a /vault la maneja el hook useAuth
    } catch (err: unknown) {
      // Feedback de error claro
      console.error(err);
      setError("Credenciales inválidas. Verifica tu usuario y contraseña.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      {/* Fondo con sutil rejilla tecnológica */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] z-10"
      >
        <Card className="bg-slate-950/80 border-slate-800 backdrop-blur-md shadow-[0_0_50px_-12px_rgba(34,197,94,0.2)]">
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-14 h-14 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <Shield className="text-emerald-500 w-7 h-7" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              AEGIS<span className="text-emerald-500">VAULT</span>
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium mt-2">
              SISTEMA DE GESTIÓN DE SECRETOS
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Identidad</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Nombre de usuario"
                      className="pl-10 bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 text-white h-11 transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Credencial Maestra</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 text-white h-11 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 mt-2 transition-all shadow-lg shadow-emerald-900/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    DESBLOQUEAR BÓVEDA <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex justify-center border-t border-slate-900 mt-4 py-6">
            <p className="text-sm text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
                Regístrate ahora
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <p className="text-center text-[10px] text-slate-600 mt-8 font-mono tracking-widest uppercase">
          AES-256-GCM Secured • End-to-End Encrypted
        </p>
      </motion.div>
    </div>
  );
}