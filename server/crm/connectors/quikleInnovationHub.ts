/**
 * Quikle Innovation Hub CRM Connector
 * Native integration with Quikle's own CRM/Project Management platform
 * Priority 1 - Deepest integration with platform features
 */

import type {
  CRMConnector,
  CRMIntegrationConfig,
  CRMContact,
  CRMLead,
  CRMDeal,
  CRMTask,
  CRMActivity,
  CRMSyncResult,
  CRMEntityType,
} from '../types';

export class QuikleInnovationHubConnector implements CRMConnector {
  provider = 'quikle-innovation-hub' as const;
  private config: CRMIntegrationConfig | null = null;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // Use environment variables or config
    this.baseUrl = process.env.QUIKLE_HUB_API_URL || 'https://api.quiklehub.com';
    this.apiKey = process.env.QUIKLE_HUB_API_KEY || '';
  }

  /**
   * Authenticate with Quikle Innovation Hub
   * Uses OAuth 2.0 or API key authentication
   */
  async authenticate(config: CRMIntegrationConfig): Promise<boolean> {
    this.config = config;
    
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey || this.apiKey}`,
        },
      });

      if (!response.ok) {
        console.error('[Quikle Hub] Authentication failed:', response.statusText);
        return false;
      }

      const data = await response.json();
      console.log('[Quikle Hub] Authentication successful:', data);
      return true;
    } catch (error) {
      console.error('[Quikle Hub] Authentication error:', error);
      return false;
    }
  }

  /**
   * Get contacts from Quikle Innovation Hub
   */
  async getContacts(limit = 100, offset = 0): Promise<CRMContact[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/contacts?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapToContacts(data.contacts || []);
    } catch (error) {
      console.error('[Quikle Hub] Error fetching contacts:', error);
      return [];
    }
  }

  async getContact(id: string): Promise<CRMContact | null> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return this.mapToContact(data);
    } catch (error) {
      console.error('[Quikle Hub] Error fetching contact:', error);
      return null;
    }
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMContact> {
    const response = await fetch(`${this.baseUrl}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(this.mapFromContact(contact)),
    });

    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToContact(data);
  }

  async updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    const response = await fetch(`${this.baseUrl}/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(this.mapFromContact(contact)),
    });

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToContact(data);
  }

  async deleteContact(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
      },
    });

    return response.ok;
  }

  /**
   * Get leads (opportunities in Quikle Hub)
   */
  async getLeads(limit = 100, offset = 0): Promise<CRMLead[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/opportunities?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapToLeads(data.opportunities || []);
    } catch (error) {
      console.error('[Quikle Hub] Error fetching leads:', error);
      return [];
    }
  }

  async createLead(lead: Partial<CRMLead>): Promise<CRMLead> {
    const response = await fetch(`${this.baseUrl}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(this.mapFromLead(lead)),
    });

    if (!response.ok) {
      throw new Error(`Failed to create lead: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToLead(data);
  }

  async updateLead(id: string, lead: Partial<CRMLead>): Promise<CRMLead> {
    const response = await fetch(`${this.baseUrl}/opportunities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(this.mapFromLead(lead)),
    });

    if (!response.ok) {
      throw new Error(`Failed to update lead: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToLead(data);
  }

  /**
   * Get deals (projects in Quikle Hub)
   */
  async getDeals(limit = 100, offset = 0): Promise<CRMDeal[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/projects?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch deals: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapToDeals(data.projects || []);
    } catch (error) {
      console.error('[Quikle Hub] Error fetching deals:', error);
      return [];
    }
  }

  async createDeal(deal: Partial<CRMDeal>): Promise<CRMDeal> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(this.mapFromDeal(deal)),
    });

    if (!response.ok) {
      throw new Error(`Failed to create deal: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToDeal(data);
  }

  async updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMDeal> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(this.mapFromDeal(deal)),
    });

    if (!response.ok) {
      throw new Error(`Failed to update deal: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToDeal(data);
  }

  /**
   * Log activity (call, meeting, note) to Quikle Hub
   */
  async logActivity(activity: Partial<CRMActivity>): Promise<CRMActivity> {
    const response = await fetch(`${this.baseUrl}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify({
        type: activity.type,
        contact_id: activity.contactId,
        project_id: activity.dealId,
        subject: activity.subject,
        description: activity.description,
        duration_seconds: activity.duration,
        outcome: activity.outcome,
        recording_url: activity.recordingUrl,
        transcript: activity.transcript,
        created_at: activity.createdAt || new Date(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToActivity(data);
  }

  /**
   * Sync data from Quikle Hub to platform
   */
  async syncToQuikle(entityType: CRMEntityType): Promise<CRMSyncResult> {
    const startTime = new Date();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    try {
      // Implementation would sync data from Quikle Hub to local database
      // This is a placeholder for the actual sync logic
      
      return {
        success: true,
        provider: this.provider,
        entityType,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        recordsFailed,
        errors: errors.length > 0 ? errors : undefined,
        syncedAt: startTime,
      };
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        entityType,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        recordsFailed,
        errors: [String(error)],
        syncedAt: startTime,
      };
    }
  }

  /**
   * Sync data from platform to Quikle Hub
   */
  async syncFromQuikle(entityType: CRMEntityType, data: any[]): Promise<CRMSyncResult> {
    const startTime = new Date();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    // Implementation would push data to Quikle Hub
    // This is a placeholder for the actual sync logic

    return {
      success: true,
      provider: this.provider,
      entityType,
      recordsProcessed,
      recordsCreated,
      recordsUpdated,
      recordsFailed,
      errors: errors.length > 0 ? errors : undefined,
      syncedAt: startTime,
    };
  }

  // Helper mapping functions
  private mapToContacts(data: any[]): CRMContact[] {
    return data.map(this.mapToContact);
  }

  private mapToContact(data: any): CRMContact {
    return {
      id: data.id,
      externalId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      company: data.company_name,
      jobTitle: data.job_title,
      tags: data.tags || [],
      customFields: data.custom_fields || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastContactedAt: data.last_contacted_at ? new Date(data.last_contacted_at) : undefined,
    };
  }

  private mapFromContact(contact: Partial<CRMContact>): any {
    return {
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company_name: contact.company,
      job_title: contact.jobTitle,
      tags: contact.tags,
      custom_fields: contact.customFields,
    };
  }

  private mapToLeads(data: any[]): CRMLead[] {
    return data.map(this.mapToLead);
  }

  private mapToLead(data: any): CRMLead {
    return {
      id: data.id,
      externalId: data.id,
      contactId: data.contact_id,
      title: data.title,
      description: data.description,
      value: data.value,
      currency: data.currency || 'ZAR',
      status: data.status,
      source: data.source,
      assignedTo: data.assigned_to,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapFromLead(lead: Partial<CRMLead>): any {
    return {
      contact_id: lead.contactId,
      title: lead.title,
      description: lead.description,
      value: lead.value,
      currency: lead.currency,
      status: lead.status,
      source: lead.source,
      assigned_to: lead.assignedTo,
    };
  }

  private mapToDeals(data: any[]): CRMDeal[] {
    return data.map(this.mapToDeal);
  }

  private mapToDeal(data: any): CRMDeal {
    return {
      id: data.id,
      externalId: data.id,
      contactId: data.contact_id,
      companyId: data.company_id,
      title: data.name,
      value: data.value,
      currency: data.currency || 'ZAR',
      stage: data.stage,
      probability: data.probability,
      expectedCloseDate: data.expected_close_date ? new Date(data.expected_close_date) : undefined,
      actualCloseDate: data.actual_close_date ? new Date(data.actual_close_date) : undefined,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapFromDeal(deal: Partial<CRMDeal>): any {
    return {
      contact_id: deal.contactId,
      company_id: deal.companyId,
      name: deal.title,
      value: deal.value,
      currency: deal.currency,
      stage: deal.stage,
      probability: deal.probability,
      expected_close_date: deal.expectedCloseDate,
      actual_close_date: deal.actualCloseDate,
      status: deal.status,
    };
  }

  private mapToActivity(data: any): CRMActivity {
    return {
      id: data.id,
      externalId: data.id,
      type: data.type,
      contactId: data.contact_id,
      dealId: data.project_id,
      subject: data.subject,
      description: data.description,
      duration: data.duration_seconds,
      outcome: data.outcome,
      recordingUrl: data.recording_url,
      transcript: data.transcript,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
    };
  }
}

