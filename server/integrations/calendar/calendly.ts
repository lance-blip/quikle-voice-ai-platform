/**
 * Calendly Integration
 * Handles scheduling, event types, and availability
 */

export interface CalendlyConfig {
  apiKey: string;
  organizationUri?: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  duration: number;
  description?: string;
  schedulingUrl: string;
  active: boolean;
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: 'active' | 'canceled';
  startTime: Date;
  endTime: Date;
  location?: {
    type: string;
    location?: string;
    joinUrl?: string;
  };
  inviteesCounter: {
    total: number;
    active: number;
    limit: number;
  };
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  status: 'active' | 'canceled';
  timezone: string;
  createdAt: Date;
  questionsAndAnswers?: Array<{
    question: string;
    answer: string;
  }>;
}

export class CalendlyIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.calendly.com';
  private organizationUri?: string;

  constructor(config: CalendlyConfig) {
    this.apiKey = config.apiKey;
    this.organizationUri = config.organizationUri;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.resource;
  }

  /**
   * List event types
   */
  async listEventTypes(): Promise<CalendlyEventType[]> {
    const user = await this.getCurrentUser();
    const response = await fetch(
      `${this.baseUrl}/event_types?user=${encodeURIComponent(user.uri)}&active=true`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.collection.map((item: any) => ({
      uri: item.uri,
      name: item.name,
      duration: item.duration,
      description: item.description_plain,
      schedulingUrl: item.scheduling_url,
      active: item.active,
    }));
  }

  /**
   * Get scheduled events
   */
  async listScheduledEvents(params?: {
    minStartTime?: Date;
    maxStartTime?: Date;
    status?: 'active' | 'canceled';
  }): Promise<CalendlyScheduledEvent[]> {
    const user = await this.getCurrentUser();
    const queryParams = new URLSearchParams({
      user: user.uri,
      ...(params?.minStartTime && { min_start_time: params.minStartTime.toISOString() }),
      ...(params?.maxStartTime && { max_start_time: params.maxStartTime.toISOString() }),
      ...(params?.status && { status: params.status }),
    });

    const response = await fetch(
      `${this.baseUrl}/scheduled_events?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.collection.map(this.mapToScheduledEvent);
  }

  /**
   * Get event details
   */
  async getScheduledEvent(eventUri: string): Promise<CalendlyScheduledEvent> {
    const response = await fetch(
      `${this.baseUrl}/scheduled_events/${eventUri.split('/').pop()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToScheduledEvent(data.resource);
  }

  /**
   * Cancel a scheduled event
   */
  async cancelScheduledEvent(eventUri: string, reason?: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/scheduled_events/${eventUri.split('/').pop()}/cancellation`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Canceled via Quikle Voice AI Platform',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }
  }

  /**
   * Get invitees for an event
   */
  async getEventInvitees(eventUri: string): Promise<CalendlyInvitee[]> {
    const response = await fetch(
      `${this.baseUrl}/scheduled_events/${eventUri.split('/').pop()}/invitees`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.collection.map((item: any) => ({
      uri: item.uri,
      email: item.email,
      name: item.name,
      status: item.status,
      timezone: item.timezone,
      createdAt: new Date(item.created_at),
      questionsAndAnswers: item.questions_and_answers,
    }));
  }

  /**
   * Create a single-use scheduling link
   */
  async createSingleUseLink(params: {
    eventTypeUri: string;
    maxEventCount?: number;
  }): Promise<string> {
    const user = await this.getCurrentUser();
    const response = await fetch(
      `${this.baseUrl}/scheduling_links`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_event_count: params.maxEventCount || 1,
          owner: user.uri,
          owner_type: 'EventType',
          resource_uri: params.eventTypeUri,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.resource.booking_url;
  }

  /**
   * Get webhook subscriptions
   */
  async listWebhooks(): Promise<any[]> {
    if (!this.organizationUri) {
      throw new Error('Organization URI required for webhook management');
    }

    const response = await fetch(
      `${this.baseUrl}/webhook_subscriptions?organization=${encodeURIComponent(this.organizationUri)}&scope=organization`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.collection;
  }

  /**
   * Create webhook subscription
   */
  async createWebhook(params: {
    url: string;
    events: string[];
    signingKey?: string;
  }): Promise<any> {
    if (!this.organizationUri) {
      throw new Error('Organization URI required for webhook management');
    }

    const response = await fetch(
      `${this.baseUrl}/webhook_subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: params.url,
          events: params.events,
          organization: this.organizationUri,
          scope: 'organization',
          ...(params.signingKey && { signing_key: params.signingKey }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.resource;
  }

  /**
   * Delete webhook subscription
   */
  async deleteWebhook(webhookUri: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/webhook_subscriptions/${webhookUri.split('/').pop()}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }
  }

  private mapToScheduledEvent(data: any): CalendlyScheduledEvent {
    return {
      uri: data.uri,
      name: data.name,
      status: data.status,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      location: data.location,
      inviteesCounter: data.invitees_counter,
    };
  }
}

