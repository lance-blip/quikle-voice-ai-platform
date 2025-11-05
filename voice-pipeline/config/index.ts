import dotenv from 'dotenv';
import { VoicePipelineConfig } from '../types';

// Load environment variables
dotenv.config();

export const config: VoicePipelineConfig = {
  port: parseInt(process.env.PORT || '8080', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  
  // STT
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || 'placeholder_deepgram_key',
  
  // LLM
  openaiApiKey: process.env.OPENAI_API_KEY || 'placeholder_openai_key',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  
  // TTS
  cartesiaApiKey: process.env.CARTESIA_API_KEY || 'placeholder_cartesia_key',
  
  // FreeSWITCH
  freeswitchEslHost: process.env.FREESWITCH_ESL_HOST || 'localhost',
  freeswitchEslPort: parseInt(process.env.FREESWITCH_ESL_PORT || '8021', 10),
  freeswitchEslPassword: process.env.FREESWITCH_ESL_PASSWORD || 'ClueCon',
  
  // Saicom
  saicomSipDomain: process.env.SAICOM_SIP_DOMAIN || 'sip.saicom.io',
  saicomUsername: process.env.SAICOM_USERNAME || 'placeholder_username',
  saicomPassword: process.env.SAICOM_PASSWORD || 'placeholder_password',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required configuration
export function validateConfig(): void {
  const errors: string[] = [];
  
  if (!config.databaseUrl) {
    errors.push('DATABASE_URL is required');
  }
  
  if (errors.length > 0) {
    console.warn('Configuration warnings:');
    errors.forEach(err => console.warn(`  - ${err}`));
    console.warn('Using placeholder values for development. Replace with real credentials before production.');
  }
}
