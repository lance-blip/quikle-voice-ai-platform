import { EventEmitter } from 'events';
import type { Database } from '../execution-engine/core/execution-context';

/**
 * Routing Engine
 * 
 * Evaluates routing rules and determines call destinations based on:
 * - Caller ID
 * - Time of day/week
 * - CRM data
 * - Agent availability
 * - Skills-based routing
 */
export class RoutingEngine extends EventEmitter {
  constructor(private db: Database) {
    super();
  }
  
  /**
   * Evaluate routing rules and determine destination
   */
  async route(
    clientId: number,
    callerId: string,
    metadata: Record<string, any> = {}
  ): Promise<RoutingDecision> {
    console.log(`[Routing Engine] Evaluating routes for caller ${callerId}`);
    
    // Load routing rules for client
    const rules = await this.loadRoutingRules(clientId);
    
    // Sort by priority (highest first)
    rules.sort((a, b) => b.priority - a.priority);
    
    // Evaluate each rule
    for (const rule of rules) {
      if (!rule.isActive) {
        continue;
      }
      
      const matches = await this.evaluateRule(rule, callerId, metadata);
      
      if (matches) {
        console.log(`[Routing Engine] Rule matched: ${rule.name}`);
        
        const decision: RoutingDecision = {
          ruleId: rule.id,
          ruleName: rule.name,
          destinationType: rule.destinationType,
          destinationId: rule.destinationId,
        };
        
        // Emit event
        this.emit('route.matched', {
          callerId,
          decision,
        });
        
        return decision;
      }
    }
    
    // No rule matched, return default routing
    console.log(`[Routing Engine] No rule matched, using default routing`);
    
    return {
      ruleId: null,
      ruleName: 'Default',
      destinationType: 'flow',
      destinationId: null,
    };
  }
  
  /**
   * Evaluate a single routing rule
   */
  private async evaluateRule(
    rule: RoutingRule,
    callerId: string,
    metadata: Record<string, any>
  ): Promise<boolean> {
    const conditions = rule.conditions as RoutingConditions;
    
    // Check caller ID condition
    if (conditions.caller_id) {
      if (!this.matchCallerID(callerId, conditions.caller_id)) {
        return false;
      }
    }
    
    // Check time of day condition
    if (conditions.time_of_day) {
      if (!this.matchTimeOfDay(conditions.time_of_day)) {
        return false;
      }
    }
    
    // Check day of week condition
    if (conditions.day_of_week) {
      if (!this.matchDayOfWeek(conditions.day_of_week)) {
        return false;
      }
    }
    
    // Check CRM data condition
    if (conditions.crm_field) {
      const crmData = await this.lookupCRM(callerId);
      if (!this.matchCRMField(crmData, conditions.crm_field)) {
        return false;
      }
    }
    
    // Check metadata condition
    if (conditions.metadata) {
      if (!this.matchMetadata(metadata, conditions.metadata)) {
        return false;
      }
    }
    
    // All conditions matched
    return true;
  }
  
  /**
   * Match caller ID against pattern
   */
  private matchCallerID(callerId: string, pattern: string): boolean {
    // Support wildcards: +1234* matches +12345678
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(callerId);
  }
  
  /**
   * Match time of day (e.g., "9-17" for 9am-5pm)
   */
  private matchTimeOfDay(timeRange: string): boolean {
    const [startStr, endStr] = timeRange.split('-');
    const start = parseInt(startStr);
    const end = parseInt(endStr);
    
    const now = new Date();
    const hour = now.getHours();
    
    return hour >= start && hour < end;
  }
  
  /**
   * Match day of week (e.g., "1-5" for Monday-Friday)
   */
  private matchDayOfWeek(dayRange: string): boolean {
    const [startStr, endStr] = dayRange.split('-');
    const start = parseInt(startStr);
    const end = parseInt(endStr);
    
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return day >= start && day <= end;
  }
  
  /**
   * Lookup caller in CRM
   */
  private async lookupCRM(callerId: string): Promise<Record<string, any> | null> {
    // TODO: Integrate with CRM APIs (Salesforce, HubSpot, etc.)
    console.log(`[Routing Engine] Looking up ${callerId} in CRM`);
    return null;
  }
  
  /**
   * Match CRM field condition
   */
  private matchCRMField(
    crmData: Record<string, any> | null,
    condition: { field: string; value: any }
  ): boolean {
    if (!crmData) {
      return false;
    }
    
    return crmData[condition.field] === condition.value;
  }
  
  /**
   * Match metadata condition
   */
  private matchMetadata(
    metadata: Record<string, any>,
    condition: Record<string, any>
  ): boolean {
    for (const [key, value] of Object.entries(condition)) {
      if (metadata[key] !== value) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Load routing rules from database
   */
  private async loadRoutingRules(clientId: number): Promise<RoutingRule[]> {
    // TODO: Load from database
    // For now, return empty array
    return [];
  }
}

// Types
export interface RoutingRule {
  id: number;
  clientId: number;
  name: string;
  priority: number;
  conditions: RoutingConditions;
  destinationType: 'agent' | 'queue' | 'flow' | 'voicemail';
  destinationId: number | null;
  isActive: boolean;
}

export interface RoutingConditions {
  caller_id?: string;
  time_of_day?: string;
  day_of_week?: string;
  crm_field?: { field: string; value: any };
  metadata?: Record<string, any>;
}

export interface RoutingDecision {
  ruleId: number | null;
  ruleName: string;
  destinationType: string;
  destinationId: number | null;
}
