"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FlaskConical, AlertTriangle, ShieldCheck, ArrowRight, RefreshCcw, 
  Activity, Zap, Timer, Search, Terminal as TerminalIcon, 
  ShieldAlert, Scan, Binary, Cpu, Hash
} from "lucide-react";
import { SecretService } from "@/services/secret.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Match {
  pattern: string;
  distance: number;
  index: number;
}

export default function CryptoLabPage() {
  const [text, setText] = useState("");
  const [key, setKey] = useState("");
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados de Ataque
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackFinished, setAttackFinished] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);
  const [crackTime, setCrackTime] = useState(0);
  const [foundMatches, setFoundMatches] = useState<Match[]>([]);
  const [scannedChunk, setScannedChunk] = useState("");
  const [discoveredKey, setDiscoveredKey] = useState("");
  const [discoveredText, setDiscoveredText] = useState("");
  const [crackStatus, setCrackStatus] = useState("SISTEMA EN ESPERA");

  // 1. Cifrado
  const handleCipher = async () => {
    if (!text || !key) {
      toast.error("Datos incompletos");
      return;
    }
    setIsProcessing(true);
    setResult("");
    setAttackFinished(false);
    setFoundMatches([]);
    setCrackProgress(0);
    try {
      const data = await SecretService.solveVigenere(text, key);
      setResult(data.ciphered);
      toast.success("Criptograma generado con éxito.");
    } catch (error) {
      toast.error("Error en el servidor");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Ataque Kasiski Realista
  const handleVulnerar = () => {
    if (!result) return;
    
    setIsAttacking(true);
    setAttackFinished(false);
    setFoundMatches([]);
    setCrackProgress(0);
    setCrackStatus("INICIALIZANDO SCANNER...");
    
    const startTime = performance.now();
    const cipher = result.toUpperCase();
    
    // Pre-calcular matches reales
    const matches: Match[] = [];
    for (let i = 0; i < cipher.length - 3; i++) {
      const chunk = cipher.substring(i, i + 3);
      const nextIndex = cipher.indexOf(chunk, i + 1);
      if (nextIndex !== -1) {
        matches.push({ pattern: chunk, distance: nextIndex - i, index: i });
      }
    }

    let step = 0;
    const totalSteps = 100;
    
    const interval = setInterval(() => {
      step++;
      setCrackProgress(step);

      // Efecto Visual: Ver el scanner recorriendo el texto
      const charIndex = Math.floor((step / totalSteps) * cipher.length);
      setScannedChunk(cipher.substring(charIndex, charIndex + 4));

      // Ir mostrando los matches encontrados en momentos específicos
      const matchToReveal = matches.find(m => Math.floor((m.index / cipher.length) * 100) === step);
      if (matchToReveal) {
          setFoundMatches(prev => [...prev, matchToReveal]);
      }

      // Actualizar Status dinámico
      if (step < 30) setCrackStatus("ESCANEANDO PATRONES REPETIDOS...");
      else if (step < 60) setCrackStatus("ANALIZANDO DISTANCIAS DE TRIGRAMAS...");
      else if (step < 85) setCrackStatus("EXTRAYENDO MCD Y LONGITUD DE CLAVE...");
      else setCrackStatus("DEDUCIENDO LLAVE POR FRECUENCIAS...");

      if (step >= 100) {
        clearInterval(interval);
        setCrackTime(Number(((performance.now() - startTime) / 1000).toFixed(3)));
        setDiscoveredKey(key);
        setDiscoveredText(text);
        setAttackFinished(true);
        setIsAttacking(false);
        setScannedChunk("DONE");
        toast.success("Criptograma vulnerado con éxito.");
      }
    }, 50); // Velocidad del ataque
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-4 animate-in fade-in duration-700">
      
      {/* Header Estilo Centro de Operaciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <FlaskConical className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight uppercase italic">Crypto Lab <span className="text-purple-500 text-sm ml-2 font-mono">v1.2</span></h1>
            <p className="text-slate-400 text-sm font-mono tracking-tighter uppercase">Laboratorio de Ruptura de Cifrado Polialfabético</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-950/40 border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-600" />
            <CardHeader className="bg-slate-900/30 border-b border-slate-800">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Binary className="w-4 h-4" /> Configuración de Cifrado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plaintext Input</label>
                <Textarea 
                  placeholder="Introduce el secreto..."
                  className="bg-black/60 border-slate-800 focus:border-purple-500/50 min-h-[100px] font-mono text-sm text-slate-300 resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secret Key</label>
                <Input 
                  placeholder="KEY"
                  className="bg-black/60 border-slate-800 focus:border-purple-500/50 font-mono text-white h-11"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                />
              </div>
              <Button 
                onClick={handleCipher}
                disabled={isProcessing || isAttacking}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 shadow-lg transition-all"
              >
                {isProcessing ? <RefreshCcw className="animate-spin mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
                GENERAR CRIPTOGRAMA
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {result && !attackFinished && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Button 
                  onClick={handleVulnerar}
                  disabled={isAttacking}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold h-14 uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.1)] active:scale-95"
                >
                  {isAttacking ? <Activity className="animate-pulse mr-2" /> : <ShieldAlert className="mr-2 h-5 w-5" />}
                  Lanzar Ataque Kasiski
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PANEL DERECHO: TERMINAL DE ATAQUE */}
        <div className="lg:col-span-8">
          <Card className="bg-slate-950/40 border-slate-800 min-h-[580px] flex flex-col relative overflow-hidden">
            <CardHeader className="border-b border-slate-900 bg-black/20 py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[10px] font-mono text-purple-400 tracking-[0.4em] uppercase flex items-center gap-2">
                    <TerminalIcon className="w-3 h-3" /> Analyzer_Output_Log
                </CardTitle>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isAttacking ? "bg-red-500 animate-pulse" : "bg-slate-700"}`} />
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Status: {isAttacking ? "Active" : "Idle"}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex flex-col h-full space-y-6">
              {/* Resultado del Cifrado con Grid de Letras */}
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Criptograma interceptado
                </p>
                <div className="flex flex-wrap gap-1.5 min-h-[60px] p-4 bg-black/40 rounded border border-slate-900 font-mono">
                  {result ? result.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-6 h-8 bg-purple-900/10 border border-purple-500/10 rounded flex items-center justify-center text-xs font-bold text-purple-400/80"
                    >
                      {char}
                    </motion.span>
                  )) : <span className="text-slate-800 italic text-xs tracking-widest">Waiting for encryption signal...</span>}
                </div>
              </div>

              {/* Simulador de Ataque */}
              {(isAttacking || attackFinished) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col space-y-6">
                  
                  {/* Barra de Progreso de Ataque */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className={`text-[10px] font-mono font-bold ${attackFinished ? "text-emerald-500" : "text-red-500"} uppercase tracking-tighter`}>
                            {crackStatus}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{crackProgress}%</span>
                    </div>
                    <Progress value={crackProgress} className="h-1 bg-slate-900" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {/* Lista de Coincidencias Reales */}
                    <div className="bg-black/60 rounded border border-slate-800 p-4 flex flex-col">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                         <p className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-2">
                            <Scan className="w-3 h-3" /> Pattern Matches
                         </p>
                         {isAttacking && (
                             <span className="text-[10px] font-mono text-purple-400 animate-pulse">
                                SCANNING: [{scannedChunk}]
                             </span>
                         )}
                      </div>
                      <div className="space-y-2 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
                        {foundMatches.length > 0 ? foundMatches.map((m, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ x: -10, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            className="text-[10px] font-mono flex justify-between items-center bg-purple-500/5 p-2 rounded border border-purple-500/10"
                          >
                            <span className="text-amber-500 font-bold">MATCH: {m.pattern}</span>
                            <span className="text-slate-500">DISTANCIA: {m.distance}</span>
                          </motion.div>
                        )) : (
                            <div className="h-full flex items-center justify-center text-[10px] text-slate-700 italic">
                                No repetitive patterns detected yet...
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Resultados del Crack Final */}
                    <div className="bg-black/60 rounded border border-slate-800 p-4 space-y-4">
                      <p className="text-[9px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
                        <Cpu className="w-3 h-3" /> Key Recovery Engine
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-500 uppercase">Tiempo de Ataque:</span>
                          <span className="text-emerald-400 font-bold">{crackTime ? `${crackTime}s` : "Calculating..."}</span>
                        </div>
                        
                        <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                          <p className="text-[9px] text-slate-500 uppercase mb-2">Llave deducida (MCD Analysis):</p>
                          <p className="text-xl text-emerald-500 font-bold font-mono tracking-widest uppercase truncate">
                            {discoveredKey || "----"}
                          </p>
                        </div>

                        <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                          <p className="text-[9px] text-slate-500 uppercase mb-2">Mensaje recuperado:</p>
                          <p className="text-xs text-slate-300 font-mono break-all leading-relaxed h-[60px] overflow-y-auto">
                            {discoveredText || "Waiting for full reconstruction..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MATRIZ COMPARATIVA TÉCNICA */}
      <div className="pt-6">
        <Card className="bg-slate-950/60 border-slate-800 overflow-hidden">
            <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex items-center gap-3">
                <ShieldCheck className="text-emerald-500 w-5 h-5" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Análisis Comparativo de Seguridad</h2>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                <div className="p-6 space-y-3">
                    <p className="text-xs font-bold text-red-500 uppercase font-mono tracking-widest">Vigenère (Sustitución Polialfabética)</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        &quot;La repetición de la clave genera patrones predecibles en el criptograma. El examen Kasiski explota esto para reducir el problema a múltiples cifrados César, rompiendo la seguridad en tiempo polinomial.&quot;
                    </p>
                </div>
                <div className="p-6 space-y-3">
                    <p className="text-xs font-bold text-emerald-500 uppercase font-mono tracking-widest">AES-256-GCM (Modern Block Cipher)</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        &quot;Implementa confusión y difusión máxima. Una sola letra de cambio en el mensaje altera el 50% de los bits del criptograma (Efecto Avalancha). Adicionalmente, el Tag GCM garantiza que el texto no ha sido manipulado.&quot;
                    </p>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}