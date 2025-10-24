/**
 * Integration Routers
 * tRPC endpoints for managing external integrations
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { StripeIntegration } from '../integrations/payment/stripe';
import { CalendlyIntegration } from '../integrations/calendar/calendly';
import { GoogleCalendarIntegration } from '../integrations/calendar/googleCalendar';
import { SendGridIntegration } from '../integrations/communication/sendgrid';

export const integrationsRouter = router({
  // Stripe Payment Integration
  stripe: router({
    createPaymentIntent: protectedProcedure
      .input(z.object({
        amount: z.number(),
        currency: z.string(),
        customerId: z.string().optional(),
        metadata: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const stripe = new StripeIntegration({
          apiKey: process.env.STRIPE_API_KEY || '',
        });
        return await stripe.createPaymentIntent(input);
      }),

    createCustomer: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        phone: z.string().optional(),
        metadata: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const stripe = new StripeIntegration({
          apiKey: process.env.STRIPE_API_KEY || '',
        });
        return await stripe.createCustomer(input);
      }),

    createSubscription: protectedProcedure
      .input(z.object({
        customerId: z.string(),
        priceId: z.string(),
        quantity: z.number().optional(),
        trialPeriodDays: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const stripe = new StripeIntegration({
          apiKey: process.env.STRIPE_API_KEY || '',
        });
        return await stripe.createSubscription(input);
      }),

    cancelSubscription: protectedProcedure
      .input(z.object({
        subscriptionId: z.string(),
        cancelAtPeriodEnd: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const stripe = new StripeIntegration({
          apiKey: process.env.STRIPE_API_KEY || '',
        });
        return await stripe.cancelSubscription(input.subscriptionId, input.cancelAtPeriodEnd);
      }),

    getCustomer: protectedProcedure
      .input(z.object({
        customerId: z.string(),
      }))
      .query(async ({ input }) => {
        const stripe = new StripeIntegration({
          apiKey: process.env.STRIPE_API_KEY || '',
        });
        return await stripe.getCustomer(input.customerId);
      }),
  }),

  // Calendly Integration
  calendly: router({
    listEventTypes: protectedProcedure
      .query(async () => {
        const calendly = new CalendlyIntegration({
          apiKey: process.env.CALENDLY_API_KEY || '',
        });
        return await calendly.listEventTypes();
      }),

    listScheduledEvents: protectedProcedure
      .input(z.object({
        minStartTime: z.date().optional(),
        maxStartTime: z.date().optional(),
        status: z.enum(['active', 'canceled']).optional(),
      }))
      .query(async ({ input }) => {
        const calendly = new CalendlyIntegration({
          apiKey: process.env.CALENDLY_API_KEY || '',
        });
        return await calendly.listScheduledEvents(input);
      }),

    getScheduledEvent: protectedProcedure
      .input(z.object({
        eventUri: z.string(),
      }))
      .query(async ({ input }) => {
        const calendly = new CalendlyIntegration({
          apiKey: process.env.CALENDLY_API_KEY || '',
        });
        return await calendly.getScheduledEvent(input.eventUri);
      }),

    cancelEvent: protectedProcedure
      .input(z.object({
        eventUri: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const calendly = new CalendlyIntegration({
          apiKey: process.env.CALENDLY_API_KEY || '',
        });
        await calendly.cancelScheduledEvent(input.eventUri, input.reason);
        return { success: true };
      }),

    getEventInvitees: protectedProcedure
      .input(z.object({
        eventUri: z.string(),
      }))
      .query(async ({ input }) => {
        const calendly = new CalendlyIntegration({
          apiKey: process.env.CALENDLY_API_KEY || '',
        });
        return await calendly.getEventInvitees(input.eventUri);
      }),

    createSingleUseLink: protectedProcedure
      .input(z.object({
        eventTypeUri: z.string(),
        maxEventCount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const calendly = new CalendlyIntegration({
          apiKey: process.env.CALENDLY_API_KEY || '',
        });
        const url = await calendly.createSingleUseLink(input);
        return { url };
      }),
  }),

  // Google Calendar Integration
  googleCalendar: router({
    createEvent: protectedProcedure
      .input(z.object({
        summary: z.string(),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date(),
        attendees: z.array(z.string()).optional(),
        location: z.string().optional(),
        addMeetLink: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const calendar = new GoogleCalendarIntegration({
          accessToken: process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || '',
        });
        return await calendar.createEvent(input);
      }),

    listUpcomingEvents: protectedProcedure
      .input(z.object({
        maxResults: z.number().default(10),
      }))
      .query(async ({ input }) => {
        const calendar = new GoogleCalendarIntegration({
          accessToken: process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || '',
        });
        return await calendar.listUpcomingEvents(input.maxResults);
      }),

    checkAvailability: protectedProcedure
      .input(z.object({
        startTime: z.date(),
        endTime: z.date(),
      }))
      .query(async ({ input }) => {
        const calendar = new GoogleCalendarIntegration({
          accessToken: process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || '',
        });
        return await calendar.checkAvailability(input.startTime, input.endTime);
      }),
  }),

  // SendGrid Email Integration
  sendgrid: router({
    sendEmail: protectedProcedure
      .input(z.object({
        to: z.union([z.string(), z.array(z.string())]),
        subject: z.string(),
        text: z.string().optional(),
        html: z.string().optional(),
        templateId: z.string().optional(),
        dynamicTemplateData: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        const sendgrid = new SendGridIntegration({
          apiKey: process.env.SENDGRID_API_KEY || '',
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@quikle.com',
          fromName: 'Quikle Voice',
        });
        return await sendgrid.sendEmail(input);
      }),

    sendCallTranscript: protectedProcedure
      .input(z.object({
        to: z.string().email(),
        callId: z.string(),
        agentName: z.string(),
        duration: z.number(),
        transcript: z.string(),
        recordingUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const sendgrid = new SendGridIntegration({
          apiKey: process.env.SENDGRID_API_KEY || '',
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@quikle.com',
          fromName: 'Quikle Voice',
        });
        return await sendgrid.sendCallTranscript(input);
      }),

    sendAppointmentConfirmation: protectedProcedure
      .input(z.object({
        to: z.string().email(),
        customerName: z.string(),
        appointmentDate: z.date(),
        agentName: z.string(),
        meetingLink: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const sendgrid = new SendGridIntegration({
          apiKey: process.env.SENDGRID_API_KEY || '',
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@quikle.com',
          fromName: 'Quikle Voice',
        });
        return await sendgrid.sendAppointmentConfirmation(input);
      }),
  }),
});

