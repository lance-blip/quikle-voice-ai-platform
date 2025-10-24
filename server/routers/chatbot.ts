import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { chatbotService, ChatContext } from '../services/chatbotService';

export const chatbotRouter = router({
  /**
   * Send message to chatbot and get response
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        conversationHistory: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
            timestamp: z.string(),
          })
        ).optional().default([]),
        userInfo: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          company: z.string().optional(),
          intent: z.enum(['sales', 'support', 'general']).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const context: ChatContext = {
        conversationHistory: input.conversationHistory.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
        userInfo: input.userInfo,
      };

      const response = await chatbotService.generateResponse(context, input.message);
      
      return {
        message: response,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Detect intent from user message
   */
  detectIntent: publicProcedure
    .input(z.object({
      message: z.string().min(1).max(1000),
    }))
    .mutation(async ({ input }) => {
      const intent = await chatbotService.detectIntent(input.message);
      return { intent };
    }),

  /**
   * Extract user information from conversation
   */
  extractUserInfo: publicProcedure
    .input(z.object({
      conversationHistory: z.array(
        z.object({
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
          timestamp: z.string(),
        })
      ),
    }))
    .mutation(async ({ input }) => {
      const messages = input.conversationHistory.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      
      const userInfo = await chatbotService.extractUserInfo(messages);
      return userInfo;
    }),

  /**
   * Generate suggested follow-up questions
   */
  getSuggestions: publicProcedure
    .input(z.object({
      conversationHistory: z.array(
        z.object({
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
          timestamp: z.string(),
        })
      ),
    }))
    .query(async ({ input }) => {
      const context: ChatContext = {
        conversationHistory: input.conversationHistory.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
      
      const suggestions = await chatbotService.generateSuggestions(context);
      return { suggestions };
    }),
});

