import Cartesia from '@cartesia/cartesia-js';
import { TTSProvider, AudioCallback } from '../../types';
import { config } from '../../config';
import { logger } from '../utils/logger';

export class CartesiaTTSService implements TTSProvider {
  private client: any;
  private isMock: boolean;
  
  constructor() {
    this.isMock = config.cartesiaApiKey.includes('placeholder');
    
    if (!this.isMock) {
      this.client = new Cartesia({
        apiKey: config.cartesiaApiKey
      });
      logger.info('Cartesia TTS service initialized');
    } else {
      logger.warn('Cartesia TTS service running in mock mode (no API key)');
    }
  }
  
  async synthesize(
    text: string,
    voiceId: string,
    onAudio: AudioCallback
  ): Promise<void> {
    if (this.isMock) {
      return this.mockSynthesize(text, voiceId, onAudio);
    }
    
    try {
      logger.debug(`Synthesizing text (${text.length} chars) with voice ${voiceId}`);
      
      const response = await this.client.tts.bytes({
        model_id: 'sonic-english',
        voice: { id: voiceId || 'default' },
        transcript: text,
        output_format: {
          container: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: 16000,
        },
      });
      
      // Stream audio chunks as they arrive
      for await (const chunk of response) {
        onAudio(Buffer.from(chunk));
      }
      
      logger.debug('TTS synthesis complete');
    } catch (error) {
      logger.error('Error synthesizing speech:', error);
      throw error;
    }
  }
  
  async synthesizeStream(
    text: string,
    voiceId: string
  ): Promise<ReadableStream> {
    if (this.isMock) {
      throw new Error('Mock TTS does not support streaming');
    }
    
    try {
      const ws = await this.client.tts.websocket({
        model_id: 'sonic-english',
        voice: { id: voiceId || 'default' },
        output_format: {
          container: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: 16000,
        },
      });
      
      ws.send({ text });
      return ws.stream();
    } catch (error) {
      logger.error('Error creating TTS stream:', error);
      throw error;
    }
  }
  
  private async mockSynthesize(
    text: string,
    voiceId: string,
    onAudio: AudioCallback
  ): Promise<void> {
    logger.debug(`Mock TTS: Synthesizing "${text.substring(0, 50)}..."`);
    
    // Generate mock audio data (silence)
    // In a real implementation, this would be actual audio
    const sampleRate = 16000;
    const duration = Math.max(1, text.length * 0.05); // ~50ms per character
    const samples = Math.floor(sampleRate * duration);
    const buffer = Buffer.alloc(samples * 2); // 16-bit PCM
    
    // Send in chunks to simulate streaming
    const chunkSize = 3200; // 100ms chunks at 16kHz
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, Math.min(i + chunkSize, buffer.length));
      onAudio(chunk);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.debug('Mock TTS synthesis complete');
  }
}

// Alternative: ElevenLabs TTS Service
export class ElevenLabsTTSService implements TTSProvider {
  constructor() {
    logger.warn('ElevenLabs TTS service not yet implemented');
  }
  
  async synthesize(
    text: string,
    voiceId: string,
    onAudio: AudioCallback
  ): Promise<void> {
    throw new Error('ElevenLabs TTS not implemented');
  }
  
  async synthesizeStream(
    text: string,
    voiceId: string
  ): Promise<ReadableStream> {
    throw new Error('ElevenLabs TTS not implemented');
  }
}

// Factory function
export function createTTSService(provider: 'cartesia' | 'elevenlabs' = 'cartesia'): TTSProvider {
  switch (provider) {
    case 'cartesia':
      return new CartesiaTTSService();
    case 'elevenlabs':
      return new ElevenLabsTTSService();
    default:
      throw new Error(`Unknown TTS provider: ${provider}`);
  }
}
