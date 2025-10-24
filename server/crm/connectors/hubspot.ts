/**
 * HubSpot CRM Connector
 * Integration with HubSpot CRM API v3
 */

import type {
  CRMConnector,
  CRMIntegrationConfig,
  CRMContact,
  CRMLead,
  CRMDeal,
  CRMActivity,
  CRMSyncResult,
  CRMEntityType,
} from '../types';

export class HubSpotConnector implements CRMConnector {
  provider = 'hubspot' as const;
  private config: CRMIntegrationConfig | null = null;
  private baseUrl = 'https://api.hubapi.com';

  async authenticate(config: CRMIntegrationConfig): Promise<boolean> {
    this.config = config;
    
    try {
      // Test API key by fetching account info
      const response = await fetch(`${this.baseUrl}/account-info/v3/details`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('[HubSpot] Authentication error:', error);
      return false;
    }
  }

  async getContacts(limit = 100, offset = 0): Promise<CRMContact[]> {
    const response = await fetch(
      `${this.baseUrl}/crm/v3/objects/contacts?limit=${limit}&after=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config?.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map(this.mapToContact);
  }

  async getContact(id: string): Promise<CRMContact | null> {
    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return this.mapToContact(data);
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMContact> {
    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          firstname: contact.firstName,
          lastname: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          jobtitle: contact.jobTitle,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToContact(data);
  }

  async updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          firstname: contact.firstName,
          lastname: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          jobtitle: contact.jobTitle,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToContact(data);
  }

  async deleteContact(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
      },
    });

    return response.ok;
  }

  async getLeads(limit = 100, offset = 0): Promise<CRMLead[]> {
    // HubSpot doesn't have a separate "leads" object, using deals instead
    return [];
  }

  async createLead(lead: Partial<CRMLead>): Promise<CRMLead> {
    throw new Error('HubSpot uses deals instead of leads');
  }

  async updateLead(id: string, lead: Partial<CRMLead>): Promise<CRMLead> {
    throw new Error('HubSpot uses deals instead of leads');
  }

  async getDeals(limit = 100, offset = 0): Promise<CRMDeal[]> {
    const response = await fetch(
      `${this.baseUrl}/crm/v3/objects/deals?limit=${limit}&after=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config?.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map(this.mapToDeal);
  }

  async createDeal(deal: Partial<CRMDeal>): Promise<CRMDeal> {
    const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          dealname: deal.title,
          amount: deal.value,
          dealstage: deal.stage,
          closedate: deal.expectedCloseDate?.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create deal: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToDeal(data);
  }

  async updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMDeal> {
    const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          dealname: deal.title,
          amount: deal.value,
          dealstage: deal.stage,
          closedate: deal.expectedCloseDate?.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update deal: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToDeal(data);
  }

  async logActivity(activity: Partial<CRMActivity>): Promise<CRMActivity> {
    // Create engagement (call/meeting/note)
    const engagementType = activity.type === 'call' ? 'CALL' : 
                          activity.type === 'meeting' ? 'MEETING' : 'NOTE';

    const response = await fetch(`${this.baseUrl}/engagements/v1/engagements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        engagement: {
          type: engagementType,
          timestamp: activity.createdAt?.getTime() || Date.now(),
        },
        associations: {
          contactIds: activity.contactId ? [activity.contactId] : [],
          dealIds: activity.dealId ? [activity.dealId] : [],
        },
        metadata: {
          subject: activity.subject,
          body: activity.description,
          durationMilliseconds: (activity.duration || 0) * 1000,
          status: activity.outcome,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.engagement.id,
      externalId: data.engagement.id,
      type: activity.type || 'call',
      contactId: activity.contactId,
      dealId: activity.dealId,
      subject: activity.subject || '',
      description: activity.description,
      duration: activity.duration,
      outcome: activity.outcome,
      recordingUrl: activity.recordingUrl,
      transcript: activity.transcript,
      createdAt: new Date(data.engagement.timestamp),
      createdBy: activity.createdBy,
    };
  }

  async syncToQuikle(entityType: CRMEntityType): Promise<CRMSyncResult> {
    const startTime = new Date();
    return {
      success: true,
      provider: this.provider,
      entityType,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      syncedAt: startTime,
    };
  }

  async syncFromQuikle(entityType: CRMEntityType, data: any[]): Promise<CRMSyncResult> {
    const startTime = new Date();
    return {
      success: true,
      provider: this.provider,
      entityType,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      syncedAt: startTime,
    };
  }

  private mapToContact(data: any): CRMContact {
    return {
      id: data.id,
      externalId: data.id,
      firstName: data.properties.firstname,
      lastName: data.properties.lastname,
      email: data.properties.email,
      phone: data.properties.phone,
      company: data.properties.company,
      jobTitle: data.properties.jobtitle,
      tags: [],
      customFields: data.properties,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  private mapToDeal(data: any): CRMDeal {
    return {
      id: data.id,
      externalId: data.id,
      title: data.properties.dealname,
      value: parseFloat(data.properties.amount) || 0,
      currency: 'USD',
      stage: data.properties.dealstage,
      expectedCloseDate: data.properties.closedate ? new Date(data.properties.closedate) : undefined,
      status: 'open',
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}

