// src/services/audit.service.ts
import api from '@/lib/api';
import { AuditLog } from '@/types/audit';

export const AuditService = {
  async getMyLogs(): Promise<AuditLog[]> {
    const { data } = await api.get<AuditLog[]>('/api/auth/audit');
    return data;
  }
};