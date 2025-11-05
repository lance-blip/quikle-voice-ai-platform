import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { DatabaseAdapter } from "../execution-engine/db/database-adapter";
import { ExecutionOrchestrator } from "../execution-engine/core/execution-orchestrator";
import { ActionsService } from "../execution-engine/actions/actions-service";
import { eventBus } from "../execution-engine/core/event-bus";

// Initialize services (these would typically be singletons)
let orchestrator: ExecutionOrchestrator | null = null;

function getOrchestrator(): ExecutionOrchestrator {
  if (!orchestrator) {
    const dbAdapter = new DatabaseAdapter(process.env.DATABASE_URL!);
    const actionsService = new ActionsService();
    
    // TODO: Initialize voice and LLM services
    const voiceService = null;
    const llmService = null;
    
    orchestrator = new ExecutionOrchestrator(
      dbAdapter,
      voiceService,
      llmService,
      actionsService
    );
  }
  
  return orchestrator;
}

export const executionRouter = router({
  // Start execution of an agent flow
  startExecution: protectedProcedure
    .input(z.object({
      callId: z.string(),
      agentId: z.number(),
      clientId: z.number(),
      flowId: z.number(),
      callerMetadata: z.object({
        callerId: z.string().optional(),
        calledNumber: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      const orch = getOrchestrator();
      
      await orch.startExecution(
        input.callId,
        input.agentId,
        input.clientId,
        input.flowId,
        input.callerMetadata
      );
      
      return {
        success: true,
        callId: input.callId,
      };
    }),
  
  // Pause execution
  pauseExecution: protectedProcedure
    .input(z.object({
      callId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orch = getOrchestrator();
      orch.pauseExecution(input.callId);
      
      return {
        success: true,
      };
    }),
  
  // Resume execution
  resumeExecution: protectedProcedure
    .input(z.object({
      callId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orch = getOrchestrator();
      orch.resumeExecution(input.callId);
      
      return {
        success: true,
      };
    }),
  
  // End execution
  endExecution: protectedProcedure
    .input(z.object({
      callId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orch = getOrchestrator();
      await orch.endExecution(input.callId);
      
      return {
        success: true,
      };
    }),
  
  // Get execution context
  getExecutionContext: protectedProcedure
    .input(z.object({
      callId: z.string(),
    }))
    .query(async ({ input }) => {
      const orch = getOrchestrator();
      const context = orch.getExecutionContext(input.callId);
      
      return context;
    }),
  
  // Get call session details
  getCallSession: protectedProcedure
    .input(z.object({
      callId: z.string(),
    }))
    .query(async ({ input }) => {
      const dbAdapter = new DatabaseAdapter(process.env.DATABASE_URL!);
      const session = await dbAdapter.getCallSession(input.callId);
      
      return session;
    }),
  
  // Get call transcripts
  getCallTranscripts: protectedProcedure
    .input(z.object({
      callId: z.string(),
    }))
    .query(async ({ input }) => {
      const dbAdapter = new DatabaseAdapter(process.env.DATABASE_URL!);
      const transcripts = await dbAdapter.getCallTranscripts(input.callId);
      
      return transcripts;
    }),
  
  // Get call variables
  getCallVariables: protectedProcedure
    .input(z.object({
      callId: z.string(),
    }))
    .query(async ({ input }) => {
      const dbAdapter = new DatabaseAdapter(process.env.DATABASE_URL!);
      const variables = await dbAdapter.getCallVariables(input.callId);
      
      return variables;
    }),
  
  // Get call events (CDR)
  getCallEvents: protectedProcedure
    .input(z.object({
      callId: z.string(),
    }))
    .query(async ({ input }) => {
      const dbAdapter = new DatabaseAdapter(process.env.DATABASE_URL!);
      const events = await dbAdapter.getCallEvents(input.callId);
      
      return events;
    }),
  
  // Test flow execution (text-based simulation)
  testFlow: protectedProcedure
    .input(z.object({
      flowId: z.number(),
      flowDefinition: z.any(), // FlowDefinition type
      testInput: z.string(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement text-based flow testing
      // This would simulate the flow execution without actual voice
      
      return {
        success: true,
        result: {
          nodes: [],
          variables: {},
          transcript: [],
        },
      };
    }),
  
  // Get execution statistics
  getExecutionStats: protectedProcedure
    .query(async () => {
      const orch = getOrchestrator();
      
      return {
        activeExecutions: orch.getActiveExecutionCount(),
      };
    }),
});
