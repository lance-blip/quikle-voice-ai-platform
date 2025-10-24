/**
 * CRM Integration Types
 * Unified interface for all CRM connectors including Quikle Innovation Hub
 */

export type CRMProvider = 
  | 'quikle-innovation-hub'  // Native Quikle CRM (Priority 1)
  | 'hubspot' 
  | 'salesforce' 
  | 'pipedrive'
  | 'zoho'
  | 'monday';

export type CRMSyncDirection = 'one-way' | 'bi-directional';
export type CRMEntityType = 'contact' | 'lead' | 'deal' | 'company' | 'task' | 'project' | 'note';

/**
 * Unified Contact Model
 * Maps to all CRM systems
 */
export interface CRMContact {
  id: string;
  externalId?: string; // ID in the external CRM
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
}

/**
 * Unified Lead Model
 */
export interface CRMLead {
  id: string;
  externalId?: string;
  contactId?: string;
  title: string;
  description?: string;
  value?: number;
  currency?: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  source?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Unified Deal/Opportunity Model
 */
export interface CRMDeal {
  id: string;
  externalId?: string;
  contactId?: string;
  companyId?: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  status: 'open' | 'won' | 'lost';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Unified Company Model
 */
export interface CRMCompany {
  id: string;
  externalId?: string;
  name: string;
  domain?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  phone?: string;
  address?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Unified Task/Project Model (for Quikle Innovation Hub)
 */
export interface CRMTask {
  id: string;
  externalId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Activity Log (Call/Email/Meeting)
 */
export interface CRMActivity {
  id: string;
  externalId?: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  contactId?: string;
  dealId?: string;
  subject: string;
  description?: string;
  duration?: number; // in seconds
  outcome?: string;
  recordingUrl?: string;
  transcript?: string;
  createdAt: Date;
  createdBy?: string;
}

/**
 * CRM Integration Configuration
 */
export interface CRMIntegrationConfig {
  id: number;
  agencyId: number;
  provider: CRMProvider;
  isActive: boolean;
  syncDirection: CRMSyncDirection;
  syncEntities: CRMEntityType[];
  apiKey?: string;
  apiSecret?: string;
  instanceUrl?: string;
  webhookUrl?: string;
  customSettings?: Record<string, any>;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CRM Sync Result
 */
export interface CRMSyncResult {
  success: boolean;
  provider: CRMProvider;
  entityType: CRMEntityType;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors?: string[];
  syncedAt: Date;
}

/**
 * CRM Connector Interface
 * All CRM providers must implement this interface
 */
export interface CRMConnector {
  provider: CRMProvider;
  
  // Authentication
  authenticate(config: CRMIntegrationConfig): Promise<boolean>;
  
  // Contact Operations
  getContacts(limit?: number, offset?: number): Promise<CRMContact[]>;
  getContact(id: string): Promise<CRMContact | null>;
  createContact(contact: Partial<CRMContact>): Promise<CRMContact>;
  updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMContact>;
  deleteContact(id: string): Promise<boolean>;
  
  // Lead Operations
  getLeads(limit?: number, offset?: number): Promise<CRMLead[]>;
  createLead(lead: Partial<CRMLead>): Promise<CRMLead>;
  updateLead(id: string, lead: Partial<CRMLead>): Promise<CRMLead>;
  
  // Deal Operations
  getDeals(limit?: number, offset?: number): Promise<CRMDeal[]>;
  createDeal(deal: Partial<CRMDeal>): Promise<CRMDeal>;
  updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMDeal>;
  
  // Activity Logging
  logActivity(activity: Partial<CRMActivity>): Promise<CRMActivity>;
  
  // Sync Operations
  syncToQuikle(entityType: CRMEntityType): Promise<CRMSyncResult>;
  syncFromQuikle(entityType: CRMEntityType, data: any[]): Promise<CRMSyncResult>;
}

/**
 * Webhook Event from CRM
 */
export interface CRMWebhookEvent {
  provider: CRMProvider;
  eventType: 'contact.created' | 'contact.updated' | 'contact.deleted' | 
             'deal.created' | 'deal.updated' | 'deal.won' | 'deal.lost' |
             'task.created' | 'task.completed';
  entityType: CRMEntityType;
  entityId: string;
  data: any;
  timestamp: Date;
}

