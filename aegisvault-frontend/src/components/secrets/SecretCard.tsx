"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Lock, FileKey, Calendar, ArrowUpRight } from "lucide-react";
import { Secret } from "@/types/secret";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SecretCardProps {
  secret: Secret;
  currentUserId?: string | null;
}

export function SecretCard({ secret, currentUserId }: SecretCardProps) {
  const isOwner = currentUserId === secret.owner_id;

  return (
    <Link href={`/secrets/${secret.id}`}>
      <Card className="glass-card h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] group cursor-pointer border-slate-800/60 bg-slate-900/40">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200 truncate pr-4">
            {secret.name}
          </CardTitle>
          {isOwner ? (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase">
              Propietario
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] uppercase">
              Compartido
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-slate-500 mb-4">
            {isOwner ? <Lock className="h-8 w-8 text-slate-600" /> : <FileKey className="h-8 w-8 text-blue-500/50" />}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5em]">
            {secret.description || "Sin descripción disponible."}
          </p>
        </CardContent>
        <CardFooter className="text-[10px] text-slate-500 border-t border-slate-800/50 pt-3 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(secret.created_at), "d MMM, yyyy", { locale: es })}
          </div>
          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
        </CardFooter>
      </Card>
    </Link>
  );
}