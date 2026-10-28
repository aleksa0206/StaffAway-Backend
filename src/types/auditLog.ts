export type AuditAction = 'UPDATE_COMPANY_NAME' | 'DELETE_COMPANY' | 'ROLE_CHANGE' | 'DELETE_USER';

export type AuditEntityType = 'Company' | 'User';

export interface NewAuditLogEntry {
  companyId: number;
  performedById: number;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: number;
  oldValue?: string;
  newValue?: string;
}
