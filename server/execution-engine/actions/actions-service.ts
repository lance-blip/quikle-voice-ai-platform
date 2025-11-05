import { ExecutionContext, ActionType } from '../core/execution-context';
import { WebhookAction } from './webhook-action';
import { ApiCallAction } from './api-call-action';
import { CrmLookupAction } from './crm-lookup-action';
import { SmsAction } from './sms-action';

export interface IActionHandler {
  execute(config: Record<string, any>, context: ExecutionContext): Promise<any>;
}

export class ActionsService {
  private handlers: Map<ActionType, IActionHandler>;
  
  constructor() {
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }
  
  private registerDefaultHandlers(): void {
    this.handlers.set('webhook', new WebhookAction());
    this.handlers.set('api_call', new ApiCallAction());
    this.handlers.set('crm_lookup', new CrmLookupAction());
    this.handlers.set('sms', new SmsAction());
    
    // Future call center actions
    // this.handlers.set('transfer_to_agent', new TransferToAgentAction());
    // this.handlers.set('transfer_to_group', new TransferToGroupAction());
    // this.handlers.set('start_recording', new StartRecordingAction());
    // this.handlers.set('stop_recording', new StopRecordingAction());
    // this.handlers.set('play_announcement', new PlayAnnouncementAction());
  }
  
  public registerHandler(actionType: ActionType, handler: IActionHandler): void {
    this.handlers.set(actionType, handler);
  }
  
  public async execute(
    actionType: ActionType,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<any> {
    const handler = this.handlers.get(actionType);
    
    if (!handler) {
      throw new Error(`No handler registered for action type: ${actionType}`);
    }
    
    return await handler.execute(config, context);
  }
}
