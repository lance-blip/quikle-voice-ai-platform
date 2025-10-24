/**
 * AI Chatbot Service
 * Gemini 2.5 Pro-powered chatbot for visitor service, sales, and support queries
 */

import { invokeLLM } from '../_core/llm';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  conversationHistory: ChatMessage[];
  userInfo?: {
    name?: string;
    email?: string;
    company?: string;
    intent?: 'sales' | 'support' | 'general';
  };
}

export class ChatbotService {
  private systemPrompt = `You are Quikle Voice AI Assistant, a helpful and knowledgeable chatbot for Quikle Voice AI Platform.

**Your Role:**
- Answer questions about Quikle Voice features, pricing, and capabilities
- Help visitors understand how voice AI can benefit their business
- Guide users through the platform
- Provide technical support for existing customers
- Qualify sales leads and schedule demos

**Key Platform Features to Highlight:**
1. **No-Code Voice AI Builder** - Visual flow editor, drag-and-drop interface
2. **Multi-Tenant Architecture** - Agency/client management, white-labeling
3. **Sub-800ms Latency** - Lightning-fast voice-to-voice response
4. **Voice Cloning** - ElevenLabs & Cartesia integration (1-2 min samples)
5. **Knowledge Base** - Semantic search, document upload, URL scraping
6. **Integrations** - Quikle Innovation Hub (native CRM), HubSpot, Salesforce, Stripe, Calendly
7. **South African Optimization** - Local carriers (Saicom, Wanatel, AVOXI), 30-50% cost savings
8. **Real-time Analytics** - AI-powered sentiment analysis, intent detection, quality scoring
9. **Automations** - Trigger-action workflows, CRM sync, email notifications

**Pricing Tiers:**
- **Free**: 1 agent, 100 min/month, basic voice, no integrations
- **Starter ($49/mo)**: 5 agents, 1,000 min/month, voice cloning, basic integrations
- **Professional ($149/mo)**: 25 agents, 5,000 min/month, all integrations, AI analysis
- **Enterprise (Custom)**: Unlimited agents, custom minutes, white-label, dedicated support

**Common Questions:**
- "How does voice cloning work?" → Upload 1-2 min audio sample, AI creates natural voice
- "What integrations are available?" → CRM (Quikle Hub, HubSpot, Salesforce), Calendar (Calendly, Google), Payment (Stripe), Communication (SendGrid), Automation (Zapier)
- "How is latency so low?" → Optimized STT/TTS pipeline, local SA carriers, edge processing
- "Can I white-label?" → Yes, on Professional and Enterprise plans
- "How do I get started?" → Sign up for free trial, create first agent in visual editor, test with phone number

**Tone & Style:**
- Professional yet friendly
- Concise and clear
- Use bullet points for feature lists
- Provide specific examples
- Always offer next steps (demo, trial, documentation)

**Important:**
- If asked about competitors (Thoughtly, Bland AI, Vapi), acknowledge them but highlight Quikle's unique advantages (SA optimization, native CRM, lower latency)
- For technical support, provide helpful guidance but suggest contacting support@quikle.com for account-specific issues
- For sales inquiries, qualify the lead and offer to schedule a demo
- Always be helpful, never pushy`;

  /**
   * Generate chatbot response using Gemini 2.5 Pro
   */
  async generateResponse(context: ChatContext, userMessage: string): Promise<string> {
    // Add user message to history
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt, timestamp: new Date() },
      ...context.conversationHistory,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ];

    // Build LLM messages
    const llmMessages = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));

    // Call Gemini 2.5 Pro via LLM service
    const response = await invokeLLM({
      messages: llmMessages,
    });

    const assistantMessage = response.choices[0].message.content;
    const contentStr = typeof assistantMessage === 'string' ? assistantMessage : '';

    return contentStr;
  }

  /**
   * Detect user intent from message
   */
  async detectIntent(message: string): Promise<'sales' | 'support' | 'general'> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an intent classifier. Classify user messages as "sales", "support", or "general".',
        },
        {
          role: 'user',
          content: `Classify this message: "${message}"`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'intent_classification',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                enum: ['sales', 'support', 'general'],
                description: 'The classified intent of the message',
              },
            },
            required: ['intent'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{"intent":"general"}';
    const result = JSON.parse(contentStr);
    return result.intent;
  }

  /**
   * Extract user information from conversation
   */
  async extractUserInfo(conversationHistory: ChatMessage[]): Promise<ChatContext['userInfo']> {
    const conversation = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Extract user information (name, email, company) from conversation. Return null for missing fields.',
        },
        {
          role: 'user',
          content: `Extract info from:\n${conversation}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'user_info',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              name: {
                type: ['string', 'null'],
                description: 'User name if mentioned',
              },
              email: {
                type: ['string', 'null'],
                description: 'User email if mentioned',
              },
              company: {
                type: ['string', 'null'],
                description: 'User company if mentioned',
              },
            },
            required: ['name', 'email', 'company'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{"name":null,"email":null,"company":null}';
    const result = JSON.parse(contentStr);
    
    return {
      name: result.name || undefined,
      email: result.email || undefined,
      company: result.company || undefined,
    };
  }

  /**
   * Generate suggested follow-up questions
   */
  async generateSuggestions(context: ChatContext): Promise<string[]> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Generate 3 relevant follow-up questions based on the conversation context.',
        },
        {
          role: 'user',
          content: `Conversation:\n${context.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nGenerate 3 follow-up questions.`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'suggestions',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of 3 follow-up questions',
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['questions'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : '{"questions":[]}';
    const result = JSON.parse(contentStr);
    return result.questions;
  }
}

export const chatbotService = new ChatbotService();

