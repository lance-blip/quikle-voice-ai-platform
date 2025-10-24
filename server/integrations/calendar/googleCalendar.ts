/**
 * Google Calendar Integration
 * Handles event creation, scheduling, and availability checking
 */

export interface GoogleCalendarConfig {
  accessToken: string;
  refreshToken?: string;
  calendarId?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
  meetingLink?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export class GoogleCalendarIntegration {
  private accessToken: string;
  private calendarId: string;
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(config: GoogleCalendarConfig) {
    this.accessToken = config.accessToken;
    this.calendarId = config.calendarId || 'primary';
  }

  /**
   * Create a calendar event
   */
  async createEvent(event: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees?: string[];
    location?: string;
    addMeetLink?: boolean;
  }): Promise<CalendarEvent> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${this.calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: 'UTC',
          },
          attendees: event.attendees?.map(email => ({ email })),
          location: event.location,
          ...(event.addMeetLink && {
            conferenceData: {
              createRequest: {
                requestId: `quikle-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
          }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToEvent(data);
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<CalendarEvent> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${this.calendarId}/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToEvent(data);
  }

  /**
   * Update an event
   */
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${this.calendarId}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(updates.summary && { summary: updates.summary }),
          ...(updates.description && { description: updates.description }),
          ...(updates.startTime && {
            start: {
              dateTime: updates.startTime.toISOString(),
              timeZone: 'UTC',
            },
          }),
          ...(updates.endTime && {
            end: {
              dateTime: updates.endTime.toISOString(),
              timeZone: 'UTC',
            },
          }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToEvent(data);
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${this.calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }
  }

  /**
   * Check availability for a time range
   */
  async checkAvailability(startTime: Date, endTime: Date): Promise<TimeSlot[]> {
    const response = await fetch(
      `${this.baseUrl}/freeBusy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: this.calendarId }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    const busySlots = data.calendars[this.calendarId]?.busy || [];

    // Generate available time slots (simplified version)
    const slots: TimeSlot[] = [];
    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30-minute slots
      
      const isBusy = busySlots.some((busy: any) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return currentTime < busyEnd && slotEnd > busyStart;
      });

      slots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        available: !isBusy,
      });

      currentTime = slotEnd;
    }

    return slots;
  }

  /**
   * List upcoming events
   */
  async listUpcomingEvents(maxResults = 10): Promise<CalendarEvent[]> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${this.calendarId}/events?` +
      new URLSearchParams({
        maxResults: maxResults.toString(),
        orderBy: 'startTime',
        singleEvents: 'true',
        timeMin: new Date().toISOString(),
      }),
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.items || []).map(this.mapToEvent);
  }

  private mapToEvent(data: any): CalendarEvent {
    return {
      id: data.id,
      summary: data.summary,
      description: data.description,
      startTime: new Date(data.start.dateTime || data.start.date),
      endTime: new Date(data.end.dateTime || data.end.date),
      attendees: data.attendees?.map((a: any) => a.email) || [],
      location: data.location,
      meetingLink: data.hangoutLink || data.conferenceData?.entryPoints?.[0]?.uri,
      status: data.status,
    };
  }
}

