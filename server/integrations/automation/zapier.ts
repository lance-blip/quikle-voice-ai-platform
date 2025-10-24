/**
 * Zapier Integration
 * Webhook-based automation triggers and actions
 */

export interface ZapierConfig {
  webhookUrl: string;
}

export interface ZapierTrigger {
  event: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface ZapierWebhookResult {
  success: boolean;
  statusCode: number;
  response?: any;
  error?: string;
}

export class ZapierIntegration {
  private webhookUrl: string;

  constructor(config: ZapierConfig) {
    this.webhookUrl = config.webhookUrl;
  }

  /**
   * Send trigger to Zapier
   */
  async sendTrigger(trigger: ZapierTrigger): Promise<ZapierWebhookResult> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: trigger.event,
          timestamp: trigger.timestamp.toISOString(),
          data: trigger.data,
        }),
      });

      const responseData = await response.json().catch(() => null);

      return {
        success: response.ok,
        statusCode: response.status,
        response: responseData,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        error: String(error),
      };
    }
  }

  /**
   * Trigger on new call completed
   */
  async triggerCallCompleted(callData: {
    callId: string;
    agentId: string;
    agentName: string;
    contactPhone: string;
    contactName?: string;
    duration: number;
    outcome: string;
    transcript?: string;
    recordingUrl?: string;
  }): Promise<ZapierWebhookResult> {
    return this.sendTrigger({
      event: 'call.completed',
      timestamp: new Date(),
      data: callData,
    });
  }

  /**
   * Trigger on new lead created
   */
  async triggerLeadCreated(leadData: {
    leadId: string;
    name: string;
    email?: string;
    phone?: string;
    source: string;
    value?: number;
    status: string;
  }): Promise<ZapierWebhookResult> {
    return this.sendTrigger({
      event: 'lead.created',
      timestamp: new Date(),
      data: leadData,
    });
  }

  /**
   * Trigger on appointment scheduled
   */
  async triggerAppointmentScheduled(appointmentData: {
    appointmentId: string;
    contactName: string;
    contactEmail?: string;
    contactPhone?: string;
    scheduledFor: Date;
    agentName: string;
    meetingLink?: string;
  }): Promise<ZapierWebhookResult> {
    return this.sendTrigger({
      event: 'appointment.scheduled',
      timestamp: new Date(),
      data: {
        ...appointmentData,
        scheduledFor: appointmentData.scheduledFor.toISOString(),
      },
    });
  }

  /**
   * Trigger on deal won
   */
  async triggerDealWon(dealData: {
    dealId: string;
    dealName: string;
    value: number;
    currency: string;
    contactName: string;
    contactEmail?: string;
    closedDate: Date;
  }): Promise<ZapierWebhookResult> {
    return this.sendTrigger({
      event: 'deal.won',
      timestamp: new Date(),
      data: {
        ...dealData,
        closedDate: dealData.closedDate.toISOString(),
      },
    });
  }

  /**
   * Trigger on voicemail received
   */
  async triggerVoicemailReceived(voicemailData: {
    voicemailId: string;
    from: string;
    agentName: string;
    duration: number;
    transcription?: string;
    audioUrl: string;
  }): Promise<ZapierWebhookResult> {
    return this.sendTrigger({
      event: 'voicemail.received',
      timestamp: new Date(),
      data: voicemailData,
    });
  }

  /**
   * Test webhook connection
   */
  async testConnection(): Promise<ZapierWebhookResult> {
    return this.sendTrigger({
      event: 'test.connection',
      timestamp: new Date(),
      data: {
        message: 'Quikle Voice AI Platform - Webhook Test',
        platform: 'Quikle Voice',
      },
    });
  }
}

/**
 * Make.com (Integromat) Integration
 * Similar to Zapier but for Make.com platform
 */
export class MakeIntegration extends ZapierIntegration {
  constructor(config: ZapierConfig) {
    super(config);
  }

  // Inherits all methods from ZapierIntegration
  // Make.com uses the same webhook approach
}

