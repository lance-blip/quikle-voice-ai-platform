import { STTService } from '../../../voice-pipeline/src/services/stt-service';
import { TTSService } from '../../../voice-pipeline/src/services/tts-service';
import { SessionManager } from '../../../voice-pipeline/src/websocket/session-manager';

/**
 * Voice Service Adapter
 * 
 * Bridges the execution engine with the voice pipeline services.
 * Provides a unified interface for voice operations during flow execution.
 */
export class VoiceServiceAdapter {
  constructor(
    private sttService: STTService,
    private ttsService: TTSService,
    private sessionManager: SessionManager
  ) {}
  
  /**
   * Speak a message to the caller
   */
  async speak(callId: string, text: string, voiceId?: string): Promise<void> {
    const session = this.sessionManager.getSession(callId);
    
    if (!session) {
      throw new Error(`Session not found: ${callId}`);
    }
    
    // Generate speech audio
    const audioChunks = await this.ttsService.synthesize(text, voiceId);
    
    // Send audio to caller via WebSocket
    for (const chunk of audioChunks) {
      session.sendAudio(chunk);
    }
  }
  
  /**
   * Listen for caller input
   */
  async listen(callId: string): Promise<{ text: string; confidence: number }> {
    const session = this.sessionManager.getSession(callId);
    
    if (!session) {
      throw new Error(`Session not found: ${callId}`);
    }
    
    return new Promise((resolve, reject) => {
      // Set up STT listener
      const timeout = setTimeout(() => {
        reject(new Error('Listen timeout'));
      }, 30000); // 30 second timeout
      
      // Wait for transcription
      const handleTranscript = (transcript: { text: string; confidence: number; isFinal: boolean }) => {
        if (transcript.isFinal) {
          clearTimeout(timeout);
          session.off('transcript', handleTranscript);
          resolve({
            text: transcript.text,
            confidence: transcript.confidence,
          });
        }
      };
      
      session.on('transcript', handleTranscript);
    });
  }
  
  /**
   * Transfer the call to another number
   */
  async transfer(callId: string, targetNumber: string): Promise<void> {
    const session = this.sessionManager.getSession(callId);
    
    if (!session) {
      throw new Error(`Session not found: ${callId}`);
    }
    
    // TODO: Implement SIP transfer via FreeSWITCH
    // For now, just log the transfer
    console.log(`[Voice Service] Transferring call ${callId} to ${targetNumber}`);
    
    // Send transfer command to SIP server
    // This would typically use FreeSWITCH ESL or similar
  }
  
  /**
   * Hang up the call
   */
  async hangup(callId: string): Promise<void> {
    const session = this.sessionManager.getSession(callId);
    
    if (!session) {
      throw new Error(`Session not found: ${callId}`);
    }
    
    // Close the WebSocket connection
    session.close();
    
    // Remove session from manager
    this.sessionManager.removeSession(callId);
    
    console.log(`[Voice Service] Call ended: ${callId}`);
  }
  
  /**
   * Start recording the call
   */
  async startRecording(callId: string): Promise<void> {
    const session = this.sessionManager.getSession(callId);
    
    if (!session) {
      throw new Error(`Session not found: ${callId}`);
    }
    
    // TODO: Implement call recording
    console.log(`[Voice Service] Recording started: ${callId}`);
  }
  
  /**
   * Stop recording the call
   */
  async stopRecording(callId: string): Promise<string> {
    const session = this.sessionManager.getSession(callId);
    
    if (!session) {
      throw new Error(`Session not found: ${callId}`);
    }
    
    // TODO: Implement call recording
    console.log(`[Voice Service] Recording stopped: ${callId}`);
    
    return `https://recordings.voiceforge.com/${callId}.wav`;
  }
  
  /**
   * Play an announcement/audio file
   */
  async playAnnouncement(callId: string, audioUrl: string): Promise<void> {
    const session = this.sessionManager.getSession(callId);
    
    if (!session) {
      throw new Error(`Session not found: ${callId}`);
    }
    
    // TODO: Fetch audio file and stream to caller
    console.log(`[Voice Service] Playing announcement: ${audioUrl}`);
  }
}
