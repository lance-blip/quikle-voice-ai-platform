import { EventEmitter } from 'events';
import type { Database } from '../execution-engine/core/execution-context';

/**
 * Agent Status Manager
 * 
 * Tracks real-time agent availability and manages agent groups.
 * Supports skills-based routing and load balancing.
 */
export class AgentStatusManager extends EventEmitter {
  constructor(private db: Database) {
    super();
  }
  
  /**
   * Update agent status
   */
  async updateStatus(
    userId: number,
    status: AgentStatus
  ): Promise<void> {
    console.log(`[Agent Status] User ${userId} status changed to ${status}`);
    
    // TODO: Update in database
    // await this.db.updateAgentStatus(userId, status);
    
    // Emit event
    this.emit('status.changed', {
      userId,
      status,
      timestamp: new Date(),
    });
  }
  
  /**
   * Assign call to agent
   */
  async assignCall(
    userId: number,
    callSessionId: string
  ): Promise<void> {
    console.log(`[Agent Status] Assigning call ${callSessionId} to user ${userId}`);
    
    // Update agent status to busy
    await this.updateStatus(userId, 'busy');
    
    // Update call session
    await this.db.updateCallSession(callSessionId, {
      assignedAgentId: userId,
    });
    
    // Log event
    await this.db.logEvent(callSessionId, 'call.assigned', {
      userId,
    });
    
    // Emit event
    this.emit('call.assigned', {
      userId,
      callSessionId,
    });
  }
  
  /**
   * Unassign call from agent
   */
  async unassignCall(
    userId: number,
    callSessionId: string
  ): Promise<void> {
    console.log(`[Agent Status] Unassigning call ${callSessionId} from user ${userId}`);
    
    // Update agent status to available
    await this.updateStatus(userId, 'available');
    
    // Update call session
    await this.db.updateCallSession(callSessionId, {
      assignedAgentId: null,
    });
    
    // Log event
    await this.db.logEvent(callSessionId, 'call.unassigned', {
      userId,
    });
    
    // Emit event
    this.emit('call.unassigned', {
      userId,
      callSessionId,
    });
  }
  
  /**
   * Get available agents in a group
   */
  async getAvailableAgents(
    agentGroupId: number,
    requiredSkills: string[] = []
  ): Promise<AgentInfo[]> {
    console.log(`[Agent Status] Getting available agents in group ${agentGroupId}`);
    
    // TODO: Query database for available agents
    // Filter by skills if specified
    // Return sorted by priority or least busy
    
    return [];
  }
  
  /**
   * Get next available agent using routing strategy
   */
  async getNextAgent(
    agentGroupId: number,
    strategy: RoutingStrategy = 'round_robin',
    requiredSkills: string[] = []
  ): Promise<AgentInfo | null> {
    const availableAgents = await this.getAvailableAgents(agentGroupId, requiredSkills);
    
    if (availableAgents.length === 0) {
      return null;
    }
    
    switch (strategy) {
      case 'round_robin':
        // Return first available agent
        return availableAgents[0];
      
      case 'least_busy':
        // Return agent with least active calls
        return availableAgents.sort((a, b) => a.activeCalls - b.activeCalls)[0];
      
      case 'skills_based':
        // Return agent with best skill match
        return this.findBestSkillMatch(availableAgents, requiredSkills);
      
      default:
        return availableAgents[0];
    }
  }
  
  /**
   * Find agent with best skill match
   */
  private findBestSkillMatch(
    agents: AgentInfo[],
    requiredSkills: string[]
  ): AgentInfo {
    // Calculate skill match score for each agent
    const scored = agents.map(agent => {
      const matchCount = requiredSkills.filter(
        skill => agent.skills.includes(skill)
      ).length;
      
      return {
        agent,
        score: matchCount,
      };
    });
    
    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].agent;
  }
  
  /**
   * Get agent statistics
   */
  async getAgentStats(userId: number): Promise<AgentStats> {
    console.log(`[Agent Status] Getting stats for user ${userId}`);
    
    // TODO: Query database for agent statistics
    
    return {
      userId,
      totalCalls: 0,
      totalDurationSeconds: 0,
      averageDurationSeconds: 0,
      activeCalls: 0,
      status: 'offline',
    };
  }
  
  /**
   * Get group statistics
   */
  async getGroupStats(agentGroupId: number): Promise<GroupStats> {
    console.log(`[Agent Status] Getting stats for group ${agentGroupId}`);
    
    // TODO: Query database for group statistics
    
    return {
      agentGroupId,
      totalAgents: 0,
      availableAgents: 0,
      busyAgents: 0,
      awayAgents: 0,
      offlineAgents: 0,
      activeCalls: 0,
    };
  }
}

// Types
export type AgentStatus = 'available' | 'busy' | 'away' | 'offline';
export type RoutingStrategy = 'round_robin' | 'least_busy' | 'skills_based';

export interface AgentInfo {
  userId: number;
  name: string;
  status: AgentStatus;
  skills: string[];
  priority: number;
  activeCalls: number;
}

export interface AgentStats {
  userId: number;
  totalCalls: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  activeCalls: number;
  status: AgentStatus;
}

export interface GroupStats {
  agentGroupId: number;
  totalAgents: number;
  availableAgents: number;
  busyAgents: number;
  awayAgents: number;
  offlineAgents: number;
  activeCalls: number;
}
