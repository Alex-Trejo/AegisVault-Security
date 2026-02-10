"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { username, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-2">
        {/* Aquí podría ir un breadcrumb o título dinámico en el futuro */}
        <h1 className="text-sm font-medium text-slate-400 font-mono hidden md:block">
          {`// ACCESS_LEVEL: `}<span className="text-primary">AUTHORIZED</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-slate-800">
              <UserCircle className="h-6 w-6 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-200" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{username || "Usuario"}</p>
                <p className="text-xs leading-none text-slate-400">@{username}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem 
                className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer"
                onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}