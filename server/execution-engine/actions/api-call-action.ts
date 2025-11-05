import { IActionHandler } from './actions-service';
import { ExecutionContext } from '../core/execution-context';
import axios from 'axios';

export interface ApiCallConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  auth?: {
    type: 'bearer' | 'basic' | 'api_key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  timeout?: number;
}

export class ApiCallAction implements IActionHandler {
  async execute(config: ApiCallConfig, context: ExecutionContext): Promise<any> {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      params,
      auth,
      timeout = 10000,
    } = config;
    
    if (!url) {
      throw new Error('API URL is required');
    }
    
    try {
      // Prepare headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'VoiceForge/1.0',
        ...headers,
      };
      
      // Add authentication
      if (auth) {
        if (auth.type === 'bearer' && auth.token) {
          requestHeaders['Authorization'] = `Bearer ${auth.token}`;
        } else if (auth.type === 'api_key' && auth.apiKey) {
          const headerName = auth.apiKeyHeader || 'X-API-Key';
          requestHeaders[headerName] = auth.apiKey;
        }
      }
      
      // Make HTTP request
      const response = await axios({
        method,
        url,
        headers: requestHeaders,
        data: body,
        params,
        auth: auth?.type === 'basic' ? {
          username: auth.username || '',
          password: auth.password || '',
        } : undefined,
        timeout,
      });
      
      console.log(`[API Call Action] ${method} ${url} - Status: ${response.status}`);
      
      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[API Call Action] Error: ${error.message}`);
        throw new Error(`API call failed: ${error.message}`);
      }
      throw error;
    }
  }
}
