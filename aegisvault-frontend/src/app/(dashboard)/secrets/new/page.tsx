// src/app/(dashboard)/secrets/new/page.tsx
import { SecretForm } from "@/components/secrets/SecretForm";

export default function NewSecretPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Proteger Nuevo Activo</h1>
        <p className="text-slate-400">
          El protocolo de seguridad encriptará la información localmente antes de enviarla.
        </p>
      </div>
      
      <SecretForm />
    </div>
  );
}