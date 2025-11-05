import { EventEmitter } from 'events';

export type EventType =
  | 'flow.started'
  | 'flow.completed'
  | 'flow.error'
  | 'node.started'
  | 'node.completed'
  | 'node.error'
  | 'variable.set'
  | 'variable.extracted'
  | 'action.started'
  | 'action.completed'
  | 'action.error'
  | 'call.started'
  | 'call.ended'
  | 'call.transferred'
  // Future call center events
  | 'call.queued'
  | 'call.dequeued'
  | 'call.parked'
  | 'agent.available'
  | 'agent.busy'
  | 'recording.started'
  | 'recording.stopped';

export interface Event {
  type: EventType;
  callId: string;
  timestamp: Date;
  data?: any;
}

export class ExecutionEventBus extends EventEmitter {
  private static instance: ExecutionEventBus;
  
  private constructor() {
    super();
    this.setMaxListeners(100); // Allow many listeners for extensibility
  }
  
  public static getInstance(): ExecutionEventBus {
    if (!ExecutionEventBus.instance) {
      ExecutionEventBus.instance = new ExecutionEventBus();
    }
    return ExecutionEventBus.instance;
  }
  
  public emitEvent(event: Event): void {
    this.emit(event.type, event);
    this.emit('*', event); // Wildcard listener for logging all events
  }
  
  public onEvent(eventType: EventType | '*', handler: (event: Event) => void | Promise<void>): void {
    this.on(eventType, handler);
  }
  
  public offEvent(eventType: EventType | '*', handler: (event: Event) => void | Promise<void>): void {
    this.off(eventType, handler);
  }
  
  public async waitForEvent(
    eventType: EventType,
    filter?: (event: Event) => boolean,
    timeout: number = 30000
  ): Promise<Event> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.off(eventType, handler);
        reject(new Error(`Timeout waiting for event: ${eventType}`));
      }, timeout);
      
      const handler = (event: Event) => {
        if (!filter || filter(event)) {
          clearTimeout(timeoutId);
          this.off(eventType, handler);
          resolve(event);
        }
      };
      
      this.on(eventType, handler);
    });
  }
}

// Export singleton instance
export const eventBus = ExecutionEventBus.getInstance();
