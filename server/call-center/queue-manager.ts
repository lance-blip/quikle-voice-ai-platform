import { EventEmitter } from 'events';
import type { Database } from '../execution-engine/core/execution-context';

/**
 * Queue Manager
 * 
 * Manages call queues, including adding/removing calls, position tracking,
 * overflow handling, and queue statistics.
 */
export class QueueManager extends EventEmitter {
  private queues: Map<number, QueueState> = new Map();
  
  constructor(private db: Database) {
    super();
  }
  
  /**
   * Add a call to a queue
   */
  async enqueue(
    queueId: number,
    callSessionId: string,
    priority: number = 0
  ): Promise<QueueEntry> {
    // Get or create queue state
    let queueState = this.queues.get(queueId);
    
    if (!queueState) {
      // Load queue configuration from database
      const queueConfig = await this.loadQueueConfig(queueId);
      queueState = {
        id: queueId,
        entries: [],
        config: queueConfig,
      };
      this.queues.set(queueId, queueState);
    }
    
    // Calculate position
    const position = queueState.entries.length + 1;
    
    // Create queue entry
    const entry: QueueEntry = {
      queueId,
      callSessionId,
      position,
      priority,
      enteredAt: new Date(),
    };
    
    // Add to queue
    queueState.entries.push(entry);
    
    // Sort by priority (higher priority first)
    queueState.entries.sort((a, b) => b.priority - a.priority);
    
    // Update positions
    this.updatePositions(queueState);
    
    // Log to database
    await this.db.logEvent(callSessionId, 'call.queued', {
      queueId,
      position: entry.position,
    });
    
    // Emit event
    this.emit('call.queued', {
      queueId,
      callSessionId,
      position: entry.position,
    });
    
    console.log(`[Queue Manager] Call ${callSessionId} added to queue ${queueId} at position ${entry.position}`);
    
    return entry;
  }
  
  /**
   * Remove a call from a queue
   */
  async dequeue(
    queueId: number,
    callSessionId: string,
    reason: 'answered' | 'timeout' | 'abandoned'
  ): Promise<void> {
    const queueState = this.queues.get(queueId);
    
    if (!queueState) {
      console.warn(`[Queue Manager] Queue ${queueId} not found`);
      return;
    }
    
    // Find entry
    const entryIndex = queueState.entries.findIndex(
      e => e.callSessionId === callSessionId
    );
    
    if (entryIndex === -1) {
      console.warn(`[Queue Manager] Call ${callSessionId} not found in queue ${queueId}`);
      return;
    }
    
    const entry = queueState.entries[entryIndex];
    
    // Calculate wait time
    const waitTimeSeconds = Math.floor(
      (Date.now() - entry.enteredAt.getTime()) / 1000
    );
    
    // Remove from queue
    queueState.entries.splice(entryIndex, 1);
    
    // Update positions
    this.updatePositions(queueState);
    
    // Log to database
    await this.db.logEvent(callSessionId, 'call.dequeued', {
      queueId,
      reason,
      waitTimeSeconds,
    });
    
    // Emit event
    this.emit('call.dequeued', {
      queueId,
      callSessionId,
      reason,
      waitTimeSeconds,
    });
    
    console.log(`[Queue Manager] Call ${callSessionId} removed from queue ${queueId} (${reason}) after ${waitTimeSeconds}s`);
  }
  
  /**
   * Get the next call from a queue
   */
  async getNextCall(queueId: number): Promise<QueueEntry | null> {
    const queueState = this.queues.get(queueId);
    
    if (!queueState || queueState.entries.length === 0) {
      return null;
    }
    
    // Return the first entry (highest priority, earliest arrival)
    return queueState.entries[0];
  }
  
  /**
   * Get queue position for a call
   */
  getPosition(queueId: number, callSessionId: string): number | null {
    const queueState = this.queues.get(queueId);
    
    if (!queueState) {
      return null;
    }
    
    const entry = queueState.entries.find(e => e.callSessionId === callSessionId);
    return entry ? entry.position : null;
  }
  
  /**
   * Get queue statistics
   */
  getQueueStats(queueId: number): QueueStats | null {
    const queueState = this.queues.get(queueId);
    
    if (!queueState) {
      return null;
    }
    
    const now = Date.now();
    const waitTimes = queueState.entries.map(
      e => Math.floor((now - e.enteredAt.getTime()) / 1000)
    );
    
    return {
      queueId,
      callsWaiting: queueState.entries.length,
      longestWaitTimeSeconds: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
      averageWaitTimeSeconds: waitTimes.length > 0
        ? Math.floor(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
        : 0,
    };
  }
  
  /**
   * Check for timeout calls and handle overflow
   */
  async processTimeouts(): Promise<void> {
    const now = Date.now();
    
    for (const [queueId, queueState] of this.queues.entries()) {
      const maxWaitTime = queueState.config.maxWaitTimeSeconds * 1000;
      
      for (const entry of queueState.entries) {
        const waitTime = now - entry.enteredAt.getTime();
        
        if (waitTime >= maxWaitTime) {
          console.log(`[Queue Manager] Call ${entry.callSessionId} timed out in queue ${queueId}`);
          
          // Remove from queue
          await this.dequeue(queueId, entry.callSessionId, 'timeout');
          
          // Handle overflow
          await this.handleOverflow(queueState.config, entry.callSessionId);
        }
      }
    }
  }
  
  /**
   * Handle overflow action
   */
  private async handleOverflow(
    config: QueueConfig,
    callSessionId: string
  ): Promise<void> {
    console.log(`[Queue Manager] Handling overflow for call ${callSessionId}: ${config.overflowAction}`);
    
    // Emit overflow event
    this.emit('call.overflow', {
      callSessionId,
      action: config.overflowAction,
      destination: config.overflowDestination,
    });
    
    // The execution engine will handle the actual overflow action
    // (e.g., transfer to voicemail, transfer to another number, hangup)
  }
  
  /**
   * Update positions for all entries in a queue
   */
  private updatePositions(queueState: QueueState): void {
    queueState.entries.forEach((entry, index) => {
      entry.position = index + 1;
    });
  }
  
  /**
   * Load queue configuration from database
   */
  private async loadQueueConfig(queueId: number): Promise<QueueConfig> {
    // TODO: Load from database
    // For now, return default config
    return {
      maxWaitTimeSeconds: 300, // 5 minutes
      overflowAction: 'voicemail',
      overflowDestination: null,
      holdMusicUrl: null,
    };
  }
}

// Types
export interface QueueEntry {
  queueId: number;
  callSessionId: string;
  position: number;
  priority: number;
  enteredAt: Date;
}

export interface QueueState {
  id: number;
  entries: QueueEntry[];
  config: QueueConfig;
}

export interface QueueConfig {
  maxWaitTimeSeconds: number;
  overflowAction: 'voicemail' | 'transfer' | 'hangup';
  overflowDestination: string | null;
  holdMusicUrl: string | null;
}

export interface QueueStats {
  queueId: number;
  callsWaiting: number;
  longestWaitTimeSeconds: number;
  averageWaitTimeSeconds: number;
}
