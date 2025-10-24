/**
 * Salesforce CRM Connector
 * Integration with Salesforce REST API
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

export class SalesforceConnector implements CRMConnector {
  provider = 'salesforce' as const;
  private config: CRMIntegrationConfig | null = null;
  private instanceUrl: string = '';
  private accessToken: string = '';

  async authenticate(config: CRMIntegrationConfig): Promise<boolean> {
    this.config = config;
    this.instanceUrl = config.instanceUrl || '';
    
    try {
      // OAuth 2.0 authentication
      const response = await fetch(`${this.instanceUrl}/services/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: config.apiKey || '',
          client_secret: config.apiSecret || '',
          username: config.customSettings?.username || '',
          password: config.customSettings?.password || '',
        }),
      });

      if (!response.ok) {
        console.error('[Salesforce] Authentication failed');
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.instanceUrl = data.instance_url;
      return true;
    } catch (error) {
      console.error('[Salesforce] Authentication error:', error);
      return false;
    }
  }

  async getContacts(limit = 100, offset = 0): Promise<CRMContact[]> {
    const query = `SELECT Id, FirstName, LastName, Email, Phone, Title, Account.Name FROM Contact LIMIT ${limit} OFFSET ${offset}`;
    const response = await this.query(query);
    return response.records.map(this.mapToContact);
  }

  async getContact(id: string): Promise<CRMContact | null> {
    try {
      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return this.mapToContact(data);
    } catch (error) {
      return null;
    }
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMContact> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Contact`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: contact.firstName,
          LastName: contact.lastName,
          Email: contact.email,
          Phone: contact.phone,
          Title: contact.jobTitle,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.statusText}`);
    }

    const data = await response.json();
    const created = await this.getContact(data.id);
    if (!created) throw new Error('Failed to retrieve created contact');
    return created;
  }

  async updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: contact.firstName,
          LastName: contact.lastName,
          Email: contact.email,
          Phone: contact.phone,
          Title: contact.jobTitle,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`);
    }

    const updated = await this.getContact(id);
    if (!updated) throw new Error('Failed to retrieve updated contact');
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    return response.ok;
  }

  async getLeads(limit = 100, offset = 0): Promise<CRMLead[]> {
    const query = `SELECT Id, Name, Company, Email, Phone, Status, LeadSource FROM Lead LIMIT ${limit} OFFSET ${offset}`;
    const response = await this.query(query);
    return response.records.map(this.mapToLead);
  }

  async createLead(lead: Partial<CRMLead>): Promise<CRMLead> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Lead`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          LastName: lead.title,
          Company: 'Unknown',
          Status: lead.status || 'Open',
          LeadSource: lead.source,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create lead: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      externalId: data.id,
      title: lead.title || '',
      status: lead.status || 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateLead(id: string, lead: Partial<CRMLead>): Promise<CRMLead> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Lead/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Status: lead.status,
          LeadSource: lead.source,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update lead: ${response.statusText}`);
    }

    return {
      id,
      externalId: id,
      title: lead.title || '',
      status: lead.status || 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getDeals(limit = 100, offset = 0): Promise<CRMDeal[]> {
    const query = `SELECT Id, Name, Amount, StageName, CloseDate FROM Opportunity LIMIT ${limit} OFFSET ${offset}`;
    const response = await this.query(query);
    return response.records.map(this.mapToDeal);
  }

  async createDeal(deal: Partial<CRMDeal>): Promise<CRMDeal> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Opportunity`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: deal.title,
          Amount: deal.value,
          StageName: deal.stage || 'Prospecting',
          CloseDate: deal.expectedCloseDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create deal: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      externalId: data.id,
      title: deal.title || '',
      value: deal.value || 0,
      currency: deal.currency || 'USD',
      stage: deal.stage || 'Prospecting',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMDeal> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Opportunity/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: deal.title,
          Amount: deal.value,
          StageName: deal.stage,
          CloseDate: deal.expectedCloseDate?.toISOString().split('T')[0],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update deal: ${response.statusText}`);
    }

    return {
      id,
      externalId: id,
      title: deal.title || '',
      value: deal.value || 0,
      currency: deal.currency || 'USD',
      stage: deal.stage || '',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async logActivity(activity: Partial<CRMActivity>): Promise<CRMActivity> {
    // Create Task for call activity
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Task`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Subject: activity.subject,
          Description: activity.description,
          WhoId: activity.contactId,
          WhatId: activity.dealId,
          Status: 'Completed',
          TaskSubtype: activity.type === 'call' ? 'Call' : 'Email',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      externalId: data.id,
      type: activity.type || 'call',
      contactId: activity.contactId,
      dealId: activity.dealId,
      subject: activity.subject || '',
      description: activity.description,
      duration: activity.duration,
      outcome: activity.outcome,
      recordingUrl: activity.recordingUrl,
      transcript: activity.transcript,
      createdAt: new Date(),
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

  private async query(soql: string): Promise<any> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Salesforce query failed: ${response.statusText}`);
    }

    return response.json();
  }

  private mapToContact(data: any): CRMContact {
    return {
      id: data.Id,
      externalId: data.Id,
      firstName: data.FirstName,
      lastName: data.LastName,
      email: data.Email,
      phone: data.Phone,
      company: data.Account?.Name,
      jobTitle: data.Title,
      tags: [],
      customFields: {},
      createdAt: new Date(data.CreatedDate || Date.now()),
      updatedAt: new Date(data.LastModifiedDate || Date.now()),
    };
  }

  private mapToLead(data: any): CRMLead {
    return {
      id: data.Id,
      externalId: data.Id,
      title: data.Name,
      status: data.Status?.toLowerCase() || 'new',
      source: data.LeadSource,
      createdAt: new Date(data.CreatedDate || Date.now()),
      updatedAt: new Date(data.LastModifiedDate || Date.now()),
    };
  }

  private mapToDeal(data: any): CRMDeal {
    return {
      id: data.Id,
      externalId: data.Id,
      title: data.Name,
      value: data.Amount || 0,
      currency: 'USD',
      stage: data.StageName,
      expectedCloseDate: data.CloseDate ? new Date(data.CloseDate) : undefined,
      status: 'open',
      createdAt: new Date(data.CreatedDate || Date.now()),
      updatedAt: new Date(data.LastModifiedDate || Date.now()),
    };
  }
}

