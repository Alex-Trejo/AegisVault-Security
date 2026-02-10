export interface Secret {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  // 'content' no viene en la lista general por seguridad, solo en el detalle
}

export interface SecretDetail extends Secret {
  content: string; // Aquí sí viene el texto descifrado
}

export interface CreateSecretParams {
  name: string;
  description: string;
  content: string;
}