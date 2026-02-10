// src/types/audit.ts
export interface AuditLog {
  id: string;
  action: 'USER_LOGIN' | 'CREATE_SECRET' | 'READ_SECRET' | 'UPDATE_SECRET' | 'DELETE_SECRET' | 'SHARE_SECRET';
  resource_id?: string;
  ip_address?: string;
  timestamp: string;
}