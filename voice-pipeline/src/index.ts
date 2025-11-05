import express from 'express';
import { createServer } from 'http';
import { config, validateConfig } from '../config';
import { VoiceWebSocketServer } from './websocket/server';
import { logger } from './utils/logger';

// Validate configuration
validateConfig();

// Create Express app
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Stats endpoint
app.get('/stats', (req, res) => {
  const sessionManager = wsServer.getSessionManager();
  const activeSessions = sessionManager.getAllActiveSessions();
  
  res.json({
    activeCalls: activeSessions.length,
    totalSessions: sessionManager.getSessionCount(),
    sessions: activeSessions.map(s => ({
      id: s.id,
      agentId: s.agentId,
      clientId: s.clientId,
      status: s.status,
      duration: Date.now() - s.startTime.getTime(),
      messageCount: s.conversationHistory.length,
    })),
  });
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wsServer = new VoiceWebSocketServer(server);

// Start server
server.listen(config.port, () => {
  logger.info(`Voice Pipeline Server started on port ${config.port}`);
  logger.info(`WebSocket endpoint: ws://localhost:${config.port}/voice-pipeline`);
  logger.info(`Health check: http://localhost:${config.port}/health`);
  logger.info(`Stats: http://localhost:${config.port}/stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
