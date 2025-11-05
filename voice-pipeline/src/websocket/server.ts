import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { CallSession, WebSocketMessage } from '../../types';
import { SessionManager } from './session-manager';
import { logger } from '../utils/logger';

export class VoiceWebSocketServer {
  private wss: WebSocketServer;
  private sessionManager: SessionManager;
  
  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/voice-pipeline' });
    this.sessionManager = new SessionManager();
    
    this.wss.on('connection', this.handleConnection.bind(this));
    logger.info('WebSocket server initialized on /voice-pipeline');
  }
  
  private handleConnection(ws: WebSocket, req: any) {
    const callId = this.extractCallId(req.url);
    
    if (!callId) {
      logger.error('No call ID provided in WebSocket connection');
      ws.close(1008, 'Call ID required');
      return;
    }
    
    logger.info(`WebSocket connection established for call ${callId}`);
    
    // Register connection with session manager
    this.sessionManager.registerConnection(callId, ws);
    
    ws.on('message', async (data: Buffer) => {
      try {
        await this.handleMessage(callId, data, ws);
      } catch (error) {
        logger.error(`Error handling message for call ${callId}:`, error);
      }
    });
    
    ws.on('close', () => {
      logger.info(`WebSocket connection closed for call ${callId}`);
      this.sessionManager.unregisterConnection(callId);
    });
    
    ws.on('error', (error) => {
      logger.error(`WebSocket error for call ${callId}:`, error);
    });
  }
  
  private async handleMessage(callId: string, data: Buffer, ws: WebSocket) {
    try {
      // Try to parse as JSON (control messages)
      const message: WebSocketMessage = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'control':
          await this.handleControlMessage(callId, message);
          break;
        case 'event':
          await this.handleEventMessage(callId, message);
          break;
        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      // Not JSON, assume it's raw audio data
      await this.handleAudioData(callId, data);
    }
  }
  
  private async handleAudioData(callId: string, audioBuffer: Buffer) {
    const session = this.sessionManager.getSession(callId);
    
    if (!session) {
      logger.warn(`No session found for call ${callId}`);
      return;
    }
    
    // Add to incoming audio buffer
    session.incomingAudioBuffer.push(audioBuffer);
    
    // Forward to STT provider
    // This will be implemented when we integrate STT
    logger.debug(`Received ${audioBuffer.length} bytes of audio for call ${callId}`);
  }
  
  private async handleControlMessage(callId: string, message: WebSocketMessage) {
    logger.info(`Control message for call ${callId}:`, message.event);
    
    switch (message.event) {
      case 'start_call':
        await this.sessionManager.startCall(callId, message.data);
        break;
      case 'end_call':
        await this.sessionManager.endCall(callId);
        break;
      case 'mute':
        // Handle mute
        break;
      case 'unmute':
        // Handle unmute
        break;
      default:
        logger.warn(`Unknown control event: ${message.event}`);
    }
  }
  
  private async handleEventMessage(callId: string, message: WebSocketMessage) {
    logger.info(`Event message for call ${callId}:`, message.event);
    // Handle various event types
  }
  
  private extractCallId(url: string): string | null {
    const match = url.match(/[?&]callId=([^&]+)/);
    return match ? match[1] : null;
  }
  
  public sendAudioToCall(callId: string, audioBuffer: Buffer) {
    const ws = this.sessionManager.getConnection(callId);
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      logger.warn(`Cannot send audio to call ${callId}: connection not open`);
      return;
    }
    
    // Send raw audio data
    ws.send(audioBuffer);
  }
  
  public sendEvent(callId: string, event: string, data: any) {
    const ws = this.sessionManager.getConnection(callId);
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      logger.warn(`Cannot send event to call ${callId}: connection not open`);
      return;
    }
    
    const message: WebSocketMessage = {
      type: 'event',
      callId,
      event,
      data,
    };
    
    ws.send(JSON.stringify(message));
  }
  
  public getSessionManager(): SessionManager {
    return this.sessionManager;
  }
}
