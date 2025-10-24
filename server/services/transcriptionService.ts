/**
 * Real-time Transcription Service
 * Handles live speech-to-text and AI-powered call analysis
 */

import { invokeLLM } from '../_core/llm';

export interface TranscriptionSegment {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: number;
  confidence: number;
  startTime: number;
  endTime: number;
}

export interface CallAnalysis {
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    score: number; // -1 to 1
    breakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  intent: {
    primary: string;
    confidence: number;
    categories: string[];
  };
  keyPhrases: string[];
  actionItems: string[];
  summary: string;
  qualityScore: number; // 0-100
  insights: {
    customerSatisfaction: number;
    agentPerformance: number;
    issueResolved: boolean;
    followUpRequired: boolean;
  };
}

export class TranscriptionService {
  /**
   * Analyze call sentiment using AI
   */
  async analyzeSentiment(transcript: string): Promise<CallAnalysis['sentiment']> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis expert. Analyze the sentiment of call transcripts and provide detailed scores.',
        },
        {
          role: 'user',
          content: `Analyze the sentiment of this call transcript and return a JSON object with overall sentiment (positive/neutral/negative), score (-1 to 1), and breakdown percentages:\n\n${transcript}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'sentiment_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              overall: {
                type: 'string',
                enum: ['positive', 'neutral', 'negative'],
                description: 'Overall sentiment classification',
              },
              score: {
                type: 'number',
                description: 'Sentiment score from -1 (very negative) to 1 (very positive)',
              },
              breakdown: {
                type: 'object',
                properties: {
                  positive: { type: 'number', description: 'Percentage of positive sentiment' },
                  neutral: { type: 'number', description: 'Percentage of neutral sentiment' },
                  negative: { type: 'number', description: 'Percentage of negative sentiment' },
                },
                required: ['positive', 'neutral', 'negative'],
                additionalProperties: false,
              },
            },
            required: ['overall', 'score', 'breakdown'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{}';
    return JSON.parse(contentStr);
  }

  /**
   * Detect call intent using AI
   */
  async detectIntent(transcript: string): Promise<CallAnalysis['intent']> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an intent detection expert. Identify the primary intent and categories of customer calls.',
        },
        {
          role: 'user',
          content: `Identify the primary intent of this call and categorize it:\n\n${transcript}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'intent_detection',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              primary: {
                type: 'string',
                description: 'Primary intent (e.g., "schedule_appointment", "product_inquiry", "complaint")',
              },
              confidence: {
                type: 'number',
                description: 'Confidence score from 0 to 1',
              },
              categories: {
                type: 'array',
                items: { type: 'string' },
                description: 'Intent categories (e.g., "sales", "support", "billing")',
              },
            },
            required: ['primary', 'confidence', 'categories'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{}';
    return JSON.parse(contentStr);
  }

  /**
   * Extract key phrases from transcript
   */
  async extractKeyPhrases(transcript: string): Promise<string[]> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a key phrase extraction expert. Extract the most important phrases and topics from conversations.',
        },
        {
          role: 'user',
          content: `Extract 5-10 key phrases from this call transcript:\n\n${transcript}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'key_phrases',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              phrases: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of key phrases',
              },
            },
            required: ['phrases'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{"phrases":[]}';
    const result = JSON.parse(contentStr);
    return result.phrases;
  }

  /**
   * Identify action items from call
   */
  async identifyActionItems(transcript: string): Promise<string[]> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an action item extraction expert. Identify specific tasks, commitments, and follow-ups from conversations.',
        },
        {
          role: 'user',
          content: `Identify all action items and follow-ups from this call:\n\n${transcript}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'action_items',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of action items',
              },
            },
            required: ['items'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{"items":[]}';
    const result = JSON.parse(contentStr);
    return result.items;
  }

  /**
   * Generate call summary
   */
  async generateSummary(transcript: string): Promise<string> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a call summarization expert. Create concise, informative summaries of customer calls.',
        },
        {
          role: 'user',
          content: `Provide a concise 2-3 sentence summary of this call:\n\n${transcript}`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === 'string' ? content : '';
  }

  /**
   * Calculate call quality score
   */
  async calculateQualityScore(transcript: string): Promise<number> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a call quality assessment expert. Evaluate call quality based on clarity, professionalism, effectiveness, and customer satisfaction.',
        },
        {
          role: 'user',
          content: `Rate the quality of this call on a scale of 0-100:\n\n${transcript}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'quality_score',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              score: {
                type: 'number',
                description: 'Quality score from 0 to 100',
              },
            },
            required: ['score'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{"score":0}';
    const result = JSON.parse(contentStr);
    return result.score;
  }

  /**
   * Generate comprehensive call insights
   */
  async generateInsights(transcript: string): Promise<CallAnalysis['insights']> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a call analytics expert. Provide detailed insights about customer satisfaction, agent performance, and call outcomes.',
        },
        {
          role: 'user',
          content: `Analyze this call and provide insights:\n\n${transcript}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'call_insights',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              customerSatisfaction: {
                type: 'number',
                description: 'Customer satisfaction score from 0 to 100',
              },
              agentPerformance: {
                type: 'number',
                description: 'Agent performance score from 0 to 100',
              },
              issueResolved: {
                type: 'boolean',
                description: 'Whether the customer issue was resolved',
              },
              followUpRequired: {
                type: 'boolean',
                description: 'Whether follow-up action is required',
              },
            },
            required: ['customerSatisfaction', 'agentPerformance', 'issueResolved', 'followUpRequired'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{}';
    return JSON.parse(contentStr);
  }

  /**
   * Perform complete call analysis
   */
  async analyzeCall(transcript: string): Promise<CallAnalysis> {
    // Run all analyses in parallel for efficiency
    const [sentiment, intent, keyPhrases, actionItems, summary, qualityScore, insights] = await Promise.all([
      this.analyzeSentiment(transcript),
      this.detectIntent(transcript),
      this.extractKeyPhrases(transcript),
      this.identifyActionItems(transcript),
      this.generateSummary(transcript),
      this.calculateQualityScore(transcript),
      this.generateInsights(transcript),
    ]);

    return {
      sentiment,
      intent,
      keyPhrases,
      actionItems,
      summary,
      qualityScore,
      insights,
    };
  }

  /**
   * Process real-time transcription segment
   */
  processSegment(segment: TranscriptionSegment): TranscriptionSegment {
    // Add any real-time processing here (e.g., filtering, formatting)
    return {
      ...segment,
      text: segment.text.trim(),
    };
  }
}

export const transcriptionService = new TranscriptionService();

