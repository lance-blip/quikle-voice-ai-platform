/**
 * SendGrid Email Integration
 * Handles transactional emails, campaigns, and templates
 */

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  type: string; // MIME type
}

export interface EmailResult {
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
  timestamp: Date;
}

export class SendGridIntegration {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: SendGridConfig) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName || 'Quikle Voice';
  }

  /**
   * Send a single email
   */
  async sendEmail(message: EmailMessage): Promise<EmailResult> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];

    const payload: any = {
      personalizations: recipients.map(email => ({
        to: [{ email }],
        ...(message.dynamicTemplateData && { dynamic_template_data: message.dynamicTemplateData }),
      })),
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: message.subject,
    };

    // Use template or content
    if (message.templateId) {
      payload.template_id = message.templateId;
    } else {
      payload.content = [];
      if (message.text) {
        payload.content.push({
          type: 'text/plain',
          value: message.text,
        });
      }
      if (message.html) {
        payload.content.push({
          type: 'text/html',
          value: message.html,
        });
      }
    }

    // Add attachments
    if (message.attachments && message.attachments.length > 0) {
      payload.attachments = message.attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,
      }));
    }

    const response = await fetch(`${this.baseUrl}/mail/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid API error: ${error}`);
    }

    // SendGrid returns 202 Accepted with X-Message-Id header
    const messageId = response.headers.get('X-Message-Id') || 'unknown';

    return {
      messageId,
      status: 'sent',
      timestamp: new Date(),
    };
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const message of messages) {
      try {
        const result = await this.sendEmail(message);
        results.push(result);
      } catch (error) {
        results.push({
          messageId: 'failed',
          status: 'failed',
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Send email with template
   */
  async sendTemplateEmail(params: {
    to: string | string[];
    templateId: string;
    dynamicData: Record<string, any>;
  }): Promise<EmailResult> {
    return this.sendEmail({
      to: params.to,
      subject: '', // Template defines subject
      templateId: params.templateId,
      dynamicTemplateData: params.dynamicData,
    });
  }

  /**
   * Send call transcript email
   */
  async sendCallTranscript(params: {
    to: string;
    callId: string;
    agentName: string;
    duration: number;
    transcript: string;
    recordingUrl?: string;
  }): Promise<EmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #191970;">Call Transcript - ${params.agentName}</h2>
        <p><strong>Call ID:</strong> ${params.callId}</p>
        <p><strong>Duration:</strong> ${Math.floor(params.duration / 60)}m ${params.duration % 60}s</p>
        ${params.recordingUrl ? `<p><a href="${params.recordingUrl}" style="color: #41B3A3;">Listen to Recording</a></p>` : ''}
        <hr style="border: 1px solid #E27D60; margin: 20px 0;">
        <h3>Transcript:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
          ${params.transcript}
        </div>
      </div>
    `;

    return this.sendEmail({
      to: params.to,
      subject: `Call Transcript - ${params.agentName}`,
      html,
      text: `Call Transcript\n\nCall ID: ${params.callId}\nDuration: ${Math.floor(params.duration / 60)}m ${params.duration % 60}s\n\n${params.transcript}`,
    });
  }

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(params: {
    to: string;
    customerName: string;
    appointmentDate: Date;
    agentName: string;
    meetingLink?: string;
  }): Promise<EmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #191970;">Appointment Confirmed</h2>
        <p>Hi ${params.customerName},</p>
        <p>Your appointment has been confirmed for:</p>
        <div style="background: #41B3A3; color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px;"><strong>${params.appointmentDate.toLocaleString()}</strong></p>
          <p style="margin: 10px 0 0 0;">with ${params.agentName}</p>
        </div>
        ${params.meetingLink ? `
          <p><a href="${params.meetingLink}" style="display: inline-block; background: #E27D60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Join Meeting</a></p>
        ` : ''}
        <p>Looking forward to speaking with you!</p>
      </div>
    `;

    return this.sendEmail({
      to: params.to,
      subject: 'Appointment Confirmation',
      html,
    });
  }
}

