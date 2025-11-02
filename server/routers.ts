import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { integrationsRouter } from "./routers/integrations";
import { chatbotRouter } from "./routers/chatbot";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  integrations: integrationsRouter,
  chatbot: chatbotRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Agency management
  agency: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAgencyByOwnerId(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        logo: z.string().optional(),
        customDomain: z.string().optional(),
        settings: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createAgency({
          ownerId: ctx.user.id,
          ...input,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        logo: z.string().optional(),
        customDomain: z.string().optional(),
        settings: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAgency(id, data);
        return { success: true };
      }),
  }),

  // Client management
  clients: router({
    list: protectedProcedure
      .input(z.object({
        agencyId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getClientsByAgencyId(input.agencyId);
      }),
    
    get: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getClientById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        agencyId: z.number(),
        name: z.string().min(1).max(255),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().max(20).optional(),
        status: z.enum(["active", "paused", "archived"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createClient(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().max(20).optional(),
        status: z.enum(["active", "paused", "archived"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateClient(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteClient(input.id);
        return { success: true };
      }),
  }),

  // Agent management
  agents: router({
    list: protectedProcedure
      .input(z.object({
        clientId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getAgentsByClientId(input.clientId);
      }),
    
    listByClient: protectedProcedure
      .input(z.object({
        clientId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        const client = await db.getClientById(input.clientId);
        if (!client) {
          throw new Error("Client not found");
        }
        
        const agency = await db.getAgencyByOwnerId(ctx.user.id);
        if (!agency || client.agencyId !== agency.id) {
          throw new Error("Unauthorized: Client does not belong to your agency");
        }
        
        return await db.getAgentsByClientId(input.clientId);
      }),
    
    get: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getAgentById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        flowData: z.string().optional(),
        voiceId: z.string().optional(),
        voiceProvider: z.enum(["elevenlabs", "cartesia"]).optional(),
        status: z.enum(["draft", "active", "paused"]).optional(),
        systemPrompt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAgent(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        flowData: z.string().optional(),
        voiceId: z.string().optional(),
        voiceProvider: z.enum(["elevenlabs", "cartesia"]).optional(),
        status: z.enum(["draft", "active", "paused"]).optional(),
        systemPrompt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAgent(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteAgent(input.id);
        return { success: true };
      }),
  }),

  // Knowledge base management
  knowledgeBase: router({
    list: protectedProcedure
      .input(z.object({
        agentId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getKnowledgeBaseByAgentId(input.agentId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        sourceType: z.enum(["text", "pdf", "csv", "audio", "url"]),
        sourceUrl: z.string().optional(),
        title: z.string().min(1).max(255),
        content: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createKnowledgeBase(input);
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteKnowledgeBase(input.id);
        return { success: true };
      }),
  }),

  // Knowledge base sources management
  knowledgeBaseSources: router({
    list: protectedProcedure
      .input(z.object({
        knowledgeBaseId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getKnowledgeBaseSourcesByKbId(input.knowledgeBaseId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        knowledgeBaseId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return await db.createKnowledgeBaseSource(input);
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteKnowledgeBaseSource(input.id);
        return { success: true };
      }),
  }),

  // Phone numbers
  phoneNumbers: router({
    list: protectedProcedure
      .input(z.object({
        clientId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getPhoneNumbersByClientId(input.clientId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        agentId: z.number().optional(),
        phoneNumber: z.string().max(20),
        provider: z.enum(["twilio", "telnyx", "saicom", "wanatel", "avoxi", "switch", "iptelecom", "united", "telkom", "vodacom"]),
        providerSid: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPhoneNumber(input);
      }),
  }),

  // Call logs
  callLogs: router({
    list: protectedProcedure
      .input(z.object({
        agentId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getCallLogsByAgentId(input.agentId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        phoneNumberId: z.number().optional(),
        callerNumber: z.string().max(20).optional(),
        direction: z.enum(["inbound", "outbound"]),
        duration: z.number().optional(),
        status: z.enum(["completed", "failed", "no-answer", "busy"]),
        transcript: z.string().optional(),
        summary: z.string().optional(),
        recordingUrl: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCallLog(input);
      }),
  }),

  // Automations
  automations: router({
    list: protectedProcedure
      .input(z.object({
        agencyId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getAutomationsByAgencyId(input.agencyId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        agencyId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        triggerType: z.enum(["webhook", "call_completed", "schedule"]),
        triggerConfig: z.string().optional(),
        actions: z.string().optional(),
        enabled: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAutomation(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        triggerConfig: z.string().optional(),
        actions: z.string().optional(),
        enabled: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAutomation(id, data);
        return { success: true };
      }),
  }),

  // Voice clones
  voiceClones: router({
    list: protectedProcedure
      .input(z.object({
        agencyId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getVoiceClonesByAgencyId(input.agencyId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        agencyId: z.number(),
        name: z.string().min(1).max(255),
        provider: z.enum(["elevenlabs", "cartesia"]),
        providerVoiceId: z.string().max(255),
        sampleUrl: z.string().optional(),
        status: z.enum(["processing", "ready", "failed"]).optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createVoiceClone(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;

