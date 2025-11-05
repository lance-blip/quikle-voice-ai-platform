import { createClient, LiveTranscriptionEvents, LiveClient } from '@deepgram/sdk';
import { STTProvider, TranscriptCallback } from '../../types';
import { config } from '../../config';
import { logger } from '../utils/logger';

export class DeepgramSTTService implements STTProvider {
  private deepgram: any;
  private connections: Map<string, any> = new Map();
  
  constructor() {
    // Only initialize if API key is not placeholder
    if (config.deepgramApiKey && !config.deepgramApiKey.includes('placeholder')) {
      this.deepgram = createClient(config.deepgramApiKey);
      logger.info('Deepgram STT service initialized');
    } else {
      logger.warn('Deepgram STT service running in mock mode (no API key)');
    }
  }
  
  async startStream(callId: string, onTranscript: TranscriptCallback): Promise<any> {
    if (!this.deepgram) {
      logger.warn(`Mock STT: Starting stream for call ${callId}`);
      return this.createMockConnection(callId, onTranscript);
    }
    
    try {
      const connection = this.deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        endpointing: 300,  // ms of silence before finalizing
        vad_events: true,   // Voice Activity Detection
        punctuate: true,
        diarize: false,     // Speaker diarization (not needed for single caller)
      });
      
      connection.on(LiveTranscriptionEvents.Open, () => {
        logger.info(`Deepgram connection opened for call ${callId}`);
      });
      
      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives[0]?.transcript;
        const isFinal = data.is_final;
        
        if (transcript && transcript.trim().length > 0) {
          logger.debug(`Transcript for call ${callId} (final: ${isFinal}): ${transcript}`);
          onTranscript(transcript, isFinal);
        }
      });
      
      connection.on(LiveTranscriptionEvents.Metadata, (data: any) => {
        logger.debug(`Deepgram metadata for call ${callId}:`, data);
      });
      
      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        logger.error(`Deepgram error for call ${callId}:`, error);
      });
      
      connection.on(LiveTranscriptionEvents.Close, () => {
        logger.info(`Deepgram connection closed for call ${callId}`);
        this.connections.delete(callId);
      });
      
      this.connections.set(callId, connection);
      return connection;
    } catch (error) {
      logger.error(`Failed to start Deepgram stream for call ${callId}:`, error);
      throw error;
    }
  }
  
  sendAudio(connection: any, audioBuffer: Buffer): void {
    if (!connection) {
      return;
    }
    
    if (connection.isMock) {
      // Mock mode: simulate transcription after delay
      setTimeout(() => {
        connection.mockCallback('Hello, this is a test', false);
        setTimeout(() => {
          connection.mockCallback('Hello, this is a test.', true);
        }, 500);
      }, 1000);
      return;
    }
    
    try {
      connection.send(audioBuffer);
    } catch (error) {
      logger.error('Error sending audio to Deepgram:', error);
    }
  }
  
  stopStream(connection: any): void {
    if (!connection) {
      return;
    }
    
    if (connection.isMock) {
      logger.info('Mock STT: Stopping stream');
      return;
    }
    
    try {
      connection.finish();
    } catch (error) {
      logger.error('Error stopping Deepgram stream:', error);
    }
  }
  
  private createMockConnection(callId: string, onTranscript: TranscriptCallback): any {
    logger.info(`Creating mock STT connection for call ${callId}`);
    
    return {
      isMock: true,
      mockCallback: onTranscript,
      send: (data: Buffer) => {
        // Simulate transcription
        logger.debug(`Mock STT received ${data.length} bytes`);
      },
      finish: () => {
        logger.info('Mock STT connection finished');
      },
    };
  }
  
  getConnectionCount(): number {
    return this.connections.size;
  }
}

// Alternative: AssemblyAI STT Service
export class AssemblyAISTTService implements STTProvider {
  constructor() {
    logger.warn('AssemblyAI STT service not yet implemented');
  }
  
  async startStream(callId: string, onTranscript: TranscriptCallback): Promise<any> {
    throw new Error('AssemblyAI STT not implemented');
  }
  
  sendAudio(connection: any, audioBuffer: Buffer): void {
    throw new Error('AssemblyAI STT not implemented');
  }
  
  stopStream(connection: any): void {
    throw new Error('AssemblyAI STT not implemented');
  }
}

// Factory function
export function createSTTService(provider: 'deepgram' | 'assemblyai' = 'deepgram'): STTProvider {
  switch (provider) {
    case 'deepgram':
      return new DeepgramSTTService();
    case 'assemblyai':
      return new AssemblyAISTTService();
    default:
      throw new Error(`Unknown STT provider: ${provider}`);
  }
}
