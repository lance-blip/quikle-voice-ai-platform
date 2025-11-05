import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

/**
 * Queue Management Router
 * 
 * Provides API endpoints for managing call queues.
 */
export const queueRouter = router({
  /**
   * Create a new queue
   */
  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      maxWaitTimeSeconds: z.number().default(300),
      overflowAction: z.enum(['voicemail', 'transfer', 'hangup']).default('voicemail'),
      overflowDestination: z.string().optional(),
      holdMusicUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const queue = await db.createCallQueue({
        clientId: input.clientId,
        name: input.name,
        description: input.description,
        maxWaitTimeSeconds: input.maxWaitTimeSeconds,
        overflowAction: input.overflowAction,
        overflowDestination: input.overflowDestination,
        holdMusicUrl: input.holdMusicUrl,
      });
      
      return queue;
    }),
  
  /**
   * Update a queue
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      maxWaitTimeSeconds: z.number().optional(),
      overflowAction: z.enum(['voicemail', 'transfer', 'hangup']).optional(),
      overflowDestination: z.string().optional(),
      holdMusicUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCallQueue(id, data);
      return { success: true };
    }),
  
  /**
   * Delete a queue
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.deleteCallQueue(input.id);
      return { success: true };
    }),
  
  /**
   * List queues for a client
   */
  list: protectedProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      const queues = await db.getCallQueuesByClient(input.clientId);
      return queues;
    }),
  
  /**
   * Get queue details
   */
  get: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const queue = await db.getCallQueue(input.id);
      return queue;
    }),
  
  /**
   * Get queue statistics
   */
  getStats: protectedProcedure
    .input(z.object({
      queueId: z.number(),
    }))
    .query(async ({ input }) => {
      // TODO: Get real-time stats from queue manager
      // For now, return mock data
      return {
        queueId: input.queueId,
        callsWaiting: 0,
        longestWaitTimeSeconds: 0,
        averageWaitTimeSeconds: 0,
      };
    }),
  
  /**
   * Get queue entries (calls currently in queue)
   */
  getEntries: protectedProcedure
    .input(z.object({
      queueId: z.number(),
    }))
    .query(async ({ input }) => {
      const entries = await db.getQueueEntries(input.queueId);
      return entries;
    }),
  
  /**
   * Get queue history (past queue entries)
   */
  getHistory: protectedProcedure
    .input(z.object({
      queueId: z.number(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const history = await db.getQueueHistory(input.queueId, input.limit);
      return history;
    }),
});
