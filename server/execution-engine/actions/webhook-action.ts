import { IActionHandler } from './actions-service';
import { ExecutionContext } from '../core/execution-context';
import axios from 'axios';

export interface WebhookConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export class WebhookAction implements IActionHandler {
  async execute(config: WebhookConfig, context: ExecutionContext): Promise<any> {
    const {
      url,
      method = 'POST',
      headers = {},
      body = {},
      timeout = 10000,
    } = config;
    
    if (!url) {
      throw new Error('Webhook URL is required');
    }
    
    try {
      // Prepare request data
      const requestData = {
        callId: context.callId,
        agentId: context.agentId,
        clientId: context.clientId,
        variables: context.variables,
        conversationHistory: context.conversationHistory,
        ...body,
      };
      
      // Make HTTP request
      const response = await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'VoiceForge/1.0',
          ...headers,
        },
        data: method !== 'GET' ? requestData : undefined,
        params: method === 'GET' ? requestData : undefined,
        timeout,
      });
      
      console.log(`[Webhook Action] ${method} ${url} - Status: ${response.status}`);
      
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[Webhook Action] Error: ${error.message}`);
        throw new Error(`Webhook failed: ${error.message}`);
      }
      throw error;
    }
  }
}
