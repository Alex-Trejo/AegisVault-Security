"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CryptoVisualizerProps {
  text: string;
  className?: string;
}

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export function CryptoVisualizer({ text, className }: CryptoVisualizerProps) {
  const [displayText, setDisplayText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [iteration, setIteration] = useState(0);

  // Efecto "Matrix/Scramble"
  useEffect(() => {
    //let interval: NodeJS.Timeout;
    
    // Si no hay texto, no hacemos nada
    if (!text) return;

    const interval = setInterval(() => {
      setDisplayText((prev) => 
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          })
          .join("")
      );

      setIteration((prev) => prev + 1 / 3); // Velocidad de descifrado

      if (iteration >= text.length) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text, iteration]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono text-sm md:text-base break-all bg-black/60 p-6 rounded-lg border border-primary/30 text-primary shadow-[0_0_15px_rgba(34,197,94,0.1)] min-h-[100px] flex items-center"
      >
        {displayText || <span className="animate-pulse">_</span>}
      </motion.div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          className="h-8 w-8 text-primary hover:bg-primary/20 hover:text-primary"
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}