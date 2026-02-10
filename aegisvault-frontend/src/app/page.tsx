// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // En Next.js App Router, este componente se ejecuta en el servidor.
  // Por defecto, mandamos al usuario al portal de acceso.
  redirect("/login");
  
  // No es necesario retornar JSX porque la redirección ocurre antes de renderizar.
  return null;
}