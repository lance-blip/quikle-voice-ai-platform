import { EventEmitter } from 'events';
import type { Database } from '../execution-engine/core/execution-context';

/**
 * Recording Service
 * 
 * Handles call recording, storage, and playback.
 * Supports both automatic and on-demand recording.
 */
export class RecordingService extends EventEmitter {
  private activeRecordings: Map<string, Recording> = new Map();
  
  constructor(private db: Database) {
    super();
  }
  
  /**
   * Start recording a call
   */
  async startRecording(
    callSessionId: string,
    mode: 'full' | 'partial' = 'full'
  ): Promise<Recording> {
    console.log(`[Recording] Starting ${mode} recording for call ${callSessionId}`);
    
    const recording: Recording = {
      callSessionId,
      mode,
      startTime: new Date(),
      audioChunks: [],
      isPaused: false,
    };
    
    this.activeRecordings.set(callSessionId, recording);
    
    // Log event
    await this.db.logEvent(callSessionId, 'recording.started', {
      mode,
    });
    
    // Emit event
    this.emit('recording.started', {
      callSessionId,
      mode,
    });
    
    return recording;
  }
  
  /**
   * Pause recording
   */
  async pauseRecording(callSessionId: string): Promise<void> {
    const recording = this.activeRecordings.get(callSessionId);
    
    if (!recording) {
      console.warn(`[Recording] No active recording for call ${callSessionId}`);
      return;
    }
    
    recording.isPaused = true;
    
    console.log(`[Recording] Paused recording for call ${callSessionId}`);
    
    // Log event
    await this.db.logEvent(callSessionId, 'recording.paused', {});
    
    // Emit event
    this.emit('recording.paused', { callSessionId });
  }
  
  /**
   * Resume recording
   */
  async resumeRecording(callSessionId: string): Promise<void> {
    const recording = this.activeRecordings.get(callSessionId);
    
    if (!recording) {
      console.warn(`[Recording] No active recording for call ${callSessionId}`);
      return;
    }
    
    recording.isPaused = false;
    
    console.log(`[Recording] Resumed recording for call ${callSessionId}`);
    
    // Log event
    await this.db.logEvent(callSessionId, 'recording.resumed', {});
    
    // Emit event
    this.emit('recording.resumed', { callSessionId });
  }
  
  /**
   * Add audio chunk to recording
   */
  async addAudioChunk(
    callSessionId: string,
    audioChunk: Buffer
  ): Promise<void> {
    const recording = this.activeRecordings.get(callSessionId);
    
    if (!recording || recording.isPaused) {
      return;
    }
    
    recording.audioChunks.push(audioChunk);
  }
  
  /**
   * Stop recording and save to storage
   */
  async stopRecording(callSessionId: string): Promise<string> {
    const recording = this.activeRecordings.get(callSessionId);
    
    if (!recording) {
      console.warn(`[Recording] No active recording for call ${callSessionId}`);
      return '';
    }
    
    console.log(`[Recording] Stopping recording for call ${callSessionId}`);
    
    const endTime = new Date();
    const durationSeconds = Math.floor(
      (endTime.getTime() - recording.startTime.getTime()) / 1000
    );
    
    // Merge audio chunks
    const audioBuffer = Buffer.concat(recording.audioChunks);
    
    // Upload to storage
    const recordingUrl = await this.uploadRecording(
      callSessionId,
      audioBuffer
    );
    
    // Update call session with recording URL
    await this.db.updateCallSession(callSessionId, {
      recordingUrl,
    });
    
    // Remove from active recordings
    this.activeRecordings.delete(callSessionId);
    
    // Log event
    await this.db.logEvent(callSessionId, 'recording.stopped', {
      recordingUrl,
      durationSeconds,
    });
    
    // Emit event
    this.emit('recording.stopped', {
      callSessionId,
      recordingUrl,
      durationSeconds,
    });
    
    return recordingUrl;
  }
  
  /**
   * Check if call is being recorded
   */
  isRecording(callSessionId: string): boolean {
    const recording = this.activeRecordings.get(callSessionId);
    return recording !== undefined && !recording.isPaused;
  }
  
  /**
   * Upload recording to storage
   */
  private async uploadRecording(
    callSessionId: string,
    audioBuffer: Buffer
  ): Promise<string> {
    // TODO: Upload to S3 or local storage
    // For now, return a mock URL
    const filename = `recording_${callSessionId}_${Date.now()}.wav`;
    const url = `https://recordings.voiceforge.com/calls/${filename}`;
    
    console.log(`[Recording] Uploaded recording to ${url} (${audioBuffer.length} bytes)`);
    
    return url;
  }
  
  /**
   * Delete recording from storage
   */
  async deleteRecording(recordingUrl: string): Promise<void> {
    // TODO: Delete from S3 or local storage
    console.log(`[Recording] Deleted recording ${recordingUrl}`);
    
    this.emit('recording.deleted', { recordingUrl });
  }
}

// Types
export interface Recording {
  callSessionId: string;
  mode: 'full' | 'partial';
  startTime: Date;
  audioChunks: Buffer[];
  isPaused: boolean;
}
